# 🏠 StayEasy - Property Rental System

A modern Airbnb-inspired property rental platform built with the MERN stack + TypeScript.

## 🌟 Features

- 👥 Multi-role authentication (Admin, Host, Guest)
- 🏠 Property listing with image uploads
- 📅 Booking system with host confirmation
- ⭐ Review system
- 📊 Admin dashboard
- 🎨 Modern responsive UI

## 🛠️ Tech Stack

**Frontend:** React 18 + TypeScript + Vite  
**Backend:** Node.js + Express + MongoDB  
**Auth:** JWT + Bcrypt  
**Deployment:** Vercel (Frontend) + Render (Backend)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/property-rental.git
cd property-rental

# Backend setup
cd backend
npm install
# Create .env file with MONGO_URI, JWT_SECRET, PORT
npm run dev

# Frontend setup
cd ../frontend
npm install
npm run dev