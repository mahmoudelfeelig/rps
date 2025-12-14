# Backend - RPS

This folder contains the **Express.js backend** of the gamified betting platform. It handles authentication, user profiles, bets, achievements, tasks, store items, and more.

## Technologies Used

- Node.js
- Express
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- Multer (for image upload)
- Bcrypt (for password hashing)

## Folder Structure

```text
backend/
├── models/            # Mongoose schemas (User, Bet, Task, etc.)
├── routes/            # Express routers
├── controllers/       # Logic for handling routes
├── middleware/        # Auth and error middleware
├── uploads/           # Profile image uploads
├── .env               # Secrets and database URI
├── index.js           # App entry point
```

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
```

## Scripts

```bash
npm run dev        # Start dev server with nodemon
npm start          # Start production server
```

## Features

- JWT-based authentication
- User achievement tracking
- Balance manipulation & betting odds
- Tasks & achievements with criteria
- Store item CRUD support
- Admin panel endpoints

## API Overview

| Endpoint            | Method | Description         |
|---------------------|--------|---------------------|
| /api/auth/register  | POST   | Register new user   |
| /api/auth/login     | POST   | Login and get JWT   |
| /api/user/update    | POST   | Update profile data |
| /api/user/delete    | DELETE | Delete account      |
| /api/achievement    | GET    | Fetch achievements  |
| /api/task           | GET    | Fetch tasks         |
| /api/store          | GET    | Get store items     |
| /api/bet            | CRUD   | Full betting flow   |
