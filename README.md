# ElderCareDashboard 👵📊

A full-stack real-time dashboard built to monitor elderly care IoT devices using MQTT, Express.js, and React.js. This application helps visualize sensor data from multiple devices to track health conditions, status, and alerts efficiently.

---

## 🚀 Live Demo
*Add link if deployed (e.g. Render, Vercel)*

---

## 🛠 Tech Stack

| Category     | Technology |
|--------------|------------|
| Frontend     | React.js, Tailwind CSS |
| Backend      | Node.js, Express.js |
| Database     | MySQL (via Sequelize) |
| Real-Time    | MQTT.js (IoT integration) |
| Auth & Security | JWT, API Key, CORS |
| Dev Tools    | PM2, Morgan, Winston |

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
├── config/              # Database & MQTT Config
├── constants/           # Common constant values
├── controllers/         # Business logic
├── database/            # Sequelize models & index
├── middleware/          # Auth, Logging, etc.
├── mqtt/                # MQTT connection & subscription logic
├── routes/              # API routes
├── utils/               # Utilities (API key, topics)
├── websocket/           # WebSocket server setup
├── logs/                # Log output (Winston)
├── .env.example         # Environment config sample
└── server.js            # App entry point
