# 👟 MarketShoe SmartCatalog — Frontend

The customer-facing storefront and the owner's admin dashboard for the Shore Store
shoe shop. Built with **React + Vite + Tailwind CSS v4**, it talks to the Express
backend that lives in the project root (`../`).

- **Storefront** — customers browse shoes, filter by category, and order via WhatsApp.
- **Dashboard** — the shop owner adds shoes (with images) and toggles Available / Sold Out.

---

## 1. Prerequisites

- **Node.js 18+** (you have v25) and npm.
- The **backend must be running** for the app to show real data — see [§6 Testing the backend](#6-testing-the-backend).

---

## 2. Install & run

```bash
# from this folder (shore-store/frontend)
npm install        # install dependencies (only needed once, or after package.json changes)
npm run dev        # start the dev server → http://localhost:5173
```

Open **http://localhost:5173** in your browser. Use the **"Go to Admin Dashboard"**
button (top-right) to switch between the customer catalog and the owner dashboard.

> The frontend and backend run as **two separate servers**. Start the backend first
> (`npm start` in the project root), then the frontend here.

---

## 3. The npm scripts (what each command does)

These live under `"scripts"` in `package.json`. Run them with `npm run <name>`.

| Command | What it does | When you use it |
| --- | --- | --- |
| `npm run dev` | Starts the Vite dev server with hot-reload on port 5173. Edits appear instantly. | Day-to-day development. |
| `npm start` | Alias for `dev`. | Same as above. |
| `npm run build` | Compiles an optimized production bundle into `dist/`. | When deploying / going live. |
| `npm run preview` | Serves the already-built `dist/` folder locally to preview the production build. | Sanity-check a build before deploy. |
| `npm run serve` | Same as preview but on port 4173. | Preview on a fixed port. |
| `npm run lint` | Runs ESLint over the code to flag mistakes (unused vars, bad hooks, etc.). | Before committing. |

---

## 4. The packages (what each dependency is for)

### Runtime dependencies (shipped to the browser — `"dependencies"`)

| Package | Importance / what it does |
| --- | --- |
| **react** | The core UI library. Lets us build the page out of components (`Storefront`, `Dashboard`, `ProductImage`) and re-render them when data changes (the `useState` / `useEffect` hooks in `App.jsx`). |
| **react-dom** | The bridge that actually renders React components into the real browser page. `main.jsx` uses `react-dom/client`'s `createRoot` to mount the app into `<div id="root">`. |
| **axios** | The HTTP client used in `src/api.js` to call the backend (`GET /api/products`, `POST /api/products`, etc.). Chosen over raw `fetch` for simpler JSON handling and base-URL config. |
| **lucide-react** | The icon set. Provides the `ShoppingBag`, `Plus`, `Loader2`, `RefreshCw`, and `ImageOff` icons used across the UI. |

### Development dependencies (build tools only — `"devDependencies"`)

| Package | Importance / what it does |
| --- | --- |
| **vite** | The build tool + dev server. Gives instant startup, hot-reload during `npm run dev`, and the optimized production bundle on `npm run build`. |
| **@vitejs/plugin-react** | Teaches Vite how to understand React (JSX) and enables Fast Refresh (component state survives edits). Registered in `vite.config.js`. |
| **tailwindcss** | The CSS framework. All the `className="bg-white p-6 rounded-xl…"` utility classes you see in `App.jsx` come from Tailwind. |
| **@tailwindcss/postcss** | The Tailwind v4 PostCSS plugin — the piece that actually turns those utility classes into real CSS during the build. Registered in `postcss.config.js`. |
| **postcss** | The CSS-processing engine that Tailwind and autoprefixer plug into. Vite runs it automatically. |
| **autoprefixer** | Adds vendor prefixes (`-webkit-`, etc.) so styles work across more browsers. |
| **eslint** | The linter. Catches bugs and bad patterns when you run `npm run lint`. Configured in `eslint.config.js`. |

---

## 5. The files (importance of each)

### Config files (project root of `frontend/`)

| File | Importance |
| --- | --- |
| **package.json** | The project manifest: its name, scripts, and the list of packages above. The single source of truth for `npm install`. |
| **package-lock.json** | Locks the exact versions of every installed package so installs are reproducible. Auto-managed — don't edit by hand. |
| **vite.config.js** | Vite's settings. Three important things here: registers the React plugin; **proxies `/api` → `http://localhost:2121`** so the frontend can call the backend with no CORS issues; and defines the **build rules** (output folder, browser target, and `manualChunks` that split React/vendor code for better caching). |
| **tailwind.config.js** | Tailwind's design tokens — your brand colors, fonts, and layout sizes (`maxWidth.catalog`, `borderRadius.card`). Edit this to re-theme the whole app. |
| **postcss.config.js** | Tells PostCSS to run Tailwind + autoprefixer over the CSS. This is what makes Tailwind classes actually produce styles. |
| **eslint.config.js** | The linting rules (recommended JS rules + React Hooks + React Refresh). |
| **index.html** | The single HTML page the whole app loads into. Contains `<div id="root">` and the `<script src="/src/main.jsx">` that boots React. Also sets the browser-tab title. |
| **.gitignore** | Tells git which files to never commit (`node_modules`, `dist`, etc.). |

### Source code (`src/`)

| File | Importance |
| --- | --- |
| **main.jsx** | The entry point. Mounts `<App />` into the page and imports the global stylesheet. |
| **App.jsx** | **The whole app.** Holds the `Storefront` (catalog + WhatsApp ordering), the `Dashboard` (add shoe + inventory toggle), and the top navbar that switches between them. ⚠️ Set `VENDOR_WHATSAPP` here to the shop's real number before going live. |
| **api.js** | The single place that talks to the backend. Wraps every API call (`getProducts`, `getProductById`, `createProduct`, `toggleAvailability`) with axios. If the backend URL changes, you only edit it here. |
| **index.css** | The global stylesheet. Imports Tailwind (`@import "tailwindcss"`) and loads the JS theme (`@config "../tailwind.config.js"`). |
| **App.css** | Leftover styling from the original Vite starter template. **Not imported anywhere** — safe to delete. |
| **assets/** (`hero.png`, `react.svg`, `vite.svg`) | Leftover images from the Vite starter. Currently unused — safe to delete. |

### `public/`

| File | Importance |
| --- | --- |
| **favicon.svg** | The little icon in the browser tab (referenced by `index.html`). |
| **icons.svg** | A spare SVG asset from the starter; not currently referenced. |

Anything in `public/` is served as-is at the site root (e.g. `public/favicon.svg` → `/favicon.svg`).

---

## 6. Testing the backend

The frontend is useless without the API, so test the backend first.

**Start it** (in a separate terminal, from the project root `../`):
```bash
cd ..
npm start
```
You should see:
```
Server blazing on port 2121
MongoDB Connected: ...
```

**Quick checks** (in another terminal):
```bash
# Should return: Shoe Smart Catalog API is running smoothly...
curl http://localhost:2121/

# Should return a JSON array of shoes ([] if none added yet)
curl http://localhost:2121/api/products
```

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/products` | GET | List shoes (supports `?category=Sneakers`, `?size=42`) |
| `/api/products/:id` | GET | Get one shoe |
| `/api/products` | POST | Add a shoe (multipart form with `images` files) |
| `/api/products/:id/toggle` | PATCH | Toggle Available / Sold Out |

If `curl http://localhost:2121/api/products` returns `[]` with the server connected, the backend is healthy.

---

## 7. Testing the frontend

1. **Backend running?** Confirm §6 first.
2. **Start the frontend:** `npm run dev`, then open http://localhost:5173.
3. **Storefront checks:**
   - The page loads without the red "Could not load shoes. Is the backend running?" error.
   - Category buttons (All / Sneakers / Formal …) filter the list.
   - With no products yet, you see the empty-state message.
4. **Dashboard checks** (click "Go to Admin Dashboard"):
   - Fill in name, price, category, sizes (e.g. `41, 42, 43`), pick 1–4 images, click **Add shoe**.
   - A green success message appears and the shoe shows up under **Current inventory**.
   - Switch back to the storefront — the new shoe is now visible.
   - Click the **Available / Sold Out** pill to toggle a shoe's status.
5. **WhatsApp check:** on a shoe card, click **Order on WhatsApp** — it should open WhatsApp with a prefilled order message. (Set `VENDOR_WHATSAPP` in `App.jsx` to your real number for this to reach you.)
6. **Build check** (optional, before deploying):
   ```bash
   npm run build      # should finish with "✓ built in …"
   npm run preview    # open the shown URL and verify the built app works
   ```
7. **Lint check** (optional): `npm run lint` — should report no errors.

---

## 8. Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| Red "Could not load shoes" banner | Backend isn't running. Start it with `npm start` in the project root. |
| Images don't upload / "Server Error" on Add shoe | Cloudinary keys missing or wrong in `../config/.env`. |
| `npm run dev` fails to start | Delete `node_modules` and run `npm install` again. |
| WhatsApp opens the wrong/placeholder number | Update `VENDOR_WHATSAPP` in `src/App.jsx`. |
| Port 5173 already in use | A previous dev server is still running — stop it, or Vite will offer another port. |
