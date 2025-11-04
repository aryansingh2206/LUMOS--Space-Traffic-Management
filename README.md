
# 🌌 Lumos — Satellite Collision Prediction & Space Traffic Dashboard

> “Because even satellites need traffic control.”

Lumos is an intelligent **space traffic management dashboard** that predicts potential **satellite collisions**, analyzes **risk levels**, and visualizes **orbital activity** — all in real time.

Built with **React + Vite** on the frontend and a **Node.js + Express + MongoDB** backend, Lumos combines live telemetry analysis, socket-driven alerts, and an elegant UI for aerospace operations and enthusiasts alike 🚀.

---

## 🛰️ Features

✨ **Real-Time Collision Alerts**
Receive live notifications when two or more satellites enter a potential collision corridor.

📊 **Interactive Dashboard**
Visualize active satellites, risk zones, and time-to-impact predictions in one intuitive interface.

🧠 **AI-Powered Risk Assessment** *(coming soon)*
Integrates with machine learning models to predict long-term orbital instability.

💬 **Socket-based Event Streaming**
Stay up to date as new telemetry arrives, without refreshing.

🧾 **Authentication & User Profiles**
Secure JWT-based login system, personalized dashboards, and custom risk filters.

🌍 **Cloud Deployment**
Deployed on [Render](https://render.com) with auto-scaling backend and static client hosting.

---

## 🧰 Tech Stack

| Layer             | Technology                 |
| ----------------- | -------------------------- |
| **Frontend**      | React + Vite + TypeScript  |
| **Backend**       | Node.js + Express          |
| **Database**      | MongoDB (Atlas)            |
| **Communication** | Socket.IO                  |
| **Build Tools**   | Vite, TypeScript, Prettier |
| **Deployment**    | Render Cloud Platform      |

---

## 🚀 Getting Started (Local Setup)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/lumos.git
cd lumos
```

### 2️⃣ Install dependencies

```bash
npm ci
```

### 3️⃣ Create a `.env` file

```bash
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/lumos
PORT=8080
```

### 4️⃣ Start the dev server

```bash
npm run dev
```

> Runs the Vite dev server on [http://localhost:5173](http://localhost:5173)

### 5️⃣ Build for production

```bash
npm run build
```

### 6️⃣ Run the compiled server

```bash
npm run start
```

> Starts the Express backend from the `dist/server` bundle.

---

## ☁️ Deployment on Render

### 🧱 Build Command

```bash
npm ci && npm run build
```

### 🚀 Start Command

```bash
npm run start
```

### ⚙️ Environment Variables

| Key           | Description                                     |
| ------------- | ----------------------------------------------- |
| `MONGODB_URI` | MongoDB Atlas connection string                 |
| `PORT`        | Port assigned by Render (handled automatically) |

> Tip: Render automatically assigns a port to `process.env.PORT`, so don’t hardcode it!

---

## 📦 Project Scripts

| Script                  | Description                      |
| ----------------------- | -------------------------------- |
| `npm run dev`           | Launches Vite development server |
| `npm run build`         | Builds both client and server    |
| `npm run start`         | Starts production server         |
| `npm run test`          | Runs tests via Vitest            |
| `npm run format.fix`    | Formats code with Prettier       |
| `npm run mongo:migrate` | Migrates JSON data into MongoDB  |

---

## 🧠 System Architecture

```text
[ React + Vite SPA ]  ⇄  [ Express API Server ]  ⇄  [ MongoDB Atlas ]
             ↑                        |
             |                        ↓
       [ Socket.IO Channel ]     [ Real-Time Risk Feed ]
```

---

## 🎯 Future Roadmap

* [ ] Add 3D orbital visualization (Three.js / Cesium)
* [ ] Implement AI-based orbit prediction using TLE datasets
* [ ] Add satellite grouping and heatmap clustering
* [ ] Offline caching and PWA mode
* [ ] User-specific alert thresholds

---

## 🧑‍🚀 Developers

| Name                      | Role                                                             |
| ------------------------- | ---------------------------------------------------------------- |
| **Aryan**                 | B.Tech Student, Backend & DevOps                                 |
| **Contributors Welcome!** | Open to PRs for visualization, ML integration, and API expansion |

---

## 📜 License

MIT License © 2025 **Aryan**

---

## 💡 Fun Fact

> “Every time a satellite dodges another one, a backend engineer silently smiles.”

---

Would you like me to add **badges** (Render deploy, Node version, license, etc.) and a **demo section with screenshots** or live link placeholders?
It’ll make the README look super polished for GitHub/portfolio.
