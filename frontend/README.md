# 🌌 Frontend - RPS

This is the **React.js frontend** of the Gamified Betting Platform. It brings the magical dark fantasy theme to life, complete with minigames, a confetti-popping achievement system, and custom user profiles.

## 🔧 Built With

- React
- React Router
- Tailwind CSS
- Framer Motion (animations)
- Lucide Icons
- Context API (Auth system)

## 🖼️ Folder Structure

frontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # App pages (Profile, Login, Register, etc.)
│   ├── context/           # Auth context
│   ├── assets/            # Images, sounds, etc.
│   ├── App.js             # Main app component
│   └── index.js           # App entry point

## 🌱 Getting Started

npm install
npm start

### 🌍 Environment Variables

Create a `.env` file:

REACT_APP_API_URL=http://localhost:5000

## ⚙️ Features

- 🧙‍♂️ Magical theme & animations
- 👤 User profile with mood orbs
- 🔥 Ghost mode & emoji-based minigames
- 🏆 Tiered achievements with popups
- 🛒 Store and inventory system
- 📜 Guidebook and rules pages
- 🔐 Login / register / logout flow
- 📱 Responsive design

## 🧪 Dev Tips

- Want to test admin routes? Toggle an `isAdmin` flag in your JWT or context.
- Use the **DevTools Network tab** to check API responses.

---