# RPS

Welcome to **RPS**, a fun, interactive web application where users can place bets, earn achievements, purchase items, complete tasks, and unlock easter eggs, all with a dark magical theme. It features a full-stack system with a React frontend and a Node.js/Express backend, connected to a MongoDB database.

## Project Structure

```text
/
├── backend/         # Express + MongoDB backend
├── frontend/        # React.js frontend
├── README.md        # Project overview (this file)
├── .env             # Environment variables (not committed)
```

## Getting Started

To run this project locally, follow the steps below.

### 1. Clone the repository

```bash
git clone https://github.com/mahmoudelfeelig/rps.git
cd rps
```

### 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment setup

Create a `.env` file in both `backend/` and `frontend/` directories with the necessary environment variables. See each subdirectory README for details.

### 4. Start the app

In one terminal window:

```bash
cd backend
npm run dev
```

In another terminal window:

```bash
cd frontend
npm start
```

## Features

- Magical dark-themed UI/UX
- Custom betting with odds
- Task and achievement system
- Interactive minigames and idle features
- Store with item purchases
- Easter eggs
- Public profiles with editable user data
- Auth system with JWT and protected routes

## Subdirectories

- `backend/`: API, authentication, MongoDB models
- `frontend/`: React SPA with dark fantasy UI
