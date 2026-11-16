# 🚀 AgentLaunch — AI Deadline Designer

> **Transform your biggest goals into beautiful, actionable lock-screen countdown wallpapers.**  
> *Built for the Handshake AI Skills Studio × Google Challenge (November 2026).*

[![React 19](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite 6](https://img.shields.io/badge/Vite-6.1-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js 20+](https://img.shields.io/badge/Node.js-%3E%3D20.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.8%20Flash-4285F4?logo=google&logoColor=white)](https://aistudio.google.com/)
[![Express 5](https://img.shields.io/badge/Express-5.1-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Render Deploy](https://img.shields.io/badge/Render-Ready-46E3B7?logo=render&logoColor=white)](https://render.com/)

---

## 📖 Overview

**AgentLaunch** turns intimidating deadlines into daily momentum. Powered by **Google Gemini**, it takes your goal, target deadline, and visual style to generate five realistic, chronological milestones. The built-in HTML5 Canvas studio lets you customize every milestone and immediately download a crisp, clock-safe lock-screen wallpaper for your **Phone (1080×1920)** or **Desktop (1920×1080)**, along with a **1200×630 competition cover card**.

If you don't have a Gemini API key configured, AgentLaunch works seamlessly offline using an intelligent **Starter Plan** generator.

---

## ✨ Features

- 🤖 **Gemini-Powered Milestones:** Uses Google's official `@google/genai` SDK with strict JSON schema validation (`response_format`) to generate five bite-sized, chronological action steps.
- 🎨 **Three Curated Visual Themes:**
  - **Mission Control:** Deep cosmic midnight (`#070c1b`) with luminous teal and lilac accents.
  - **Aurora:** Emerald and cyan northern glow (`#0c1224`) with violet contrast.
  - **After Hours / Minimal:** Warm executive night mode (`#181a1e`) with champagne gold and peach accents.
- 📱 **Clock-Safe Wallpapers:**
  - **Phone (1080 × 1920):** Engineered with generous top clearance ensuring system time, date, widgets, and dynamic island / notch remain unobstructed.
  - **Desktop (1920 × 1080):** High-DPI landscape composition ideal for laptop and widescreen monitors.
  - **Handshake Cover (1200 × 630):** Instant marketing cover card formatted specifically for competition submission cards and social previews.
- 🛡️ **Zero-Exposure Server Architecture:**
  - `GEMINI_API_KEY` is strictly confined to the Express backend (`server/index.js`).
  - No client-side `VITE_` variables leak credentials to the browser bundle.
  - In-memory rate limiting (12 requests/minute per IP) and strict payload size gates (16KB body, 160-character goal limit).
- 💾 **Local Persistence:** Goal, deadline, selected theme, format, and customized milestones automatically persist across page reloads via `localStorage`.
- ⚡ **Offline Fallback ("Starter Plan"):** Full functionality remains active without an API key by generating mathematically spaced starter milestones.

---

## 🏗️ Architecture & Data Flow

```text
┌────────────────────────────────────────────────────────┐
│                      Client (Browser)                  │
│  React 19 + Lucide Icons + Vite Dev / Production Build │
└──────────────┬───────────────────────────▲─────────────┘
               │ (POST /api/milestones)    │ (5 Milestones JSON)
               │ (Payload: goal, deadline) │
┌──────────────▼───────────────────────────┴─────────────┐
│                      Backend (Node.js)                 │
│  Express 5 Server + Rate Limiting + Input Validation   │
└──────────────┬───────────────────────────▲─────────────┘
               │ (Interactions API)        │ (Structured JSON)
               │ (Secure GEMINI_API_KEY)   │
┌──────────────▼───────────────────────────┴─────────────┐
│               Google Gemini Interactions API           │
│               gemini-3.8-flash (JSON Schema)           │
└────────────────────────────────────────────────────────┘
```

---

## 📁 Project Directory

```text
AgentLaunch/
├── .env.example          # Environment variable template (safe to commit)
├── .gitignore            # Git exclusion rules (protects .env and node_modules)
├── index.html            # Vite HTML entry point
├── package.json          # Node dependencies and npm scripts
├── render.yaml           # Infrastructure-as-code for Render deployment
├── test-gemini.mjs       # Quick terminal diagnostic script for Gemini connectivity
├── vite.config.js        # Vite dev server configuration + /api backend proxy
├── server/
│   └── index.js          # Express 5 server, Gemini API gateway, static asset server
├── src/
│   ├── main.jsx          # React DOM root mounting
│   ├── App.jsx           # Main interactive studio, form controls, and state management
│   ├── styles.css        # Responsive dark UI styles & typography
│   └── utils/
│       ├── dates.js      # Date parsing, ISO formatting, leap-year calculations
│       ├── milestones.js # Starter plan logic and milestone sanitization
│       └── wallpaper.js  # HTML5 Canvas 2D graphic renderer (phone, desktop, cover)
├── public/
│   └── favicon.svg       # Brand icon
└── tests/
│   └── dates.test.js     # Native Node.js test suite for dates and milestones
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js 20.0 or higher** installed ([nodejs.org](https://nodejs.org/))
- **npm** (comes bundled with Node.js)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/muzammilabdin29/AgentLaunch-AI-deadline-designer.git
cd AgentLaunch
npm install
```

### 2. Configure Environment Variables

Create your local `.env` file by copying the template:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Open `.env` and insert your Gemini API Key:

```dotenv
# Obtain a key at https://aistudio.google.com/api-keys
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
PORT=3001
```

> ⚠️ **Security Warning:** Never commit `.env` or put your real API key in `.env.example`. The `.gitignore` file is configured to keep `.env` private.

### 3. Run Development Server

```bash
npm run dev
```

This starts both the Express API (`http://localhost:3001`) and the Vite frontend (`http://localhost:5173`) concurrently.  
Open **http://localhost:5173** in your browser.

---

## 🧪 Testing & Verification

AgentLaunch includes native Node.js unit tests (no external test runner required):

```bash
npm test
```

To quickly verify that your Gemini API key and model connectivity work from your terminal:

```bash
node test-gemini.mjs
```

---

## 📦 Production Build & Deployment

### Build Locally

```bash
npm run build
npm start
```
The Express server will serve both the compiled Vite frontend from `dist/` and all `/api/*` routes on the same port (`PORT=3001` or provided environment variable).

### Deploying to Render (Recommended)

This project contains a pre-configured `render.yaml` file:

1. Push your repository to **GitHub**.
2. Go to [Render.com](https://render.com/) and click **New +** > **Blueprint**.
3. Connect your `AgentLaunch` repository.
4. Set the secret environment variable in the Render Dashboard:
   - `GEMINI_API_KEY`: *[Your real Gemini API Key]*
5. Click **Apply**. Render will automatically run `npm install && npm run build` and launch with `npm start`.

---

## 🏆 Handshake Challenge Submission Guide

Built for the **Handshake AI Skills Studio × Google Challenge (November 2026)**:
*“Your Deadline, Your Design: Create a Countdown Lock Screen”*

### Submission Checklist
- [x] **Goal & Countdown:** Shows an actionable countdown timer and structured milestones leading up to the target date.
- [x] **Clock-Safe Wallpapers:** Exported wallpapers account for real phone and desktop lock-screen system clocks and icons.
- [x] **1200×630 Cover Image:** Click **Export cover** to download the exact dimension required for submission cards.
- [x] **Offline Mode:** Tested and functional even without third-party API availability via **Starter plan**.

### Recommended Entry Metadata
- **Project Title:** AgentLaunch — AI-Powered Countdown Lock Screens
- **Short Description:** AgentLaunch turns personal deadlines into beautifully designed action plans for your lock screen. Powered by Google Gemini, it generates five realistic milestones from any goal and target date, lets you fine-tune the timeline, pick a visual theme, and export high-resolution, clock-safe wallpapers for Phone and Desktop.
- **Demo Prompt Idea:** `Launch my AI Response Quality Evaluation Agent` (Set deadline 30 days ahead).

---

## 📄 License & Attribution

- Built by **Muzammil Abdin** for the **Handshake × Google 2026 AI Challenge**.
- Powered by [Google AI Studio & Gemini API](https://aistudio.google.com/).
