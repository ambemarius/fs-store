# 👟 Shore Store — MarketShoe SmartCatalog

A simple shoe-sales catalog. Customers browse shoes and order via WhatsApp; the shop owner manages inventory from an admin dashboard.

- **Backend** — Node/Express + MongoDB (Mongoose) + Cloudinary image hosting (project root)
- **Frontend** — React + Vite + Tailwind CSS (`/frontend`)

---

## Recent Updates & Enhancements
- **Product Deletion**: Implemented product deletion. When an admin deletes a shoe listing, its associated images are automatically deleted from Cloudinary, freeing up cloud storage space.
- **Test Coverage**: Created integration/unit test suites for both the backend (using Node's native test runner + `supertest`) and frontend (using `vitest` + React Testing Library).
- **OpenAPI Specification**: Added a complete Swagger/OpenAPI spec (`openapi.yaml`) mapping all backend routes, requests, and schemas.
- **Workspace Cleanup**: Deleted leftover starter template assets and unused development files to optimize project space.

---

## Prerequisites
- Node.js 18+ (tested on Node v25.1.0)
- A MongoDB Atlas connection string and Cloudinary account (already configured in `config/.env`)

## Setup
```bash
# 1. Backend dependencies (from the project root)
npm install --legacy-peer-deps

# 2. Frontend dependencies
cd frontend
npm install --legacy-peer-deps
```

The backend reads secrets from `config/.env` (git-ignored). It contains:
```
PORT=2121
MONGO_URI=<your mongodb atlas uri>
CLOUDINARY_CLOUD_NAME=<...>
CLOUDINARY_API_KEY=<...>
CLOUDINARY_API_SECRET=<...>
```

---

## Running the Application (use two terminals)

```bash
# Terminal 1 — Start the backend API on http://localhost:2121
npm start

# Terminal 2 — Start the frontend on http://localhost:5173
cd frontend
npm run dev
```

Then open **http://localhost:5173**. The Vite dev server proxies `/api/*` calls to the backend automatically.

---

## Running the Tests

### 1. Backend Tests
From the project **root** directory, run:
```bash
npm test
```
* Runs Node's native test runner against `tests/api.test.js` using mocks (no database or external network connections required).

### 2. Frontend Tests
From the **`/frontend`** directory, run:
```bash
npm test
```
* Runs Vitest to execute React component rendering tests in a `jsdom` environment.

---

## API Endpoints

A complete interactive definition is available in **[openapi.yaml](openapi.yaml)** (viewable by pasting it into [editor.swagger.io](https://editor.swagger.io)).

| Method | Route                       | Auth Required | Purpose                                             |
| ------ | --------------------------- | ------------- | --------------------------------------------------- |
| GET    | `/api/products`             | Public        | List shoes (optional: `?category=`, `?size=`)       |
| GET    | `/api/products/:id`         | Public        | Get detailed info for one shoe                      |
| POST   | `/api/products`             | Admin         | Add a new shoe (multipart/form-data, `images`)      |
| PATCH  | `/api/products/:id/toggle`  | Admin         | Toggle Availability (Available / Sold Out)          |
| DELETE | `/api/products/:id`         | Admin         | Delete a shoe listing & remove its Cloudinary files |
| POST   | `/api/auth/register`        | Public        | Register a new customer / admin account             |
| POST   | `/api/auth/login`           | Public        | Log in and initiate session                         |
| GET    | `/api/auth/me`              | Session       | Get info of current logged-in user                  |
| POST   | `/api/auth/logout`          | Session       | Log out and end session                             |

---

## Before going live
- In `frontend/src/App.jsx`, set `VENDOR_WHATSAPP` to the shop owner's real WhatsApp number (international format, no `+`).
- Treat `config/.env` as secret — rotate the keys if it was ever shared.
