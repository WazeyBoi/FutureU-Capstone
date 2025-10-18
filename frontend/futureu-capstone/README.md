# FutureU Frontend (React + Vite)

## API configuration (no more Mixed Content)

- The app now uses a relative base path for API calls: `/api`.
- In development, Vite proxies `/api` to your backend (default `http://localhost:8080`).
- In production on Vercel, `vercel.json` rewrites `/api/*` to the EC2 backend.

This keeps the browser on HTTPS and avoids errors like: "Mixed Content: page loaded over HTTPS but requested insecure HTTP".

### Env variables

- `VITE_DEV_API_TARGET` (dev only): URL of your local backend. Default: `http://localhost:8080`.
- `VITE_API_BASE` (optional): Override API base. Default: `/api`. You generally shouldn’t set this in production on Vercel.
- `VITE_BASE_PATH` (optional): Base path for the app. Default: `/`.

Create a `.env.local` in this folder for dev:

```
VITE_DEV_API_TARGET=http://localhost:8080
```

### Cookie-based auth through proxy

Because `/api` is same-origin for the browser, no CORS preflight is needed. If the backend sets cookies, prefer omitting the `Domain` attribute so the cookie is set for the Vercel domain in production (and for `localhost` during dev). The proxy forwards cookies to the backend.

Ensure cookies are set with `Secure; SameSite=None` when needed.

## Vercel config

`vercel.json` is included and rewrites `/api/:path*` to the EC2 backend. If your backend host changes, update it there.

## Scripts

- `npm run dev` – start Vite dev server with API proxy
- `npm run build` – production build
- `npm run preview` – preview the production build locally

## Notes

- Large bundles are expected due to assets; consider code-splitting to optimize.

