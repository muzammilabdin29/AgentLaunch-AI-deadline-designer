# AgentLaunch

An intelligent deadline visualization platform and lock-screen wallpaper generator powered by Google Gemini.

[Live Application](https://agentlaunch-ai-deadline-designer.onrender.com/) | [Documentation](#architecture-and-data-flow) | [Deployment](#production-deployment)

[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.8%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Express](https://img.shields.io/badge/Express-5.1-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?style=flat-square&logo=render&logoColor=white)](https://agentlaunch-ai-deadline-designer.onrender.com/)

---

## Executive Summary

AgentLaunch is a responsive web application designed to bridge high-level goals and day-to-day execution through visual deadline countdowns and structured milestone planning. Built for the Handshake AI Skills Studio × Google Challenge (November 2026), the system decomposes user objectives into five chronological, actionable milestones using Google Gemini, rendering high-resolution, clock-safe wallpapers for mobile and desktop screens.

### Core Capabilities

- **Automated Milestone Generation:** Integrates the Google Gemini Interactions API (`@google/genai`) with structured JSON schema enforcement to derive achievable milestones leading up to a target deadline.
- **Clock-Safe Canvas Rendering:** Utilizes an in-browser HTML5 2D Canvas engine to output high-DPI wallpapers engineered with safe zones for device system UI (status bars, time displays, notches, and home indicators).
- **Multi-Format Export:** Produces production-ready PNG assets for mobile (1080x1920), desktop displays (1920x1080), and competition submission cards (1200x630).
- **Resilient Fallback Mode:** Operates fully offline via procedural milestone generation when third-party AI services are unreachable or unconfigured.
- **Client-Side State Persistence:** Synchronizes user progress, customized milestones, themes, and deadline inputs across sessions using local storage.
- **Zero-Exposure Security:** Enforces strict server-side encapsulation of API credentials, client input sanitization, and IP-based rate limiting.

---

## Technical Specifications

### Architecture and Data Flow

AgentLaunch follows a decoupled client-server architecture to isolate API credentials and enforce server-side validation:

```text
+---------------------------------------------------------------+
|                       Browser Client                          |
|             React 19, Lucide Icons, HTML5 Canvas             |
+------------------------------+--------------------------------+
                               |
                               | HTTP POST /api/milestones
                               | Body: { goal, deadline, today, vibe }
                               v
+---------------------------------------------------------------+
|                      Node.js Express Server                   |
|           Input Validation, Rate Limiter (12 req/min)        |
+------------------------------+--------------------------------+
                               |
                               | Gemini Interactions API (gemini-3.8-flash)
                               | Strict JSON Schema Enforcement
                               v
+---------------------------------------------------------------+
|                  Google Gemini AI Infrastructure              |
+---------------------------------------------------------------+
```

### Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19.0 | Component rendering, state synchronization, and DOM lifecycle |
| **Build Tooling** | Vite 6.1 | Module bundling, hot module replacement, and client optimization |
| **Graphic Rendering** | HTML5 Canvas 2D | High-resolution rasterization, typography calculation, and image export |
| **Backend Framework** | Express 5.1 | REST API routing, rate limiting, and static file delivery |
| **AI Integration** | `@google/genai` (v2.32.0) | Google GenAI SDK interfacing with Gemini 3.8 Flash |
| **Styling** | Vanilla CSS (Variables) | Fluid typography, theme tokens, and responsive layout constraints |
| **Testing Engine** | Node.js Test Runner | Native assertion suite for date utilities and sanitization logic |

---

## Repository Structure

```text
AgentLaunch/
├── .env.example          # Environment variable template
├── .gitignore            # Version control exclusion rules
├── index.html            # Vite application entry point
├── package.json          # Dependency manifest and lifecycle scripts
├── render.yaml           # Infrastructure-as-code configuration for Render
├── test-gemini.mjs       # Command-line connectivity verification script
├── vite.config.js        # Vite compilation and reverse proxy configuration
├── server/
│   └── index.js          # Express server, rate limiting, and Gemini API gateway
├── src/
│   ├── main.jsx          # React application root mounting
│   ├── App.jsx           # Main interactive studio and state coordinator
│   ├── styles.css        # Responsive dark UI stylesheet and design system
│   └── utils/
│       ├── dates.js      # Date calculation, formatting, and ISO validation
│       ├── milestones.js # Starter plan logic and milestone sanitization
│       └── wallpaper.js  # Canvas rendering pipeline (phone, desktop, cover)
├── public/
│   └── favicon.svg       # Application vector icon
└── tests/
    └── dates.test.js     # Unit test suite for dates and milestone ordering
```

---

## Local Development

### System Requirements

- Node.js 20.0.0 or higher
- npm 10.0.0 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/muzammilabdin29/AgentLaunch-AI-deadline-designer.git
   cd AgentLaunch
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

3. Initialize environment configuration:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env

   # Unix / macOS
   cp .env.example .env
   ```

4. Populate `.env` with your Google AI Studio credentials:
   ```dotenv
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.8-flash
   PORT=3001
   ```

5. Launch the concurrent development environment:
   ```bash
   npm run dev
   ```

6. Navigate to `http://localhost:5173` in your browser.

---

## Verification and Testing

Execute the test suite using the built-in Node.js runner:

```bash
npm test
```

To test connectivity with the Google Gemini API from the terminal:

```bash
node test-gemini.mjs
```

---

## Production Deployment

### Live Environment

- **Production URL:** [https://agentlaunch-ai-deadline-designer.onrender.com/](https://agentlaunch-ai-deadline-designer.onrender.com/)
- **Health Check Endpoint:** [https://agentlaunch-ai-deadline-designer.onrender.com/api/health](https://agentlaunch-ai-deadline-designer.onrender.com/api/health)

### Deployment Specification

The project includes declarative deployment configuration (`render.yaml`) optimized for containerized Node.js runtimes:

- **Build Command:** `npm install --include=dev && npm run build`
- **Start Command:** `npm start`
- **Required Environment Variables:**
  - `NODE_ENV`: `production`
  - `GEMINI_MODEL`: `gemini-3.8-flash`
  - `GEMINI_API_KEY`: Configured via dashboard secret management

---

## Competition Submission Details

Developed for the **Handshake AI Skills Studio × Google Challenge (November 2026)**:  
*Mission: "Your Deadline, Your Design: Create a Countdown Lock Screen"*

### Submission Metadata

- **Project Title:** AgentLaunch — AI-Powered Countdown Lock Screens
- **Public URL:** [https://agentlaunch-ai-deadline-designer.onrender.com/](https://agentlaunch-ai-deadline-designer.onrender.com/)
- **Project Description:** AgentLaunch transforms personal deadlines into structured, actionable visual timelines for lock screens. Utilizing Google Gemini, the platform analyzes user goals and target dates to generate five progressive milestones, allowing users to fine-tune schedules, select theme aesthetics, and export clock-safe wallpapers for mobile and desktop displays.
- **Reference Prompt:** `Launch my AI Response Quality Evaluation Agent` (Target: 30-day projection)

### Compliance Verification

- Milestone generation adheres to chronological sequencing constraints.
- Wallpapers maintain clearance zones compliant with standard iOS and Android lock-screen layouts.
- Cover exports comply with the 1200x630 submission specification.
- Offline resilience verified via procedural starter plan generation.

---

## Security and Operational Policies

- **Credential Isolation:** Client bundles do not contain access keys or tokens. All interactions with third-party LLM providers are proxied server-side.
- **Traffic Throttling:** Requests to `/api/milestones` are subject to an in-memory sliding window rate limiter (maximum 12 requests per minute per IP address).
- **Input Sanitization:** User goals are bounded to 160 characters and treated strictly as data payloads to mitigate prompt manipulation risks.

---

## License and Acknowledgments

- Developed by Muzammil Abdin for the Handshake AI Skills Studio × Google Challenge (November 2026).
- Powered by Google Gemini.
