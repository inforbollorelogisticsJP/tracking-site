const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

// ---------------- SUPABASE ----------------
const supabase = createClient(
  "https://plizwnwtaqrtfybzptkr.supabase.co",
  "sb_publishable_Vx0mtC2vIj-_RH1MDYlAqw_3OtHcuTL"
);

// ---------------- ADMIN ----------------
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

// ---------------- ROUTE ----------------
const route = [
  { status: "Shipment Registered", location: "Mexico City" },
  { status: "Health Check Completed", location: "Veterinary Facility" },
  { status: "In Transit", location: "Guadalajara Hub" },
  { status: "Arrived at Sorting Center", location: "Monterrey Facility" },
  { status: "Out for Delivery", location: "Local Distribution" },
  { status: "Delivered", location: "Destination City" }
];

// ---------------- GENERATE CODE ----------------
function generateCode() {
  const d = new Date();
  return `BLM-${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}-${Math.floor(Math.random() * 100000)}`;
}

// ---------------- TEST ROUTE ----------------
app.get("/", (req, res) => {
  res.send("Tracking API is running 🚀");
});

// ---------------- ADMIN LOGIN ----------------
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body || {};

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ success: true });
  }

  return res.status(401).json({ success: false });
});

// ---------------- CREATE SHIPMENT ----------------
app.post("/create", async (req, res) => {
  try {
    const code = generateCode();

    const { error } = await supabase.from("tracking").insert([
      {
        code,
        step: 0,
        progress: 0,
        history: [route[0]],
        lastUpdate: Date.now()
      }
    ]);

    if (error) throw error;

    res.json({ code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create tracking" });
  }
});

// ---------------- TRACK SHIPMENT ----------------
app.get("/track/:code", async (req, res) => {
  try {
    const code = req.params.code;

    const { data, error } = await supabase
      .from("tracking")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Tracking not found" });
    }

    const now = Date.now();

    if (data.step < route.length - 1 && now - data.lastUpdate >= 5000) {
      data.step++;
      data.history.push(route[data.step]);
      data.progress = Math.round((data.step / (route.length - 1)) * 100);
      data.lastUpdate = now;

      await supabase
        .from("tracking")
        .update({
          step: data.step,
          progress: data.progress,
          history: data.history,
          lastUpdate: data.lastUpdate
        })
        .eq("code", code);
    }

    res.json({
      code: data.code,
      progress: data.progress,
      current: data.history[data.history.length - 1],
      history: data.history
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Tracking error" });
  }
});

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});