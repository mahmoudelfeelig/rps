# Frontend

React app for the RPS project.

## Stack

- React
- React Router
- Tailwind CSS
- Framer Motion
- Lucide icons
- Auth context

## Layout

```text
frontend/
├── public/
│   ├── assets/
│   │   ├── brand/
│   │   ├── avatars/
│   │   └── sounds/
│   └── favicon.ico
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── core/
│   │   ├── user/
│   │   ├── features/
│   │   ├── games/
│   │   ├── bets/
│   │   └── virtual-pet/
│   ├── context/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
```

## Conventions

- Put shared UI in `src/components`.
- Keep page-specific helpers next to the page or feature they belong to.
- Use `public/assets/<purpose>/` for static files that must be served directly.
- Do not keep duplicate copies of the same asset in `src/assets` and `public`.
- Use lowercase kebab-case for feature folders that get their own subtree.

## Notes

- `public/assets/brand/logo.png` is the app logo.
- `public/assets/avatars/default-avatar.png` is the shared profile fallback.
- `public/assets/sounds/success.mp3` is the shared success sound.
- Use Node 20 or newer.
- On Windows, run the project from WSL2 or a native terminal. WSL1 breaks `npm` here before the app can build.
- Before editing, prefer `npm run lint` and `npm run build` from `frontend/` when the local runtime supports Node.
