# ElderCareDashboard 👵📊

A full-stack real-time dashboard built to monitor elderly care IoT devices using MQTT, Express.js, and React.js. This application helps visualize sensor data from multiple devices to track health conditions, status, and alerts efficiently.

---

## 🚀 Live Demo
🔗 Frontend : [https://elder-care-dashboard.vercel.app/](https://elder-care-dashboard.vercel.app/)
🔗 Backend  : [https://eldercaredashboard.onrender.com/](https://eldercaredashboard.onrender.com/)



---

## 🛠 Tech Stack

| Layer        | Technology Used |
|--------------|-----------------|
| Frontend     | React.js, Material UI (MUI), Recharts, React Router |
| Styling      | Emotion (CSS-in-JS) |
| Backend      | Node.js, Express.js |
| Database     | MySQL (Sequelize ORM) |
| Real-Time    | MQTT.js, WebSocket |
| Auth & Security | JWT, Google OAuth, API Key |
| Deployment   | PM2, Vercel/Render (if used) |

---

## 📌 Features

- 🔐 JWT-protected API routes
- 🔄 Real-time data via MQTT from IoT devices
- 📡 Device status monitoring via GVC topic `GVC/SENSORS/ALL`
- 🗂 Modular code structure for scalability
- ⚙️ Device & status codes configuration
- 🌐 WebSocket server for client interaction
- 📝 Logging via Winston (debug/info/error)

---

## 📁 Folder Structure

```bash
ElderCareDashboard/
│
├── frontend/               # React frontend (MUI, Recharts, Google OAuth)
│   ├── public/
│   ├── src/
│   │   ├── assets/         # Images and icons
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Dashboard, Login, Device Views
│   │   ├── services/       # API calls via axios
│   │   └── App.jsx         # Root component
│   ├── package.json
│   └── .env.example
│
├── backend/                # Node.js backend (Express + MQTT)
│   ├── config/             # Database and MQTT configuration
│   ├── constants/          # Static codes and values
│   ├── controllers/        # Route logic
│   ├── database/           # Sequelize models
│   ├── middleware/         # Auth, error, and logger
│   ├── mqtt/               # MQTT setup and listeners
│   ├── routes/             # Express API routes
│   ├── utils/              # Common utilities
│   ├── websocket/          # WebSocket server setup
│   ├── server.js           # App entry point
│   └── .env.example
│
└── README.md
```

---

## 🔐 Environment Variables

Each side of the app has its own `.env.example` file.

### Backend `.env.example`:
```env
PORT=9000
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
MQTT_HOST=your_mqtt_host
JWT_SECRET=your_jwt_secret
```

### Frontend `.env.example`:
```env
REACT_APP_API_URL=http://localhost:9000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🧪 Run Locally

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

---

## 👤 Author

**Siddhi Dhamnaskar**  
💻 Full Stack Developer | React.js | Node.js | IoT | Material UI  
🔗 [Portfolio](https://siddhi-portfolio.netlify.app) • [GitHub](https://github.com/siddhidhamnaskar) • [LinkedIn](https://linkedin.com/in/siddhi-dhamnaskar)

---

## 📄 License

This project is intended for personal, educational, and portfolio use only.
