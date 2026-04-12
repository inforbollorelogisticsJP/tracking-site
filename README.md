# 🚚 Tracking Site (Bolloré Logistics Clone)

This is a shipment tracking system built with:

- Node.js + Express
- Supabase backend
- HTML/CSS/JS frontend

## Features
- Admin login system
- Create tracking numbers
- Live shipment tracking
- Auto movement simulation
- API for tracking updates

## API Routes

### Admin Login
POST /admin/login

### Create Shipment
POST /create

### Track Shipment
GET /track/:code

## Run Locally

```bash
npm install
node server.js
