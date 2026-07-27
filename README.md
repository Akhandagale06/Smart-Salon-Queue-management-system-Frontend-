# 💈 Salon Queue Management System – Customer Frontend

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Axios](https://img.shields.io/badge/Axios-HTTP_Client-5A29E4?style=for-the-badge&logo=axios)
![i18next](https://img.shields.io/badge/i18next-Multi_Language-26A69A?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A modern customer-facing web application for smart salon appointment booking, live queue tracking, and walk-in management.**

</div>

---

## 📖 Overview

The **Salon Queue Management System – Customer Frontend** is a modern web application that enables customers to easily discover nearby salons, book appointments, join live walk-in queues, monitor their queue position in real time, and receive instant notifications.

Designed with **React 19**, **Vite**, and **Tailwind CSS**, the application delivers a fast, responsive, and user-friendly experience across desktop and mobile devices.

---

# 🚀 Tech Stack

| Category | Technology |
|-----------|------------|
| 🎨 Frontend | React 19 + Vite |
| 💅 Styling | Tailwind CSS v4 |
| 🔄 State Management | React Context API |
| 🌐 HTTP Client | Axios |
| 🌍 Localization | react-i18next |
| 🎯 Icons | Lucide React |
| ⚡ Build Tool | Vite |
| 🧹 Linting | Oxlint |

---

# ✨ Features

## 🔍 Smart Salon Discovery

- Search nearby salons
- Filter by city, services, ratings, and availability
- View salon details and operating hours
- Browse available services and pricing

---

## 📅 Appointment Booking

- Book appointments for future dates
- Select preferred service
- Choose available time slots
- Receive booking confirmation instantly

---

## 🚶 Walk-In Queue Management

- Join live walk-in queues
- Choose your preferred stylist
- Auto stylist assignment
- Receive an estimated waiting time
- View live queue position

---

## ⏱️ Real-Time Queue Tracking

Stay updated throughout your visit.

- Live Queue Position
- Estimated Wait Time
- Queue Status Updates
- "It's Your Turn" Notifications

---

## 🌍 Multi-Language Support

The application supports multiple languages using **react-i18next**.

- 🇬🇧 English
- 🇮🇳 हिन्दी (Hindi)
- 🇮🇳 मराठी (Marathi)

Users can switch languages at any time.

---

## 📱 Telegram Notifications

Receive important updates directly through Telegram.

Notifications include:

- Booking Confirmation
- Queue Position Updates
- "It's Your Turn"
- Appointment Status

---

## 🌓 Theme Support

Choose the appearance you prefer.

- 🌞 Light Mode
- 🌙 Dark Mode

The selected theme is remembered across sessions.

---

## 🔐 Authentication & Profile

Secure user authentication with:

- User Registration
- Login
- Profile Management
- Appointment History
- Saved Preferences

---

# 📂 Project Structure

```text
frontend/
│
├── public/                         # Static assets
│
├── src/
│   ├── assets/                     # Images & Icons
│   │
│   ├── components/                 # Reusable Components
│   │   ├── Header.jsx
│   │   ├── Navigation.jsx
│   │   ├── SalonCard.jsx
│   │   ├── LanguageSelector.jsx
│   │   └── TelegramNoticeModal.jsx
│   │
│   ├── config/                     # Axios Configuration
│   │
│   ├── context/                    # Global Context Providers
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── hooks/                      # Custom Hooks
│   │
│   ├── i18n/                       # Localization Files
│   │   ├── en
│   │   ├── hi
│   │   └── mr
│   │
│   ├── pages/                      # Application Pages
│   │   ├── Salons.jsx
│   │   ├── SalonDetail.jsx
│   │   ├── WalkInQueue.jsx
│   │   ├── Appointments.jsx
│   │   ├── AppointmentDetail.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.jsx
│   │   └── Notifications.jsx
│   │
│   ├── App.jsx                     # Main Application
│   └── main.jsx                    # Entry Point
│
├── .env
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

# 📱 User Workflow

```text
User Opens Website
        │
        ▼
Login / Register
        │
        ▼
Browse Nearby Salons
        │
        ▼
Select Salon
        │
        ▼
Choose Service
        │
        ├───────────────┐
        ▼               ▼
 Book Appointment   Join Walk-In Queue
        │               │
        ▼               ▼
 Track Queue Position
        │
        ▼
 Receive Notifications
        │
        ▼
 Visit Salon
```

---

# 🌟 Highlights

- ⚡ Lightning Fast React 19 + Vite
- 📍 Smart Salon Discovery
- 📅 Online Appointment Booking
- 🚶 Live Walk-In Queue
- ⏱️ Real-Time Queue Tracking
- 🌍 Multi-Language Support
- 📱 Telegram Notifications
- 🌙 Dark & Light Themes
- 🔐 Secure Authentication
- 📱 Responsive Design

---

# 📦 Installation

```bash
# Navigate to frontend directory
cd frontend

# Install Dependencies
npm install

# Start Development Server
npm run dev
```

---

<div align="center">

## © 2026 Salon Queue Management System

**All Rights Reserved**

Made with ❤️ by **Aditya Khandagale**

⭐ If you found this project useful, consider giving it a **Star** on GitHub.

</div>
