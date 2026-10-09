# Crumb frontend

## Setup
1. Start the backend (see `../backend/README.md`) and MongoDB.
2. `cp .env.example .env`, then set `VITE_API_URL` if the API is not at localhost:5000.
3. `npm install` and `npm run dev`; Vite serves the app at `http://localhost:5173`.

For the containerized full stack, use the root `compose.yml` and open `http://localhost:8080`; Nginx serves the frontend and proxies `/api` to the backend container.

Signed-in customers and restaurant owners get live order alerts in the header notification menu. The notification list is persisted by the API and reloads when they sign back in; browser push notifications while the app is closed are not enabled.

For Google sign-in, create a Google OAuth **Web application** client, allow `http://localhost` and `http://localhost:5173` as authorized JavaScript origins, and copy its client ID to `VITE_GOOGLE_CLIENT_ID` in `.env`. Configure the same value as `GOOGLE_CLIENT_ID` in `../backend/.env`, then restart both servers. See `../backend/README.md` for details.

For a production bundle, run `npm run build` and deploy `dist/` with the backend API URL configured at build time. Demo accounts: `hello@crumb.demo` / `crumb123`; admin `admin@crumb.demo` / `admin123`; restaurant owner `owner@crumb.demo` / `owner123` (Little Sicily). Razorpay Checkout uses the public key ID returned from the backend; add the private test keys to `backend/.env` as described in `../backend/README.md`.

## Project structure

Application code is organized by responsibility under `src/`:

- `components/` contains reusable interface pieces; `components/admin/` holds admin-only panels.
- `pages/` contains route-level screens.
- `hooks/` contains reusable stateful browser behavior, including current-location lookup.
- `services/` contains the configured HTTP client.
- `data/` contains local demo and fallback data.
- `utils/` contains small formatting and transformation helpers.
- `App.jsx` wires shared app state, layout, and routes; `styles.css` contains the shared design system.

## Food image library

The app's sample restaurants, dishes, hero, and fallback imagery are stored locally in
`public/images/food/` (55 optimized JPEGs). The owner and admin image fields suggest paths from
this library; use a path such as `/images/food/photo-1513104890138-7c749659a591.jpg` or enter a
custom image URL. To refresh the seeded MongoDB restaurant and menu records with local paths,
run `npm run seed` from `../backend/` after configuring its environment.

Run `npm run format` to format frontend source files, or `npm run format:check` to check formatting.
# crumb-frontend
# crumb-frontend
# crumb-frontend
