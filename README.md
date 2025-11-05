 # SlotSwapper

SlotSwapper is a peer-to-peer time-slot scheduling application that lets users mark busy calendar slots as "swappable" and request swaps with other users. When a swap is accepted both slots are exchanged between the two users.

This repository contains a Next.js + TypeScript frontend (app router) and a lightweight backend implemented as Next API routes using MongoDB (Mongoose) for persistence.

---

## Design overview

- Frontend: Next.js (app router) + TypeScript. UI components are organized under `src/components` and pages under `src/app`.
- Backend: Next.js API routes located under `src/app/api/*`. Business logic lives in small Mongoose models (`src/lib/models/*`) and helper modules (`src/lib/*`).
- Database: MongoDB Atlas (Mongoose). A connection helper is in `src/lib/db.ts`.
- Auth: JWT stored as an HttpOnly cookie named `auth_token`. Signup/login endpoints create the token and set the cookie. Server-side code reads the cookie and verifies the token to identify the current user.
- Key entities: User, Event, SwapRequest. Event.status is an enum: `BUSY`, `SWAPPABLE`, `SWAP_PENDING`.

Design choices & rationale

- Use Next.js API routes for a simple fullstack setup that keeps frontend and backend in a single repository.
- JWT in an HttpOnly cookie simplifies protecting app routes and is a common pattern for SPA/Next.js apps.
- Mongoose models provide a quick, typed way to model relationships (events reference owners, swapRequests reference events and users).
- Server-side rendering (app pages) queries the DB directly for pages such as Dashboard, Marketplace, and Requests to keep data fresh and avoid additional client fetch complexity.

---

## Requirements

- Node.js (>= 18 recommended)
- npm
- A MongoDB Atlas connection string (the project contains an example; do NOT commit credentials for production)

---

## Getting started (local)

1. Clone the repo and install dependencies

```powershell
git clone <this-repo>
cd SlotSwapper
npm install
```

2. Create a `.env` file at the repository root with these entries:

```
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
NODE_ENV=development
```

You can use the provided MongoDB Atlas string during local testing, but be cautious: do not leave secrets in public repos.

3. Run the app in development

```powershell
npm run dev
```

By default the `dev` script in this repo uses Next's turbopack and sets the port to `9002` (see `package.json`). If you prefer the standard next dev port, change the script or run `next dev -p 3000`.

4. Type-check (optional / recommended)

```powershell
npm run typecheck
```

5. How to test manually via the UI

- Open the app in the browser at `http://localhost:9002` (or the port you started it on).
- Sign up a new account, then create events in the Dashboard. Mark some events as `SWAPPABLE`.
- Use the Marketplace to view other users' swappable slots and create swap requests.
- Visit Requests page to accept/reject incoming requests.

---

## Environment variables

- MONGODB_URI - MongoDB connection string (MongoDB Atlas). Example:
  - mongodb+srv://<user>:<pw>@cluster0.mongodb.net/?retryWrites=true&w=majority
- JWT_SECRET - Secret used to sign JWTs.

Make sure these are set before running the app.

---

## API Reference

Authentication: signup/login endpoints set an HttpOnly cookie `auth_token` with a signed JWT. All protected routes expect that cookie to be present. You may also pass Cookie header directly for API testing.

Base URL: http://localhost:9002 (or your dev port)

Auth

- POST /api/auth/signup
  - Body: { name, email, password }
  - Response: 201 with created user and cookie `auth_token` set.

- POST /api/auth/login
  - Body: { email, password }
  - Response: 200 with user info and cookie `auth_token` set.

- GET /api/auth/logout
  - Clears the cookie (Set-Cookie Max-Age=0) and returns 200.

Events

- GET /api/events/my
  - Protected. Returns a list of events owned by the current authenticated user.

- POST /api/events/my
  - Protected. Create a new event for the current user.
  - Body: { title, startTime, endTime }

- PUT /api/events/[eventId]/status
  - Protected. Update status of an event the user owns (BUSY or SWAPPABLE). Example body: { status: 'SWAPPABLE' }

- GET /api/events/swappable
  - Protected. Returns all events from other users where status === 'SWAPPABLE'.

Swap requests

- POST /api/swap-requests
  - Protected. Create a new swap request.
  - Body: { mySlotId, theirSlotId }
  - Server verifies both slots exist and are SWAPPABLE, creates a SwapRequest with status PENDING and sets both events to SWAP_PENDING.

- GET /api/swap-requests/my
  - Protected. Returns incoming (where you are requestee) and outgoing (where you are requester) swap requests, populated for UI.

- POST /api/swap-requests/[requestId]/response
  - Protected. Accept or reject a pending swap request where you are the requestee.
  - Body: { accept: true | false }
  - If accept: the two events exchange owners, both set to BUSY, SwapRequest status -> ACCEPTED.
  - If reject: both events set back to SWAPPABLE and SwapRequest status -> REJECTED.

Examples (curl)

1) Signup (store cookies manually for testing):

```bash
curl -i -X POST http://localhost:9002/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password"}'
```

2) Create event (after login, include cookie header):

```bash
curl -i -X POST http://localhost:9002/api/events/my \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<your-token-here>" \
  -d '{"title":"Focus","startTime":"2025-11-10T14:00:00.000Z","endTime":"2025-11-10T15:00:00.000Z"}'
```

3) Request swap

```bash
curl -i -X POST http://localhost:9002/api/swap-requests \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<your-token-here>" \
  -d '{"mySlotId":"<your-event-id>", "theirSlotId":"<their-event-id>"}'
```

Notes: For API testing it's often easier to use Postman (it manages cookies automatically) or to read the `Set-Cookie` header on login responses and re-use that value in the Cookie header for subsequent requests.

---

## Project structure highlights

- src/lib/models - Mongoose models (User, Event, SwapRequest)
- src/app/api - Next API routes for auth, events, swap-requests
- src/app/(app) - App pages (dashboard, marketplace, requests)
- src/components - UI components used by pages
- src/lib - helpers (db connection, auth-utils, actions)

---

## Troubleshooting / common issues

- TypeScript errors after pulling: run `npm run typecheck`. I added small type shims in `src/types/` to ease dev, but if you extend APIs you may need to update these.
- Database connection: ensure `MONGODB_URI` is correct and reachable. If using Atlas, whitelist your IP or enable access from anywhere for quick dev.
- Cookies/auth: the app uses an HttpOnly cookie. Use the browser UI and Postman for easiest testing. If you use curl, set the `Cookie` header manually.

---

## Next steps / improvements (recommended)

- Add unit/integration tests for swap acceptance logic (critical path).
- Add WebSocket (or server-sent events) notifications for real-time updates of incoming requests.
- Add input validation and stronger error responses for API endpoints.
- Add a small script to seed demo users/events for local testing.

---

If anything in this README is unclear or you want me to run the TypeScript checks and fix remaining issues now, tell me and I'll continue iterating.

