# Crumb frontend

## Setup
1. Start the backend (see `../backend/README.md`) and MongoDB.
2. `cp .env.example .env`, then set `VITE_API_URL` if the API is not at localhost:5000.
3. `npm install` and `npm run dev`; Vite serves the app at `http://localhost:5173`.

For Google sign-in, create a Google OAuth **Web application** client, allow `http://localhost` and `http://localhost:5173` as authorized JavaScript origins, and copy its client ID to `VITE_GOOGLE_CLIENT_ID` in `.env`. Configure the same value as `GOOGLE_CLIENT_ID` in `../backend/.env`, then restart both servers. See `../backend/README.md` for details.

For a production bundle, run `npm run build` and deploy `dist/` with the backend API URL configured at build time. Demo accounts: `hello@crumb.demo` / `crumb123`; admin `admin@crumb.demo` / `admin123`.

## Project structure

Application code is organized by responsibility under `src/`:

- `components/` contains reusable interface pieces; `components/admin/` holds admin-only panels.
- `pages/` contains route-level screens.
- `hooks/` contains reusable stateful browser behavior, including current-location lookup.
- `services/` contains the configured HTTP client.
- `data/` contains local demo and fallback data.
- `utils/` contains small formatting and transformation helpers.
- `App.jsx` wires shared app state, layout, and routes; `styles.css` contains the shared design system.

Run `npm run format` to format frontend source files, or `npm run format:check` to check formatting.
# crumb-frontend
# crumb-frontend
# crumb-frontend
