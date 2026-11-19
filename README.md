# Aqua Pulse — Smart Water Purification & Quality Monitoring System 💧⚡

> **Smart India Hackathon (SIH 2026)**  
> **Problem Statement ID:** SIH26040  
> **Theme:** Clean & Green Technology  
> **Category:** Hardware / IoT + Web Intelligence

---

## 🌊 Overview

**Aqua Pulse** is an intelligent, low-power IoT water purification and real-time water quality monitoring platform designed for rural and mining-affected regions. It bridges the gap between hardware sensors and community-level visibility, providing real-time telemetry, automated four-stage purification workflows, filter health tracking, and off-grid solar energy telemetry.

---

## ✨ Features

- **Live Sensor Telemetry:** Continuous tracking of core water quality parameters — pH, TDS, Turbidity, and Temperature with threshold classification (Normal / Warning / Critical).
- **Interactive Multi-Stage Purification Train:** Visualization and automated control of the 4 purification stages:
  - 1️⃣ Sediment Filter
  - 2️⃣ Activated Carbon Filter
  - 3️⃣ Ultrafiltration / Reverse Osmosis (UF / RO)
  - 4️⃣ Ultraviolet (UV) Disinfection
- **Real-Time Analytics & Trends:** Interactive charts and historical comparisons powered by Recharts.
- **Filter Health & Predictive Maintenance:** Runtime hours, health percentages, and replacement schedules.
- **Multi-Unit Fleet Management:** Geo-distributed device tracking across rural and mining outposts.
- **Solar / Battery Energy Telemetry:** Power consumption tracking tailored for off-grid operations.
- **SIH Simulation & Hardware Demo Mode:** Built-in interactive 10-step simulation walking through water entry, contamination detection, automated filtration sequencing, and quality verification.

---

## 🛠️ Tech Stack

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Charts:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Muhammad-Adil-14912/AquaPulse.git
cd AquaPulse

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` to explore the dashboard.

### Build for Production

```bash
npm run build
```

The output will be in the `dist/` directory, ready to deploy.

---

## 👥 Authors & Team
- **Project:** Aqua Pulse (IntelliSched AI)
- **SIH 2026**

## Prototype and telemetry status

The current dashboard includes demonstration/simulation data and simulated device states. Unless a hardware or backend integration is configured separately, displayed readings, alerts, filter-health values, and device locations are not live measurements from physical sensors. Do not use this demo to make drinking-water safety decisions. Potability must be established through calibrated instruments and accredited laboratory testing against applicable BIS/WHO guidance. The project description is an intended architecture, not a certification claim.
