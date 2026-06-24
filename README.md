# RPS

RPS is a full-stack betting and arcade app with a React frontend, Express API, and MongoDB backend.

## Layout

- `backend/` contains the API, models, routes, jobs, and seeders.
- `frontend/` contains the React app and static assets.

## Local Setup

- Use Node 20 or newer.
- On Windows, use WSL2 or a native terminal. This workspace is currently on WSL1, which prevents `npm` from running correctly here.
- Install dependencies in both `backend/` and `frontend/`.
- Start the backend and frontend separately during development.

## Economy

- Market assets live in `backend/config/marketAssets.js`.
- Full economy bots live in `backend/config/economyBots.js`.
- Bots are real user records marked with `isBot: true`; they earn, play, buy store items, trade assets, and unlock rewards.
- Set `ALPHA_VANTAGE_API_KEY` to enable external stock and crypto pricing.
- Set `ECONOMY_BOTS_ENABLED=false` or `BOT_SIMULATION_ENABLED=false` to pause autonomous bot activity.

## Asset Rules

- Use `frontend/public/assets/brand/` for app branding.
- Use `frontend/public/assets/avatars/` for shared profile images.
- Use `frontend/public/assets/sounds/` for shared audio.
- Keep feature-specific assets near the feature that uses them.

## Frontend Notes

- Page-specific components should live next to the page they support.
- Keep folder names lowercase and purpose-based.
- Avoid duplicate copies of the same asset in `src/` and `public/`.
