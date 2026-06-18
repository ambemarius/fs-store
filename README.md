# 👟 Shore Store — MarketShoe SmartCatalog

A simple shoe-sales catalog. Customers browse shoes and order via WhatsApp;
the shop owner manages inventory from an admin dashboard.

- **Backend** — Node/Express + MongoDB (Mongoose) + Cloudinary image hosting (project root)
- **Frontend** — React + Vite + Tailwind CSS (`/frontend`)

## Prerequisites

- Node.js 18+
- A MongoDB Atlas connection string and Cloudinary account (already configured in `config/.env`)

## Setup

```bash
# 1. Backend dependencies (from the project root)
npm install

# 2. Frontend dependencies
cd frontend
npm install
```

The backend reads secrets from `config/.env` (git-ignored). It must contain:

```
PORT=2121
MONGO_URI=<your mongodb atlas uri>
CLOUDINARY_CLOUD_NAME=<...>
CLOUDINARY_API_KEY=<...>
CLOUDINARY_API_SECRET=<...>
```

## Running (use two terminals)

```bash
# Terminal 1 — backend API on http://localhost:2121
npm start

# Terminal 2 — frontend on http://localhost:5173
cd frontend
npm run dev
```

Then open **http://localhost:5173**. The Vite dev server proxies `/api/*`
calls to the backend automatically, so no CORS setup is needed.

## API endpoints

| Method | Route                       | Purpose                          |
| ------ | --------------------------- | -------------------------------- |
| GET    | `/api/products`             | List shoes (`?category=`, `?size=`) |
| GET    | `/api/products/:id`         | Get one shoe                     |
| POST   | `/api/products`             | Add a shoe (multipart, `images`) |
| PATCH  | `/api/products/:id/toggle`  | Toggle Available / Sold Out      |

## Before going live

- In `frontend/src/App.jsx`, set `VENDOR_WHATSAPP` to the shop owner's real
  WhatsApp number (international format, no `+`).
- Treat `config/.env` as secret — rotate the keys if it was ever shared.
