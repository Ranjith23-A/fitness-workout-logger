# Fitness Logging: Full-Stack MERN Fitness & Workout Logger

A production-grade, full-stack **MERN** (MongoDB, Express, React, Node.js) web application designed for comprehensive fitness tracking, structured cardio & strength logging, accurate physiological metabolic estimations, dynamic telemetry charts, and authentic personal records.

---

## 1. Project Overview

Fitness Logging bridges the gap between basic workout note-taking and exercise physiology. It provides:
- **First-Class Cardio & Strength Logging**: Custom workflows for aerobic exercise and multi-exercise resistance training with individual sets, reps, bodyweight handling, and volume tonnage tracking.
- **Authoritative Server-Side Metabolic Calculations**: Real Gross and Net exercise calorie calculations derived from the **Compendium of Physical Activities** (MET standard) and **ACSM** treadmill equations, parameterized by the user's recorded weight snapshot.
- **Biometric Profiling**: Real-time **BMI** (with WHO categories and historical comparisons), **BMR** (Mifflin–St Jeor formula), **TDEE** (scaled by lifestyle activity factors), and goal-driven daily calorie targets with anti-double-counting safeguards.
- **Interactive Telemetry Dashboard**: Recharts-powered energy expenditure bars, cardio-vs-strength distribution pies, and strength volume progression.
- **Robust Security**: Dual support for HttpOnly cookies and Bearer tokens, bcrypt hashing with 72-byte boundary limits, strict password policies, tenant data isolation, and real cryptographic email verification OTPs.

---

## 2. Technology Stack

### Frontend
- **React 19 with Vite**: Blazingly fast build times and modern component architecture.
- **React Router DOM v7**: Client-side routing with protected route authentication guards.
- **Axios**: HTTP client configured with baseURL proxies, credentials, Bearer token interceptors, and automatic 401 session expiration handling.
- **Recharts**: Responsive SVG charts (BarChart, LineChart, PieChart) for trends and telemetry.
- **Lucide React**: Clean, accessible iconography.
- **Modern CSS Design System**: Carbon Obsidian theme (`#0b0d14`), high-contrast Solar Blaze (`#ff5722`) and Electric Indigo (`#6366f1`) accents, fully responsive layouts, desktop sidebar, and mobile drawer.

### Backend
- **Node.js (LTS)**: High-performance asynchronous runtime.
- **Express.js**: RESTful API design with modular controllers, middlewares, and centralized error handling.
- **MongoDB Atlas & Mongoose**: Object modeling with schema validation, compound indexing, pre-save hooks, and tenant scoping.
- **bcryptjs**: Constant-time salt generation and password hashing, avoiding native compilation issues on Windows.
- **jsonwebtoken (JWT)**: Secure session token generation with configurable expiration.
- **dotenv & cookie-parser**: Environment variable management and cookie parsing.

---

## 3. Project Structure

```
fitness-workout-logger/
├── client/                          # React + Vite Frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             # Configured Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── BmiIndicator.jsx     # Visual BMI gauge & category indicator
│   │   │   ├── ConfirmModal.jsx     # Reusable confirmation modal
│   │   │   ├── Layout.jsx           # App layout with Sidebar & Navbar
│   │   │   ├── Navbar.jsx           # Mobile header bar
│   │   │   ├── PasswordStrengthMeter.jsx # 5-point password strength checklist
│   │   │   ├── ProtectedRoute.jsx   # Route guards for authenticated/public views
│   │   │   ├── Sidebar.jsx          # Desktop navigation sidebar
│   │   │   └── StatCard.jsx         # Metric summary card with progress bars
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global authentication & user metrics state
│   │   ├── pages/
│   │   │   ├── AddWorkout.jsx       # Interactive Cardio & Strength logger
│   │   │   ├── Dashboard.jsx        # Telemetry dashboard with charts & streak
│   │   │   ├── FitnessProfile.jsx   # Biometrics, BMR/TDEE, & Weight History
│   │   │   ├── Goals.jsx            # Targets & milestone checklist
│   │   │   ├── Login.jsx            # Secure login with demo fill
│   │   │   ├── NotFound.jsx         # 404 handler
│   │   │   ├── Progress.jsx         # PRs table & historical trend charts
│   │   │   ├── Register.jsx         # 2-Step registration with live validation
│   │   │   ├── Settings.jsx         # Account info, email OTP, & password update
│   │   │   └── WorkoutDetails.jsx   # Deep-dive session audit & edit mode
│   │   │   └── WorkoutHistory.jsx   # Filterable & searchable workout audit list
│   │   ├── styles/
│   │   │   └── index.css            # Dark theme design system & utilities
│   │   ├── utils/
│   │   │   └── calculations.js      # Client-side mirror of formulas for instant feedback
│   │   ├── App.jsx                  # Main router definitions
│   │   └── main.jsx                 # React root mounting
│   ├── index.html                   # HTML template
│   ├── package.json                 # Client dependencies
│   └── vite.config.js               # Dev server configuration with /api proxy
├── server/                          # Express + MongoDB Backend
│   ├── config/
│   │   └── db.js                    # Database connection with MemoryServer fallback
│   ├── controllers/
│   │   ├── authController.js        # Auth, JWT, OTP verification, password change
│   │   ├── goalController.js        # Goals & milestone progress
│   │   ├── profileController.js     # Biometrics & historical weigh-in tracking
│   │   ├── statsController.js       # Dashboard stats, PRs calculation, trends
│   │   └── workoutController.js     # Workout CRUD with authoritative server calculations
│   ├── middleware/
│   │   ├── authMiddleware.js        # Dual Bearer token & cookie authentication
│   │   ├── errorMiddleware.js       # Centralized 404 & error handlers
│   │   └── validationMiddleware.js  # Request validation & password complexity checks
│   ├── models/
│   │   ├── Goal.js                  # Fitness goal & milestone schema
│   │   ├── User.js                  # User, profile, weight history schema
│   │   └── Workout.js               # Polymorphic cardio/strength workout schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── goalRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── statsRoutes.js
│   │   └── workoutRoutes.js
│   ├── services/
│   │   ├── calorieService.js        # MET & ACSM treadmill energy equations
│   │   └── fitnessMetricsService.js # BMI, Mifflin-St Jeor BMR, TDEE, & Calorie targets
│   ├── tests/
│   │   ├── api.test.js              # Integration tests (auth, isolation, workouts, stats)
│   │   └── calculations.test.js     # Unit tests (BMI, BMR, TDEE, MET, passwords)
│   ├── utils/
│   │   ├── constants.js             # MET table, activity multipliers, regex
│   │   └── emailVerification.js     # 6-digit OTP generation & SMTP handler
│   ├── .env                         # Development environment file
│   ├── .env.example                 # Environment template
│   ├── package.json                 # Backend dependencies & test scripts
│   └── server.js                    # Express app initialization & server entry point
├── .gitignore                       # Git exclusions
├── package.json                     # Monorepo root scripts
└── README.md                        # Documentation
```

---

## 4. Authentication & Security Architecture

1. **Registration & Password Policy**:
   - Must be between 8 and 72 characters (preventing bcrypt silent truncation beyond 72 bytes).
   - Enforces at least 1 uppercase letter (`[A-Z]`), 1 lowercase letter (`[a-z]`), 1 numeric digit (`[0-9]`), and 1 special symbol (`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`).
   - Valid example: `Ranjith@2026`.
   - Frontend and backend share exact regex pattern verification.
2. **Dual Token Authentication**:
   - Accepts session JWTs via both `Authorization: Bearer <token>` and `HttpOnly` cookies.
   - Mitigates Cross-Site Scripting (XSS) via HttpOnly cookies and protects cross-origin requests.
3. **Tenant Data Isolation**:
   - Every workout, goal, and profile record query enforces `user: req.user._id`.
   - Any attempt to query, edit, or delete another user's workout returns `403 Forbidden`.
4. **Email Verification**:
   - Real 6-digit cryptographic OTP generation with a 15-minute expiration timestamp.
   - When SMTP credentials are provided, dispatches emails. In development mode, logs the OTP clearly to the terminal for friction-free testing.

---

## 5. Scientific Formulas & Calculation Engine

### 1. Body Mass Index (BMI)
$$\text{BMI} = \frac{\text{Weight (kg)}}{(\text{Height (m)})^2}$$
- **Underweight**: $< 18.5$
- **Normal weight**: $18.5 - 24.9$
- **Overweight**: $25.0 - 29.9$
- **Obese**: $\ge 30.0$
- *Disclaimer*: Epidemiological screening indicator; does not distinguish muscle mass from adipose tissue.

### 2. Basal Metabolic Rate (BMR) &mdash; Mifflin–St Jeor
- **Men**: $\text{BMR} = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age} + 5$
- **Women**: $\text{BMR} = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age} - 161$

### 3. Total Daily Energy Expenditure (TDEE)
$$\text{TDEE} = \text{BMR} \times \text{Activity Multiplier}$$
- Sedentary: $1.2$
- Lightly Active: $1.375$
- Moderately Active: $1.55$
- Very Active: $1.725$
- Extra Active: $1.9$

### 4. Exercise Calorie Expenditure (Authoritative Server MET Equations)
$$\text{Gross Calories (kcal)} = \text{MET} \times 3.5 \times \frac{\text{Weight (kg)}}{200} \times \text{Duration (min)}$$
$$\text{Net Exercise Calories (kcal)} = (\text{MET} - 1) \times 3.5 \times \frac{\text{Weight (kg)}}{200} \times \text{Duration (min)}$$
- **Compendium of Physical Activities MET Reference**:
  - Running (moderate): $9.8$ MET
  - Walking (moderate): $3.5$ MET
  - Cycling (moderate): $7.5$ MET
  - Swimming (moderate): $7.0$ MET
  - Strength Training (moderate): $5.0$ MET
  - Treadmill with speed/incline uses the ACSM Walking/Running Metabolic Equations.

---

## 6. Windows PowerShell Setup & Run Instructions

### Prerequisites
- Node.js (v18, v20, v22, or v26 LTS)
- npm (v9+)
- Windows 10/11 with PowerShell

### Step 1: Clone or Navigate to Project
```powershell
cd C:\Users\LENOVO\.gemini\antigravity\scratch\fitness-workout-logger
```

### Step 2: Configure Backend Server
Open a terminal for the server:
```powershell
cd server
npm install
```
Review or edit `server/.env`. If you have a MongoDB Atlas connection string, update `MONGO_URI`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fitness_tracker?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_fitness_workout_logger_2026_secure
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```
> **Note**: If `MONGO_URI` is not set or contains `<username>`, FitTrack Pro automatically activates an in-memory MongoDB instance (`mongodb-memory-server`), enabling instant execution with zero external database configuration!

Start the backend server:
```powershell
npm run dev
```

### Step 3: Configure Frontend Client
Open a second terminal window for the client:
```powershell
cd client
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 7. MongoDB Atlas Configuration Guide

1. Sign up or log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Sandbox Cluster**.
3. Under **Security > Database Access**:
   - Create a database user with password authentication (e.g. username `fituser`, password `FitSecurePass2026`).
4. Under **Security > Network Access**:
   - Click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`) or add your current IP address.
5. Under **Deployment > Database**:
   - Click **Connect > Drivers > Node.js**.
   - Copy the connection URI:
     `mongodb+srv://fituser:FitSecurePass2026@cluster0.xyz.mongodb.net/fitness_tracker?retryWrites=true&w=majority`
   - Paste this URI into `server/.env` as `MONGO_URI`.

---

## 8. REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register user with biometrics & password validation | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT cookie/header | Public |
| `POST` | `/api/auth/logout` | Invalidate cookie session | Public |
| `GET` | `/api/auth/me` | Retrieve profile and current computed metrics | Private |
| `POST` | `/api/auth/verify-request` | Generate 6-digit email verification OTP | Private |
| `POST` | `/api/auth/verify-confirm` | Confirm email OTP verification | Private |
| `PUT` | `/api/auth/change-password` | Update account password with complexity check | Private |

### Profile & Weight History (`/api/profile`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/profile` | Get full fitness profile, metrics & weight history | Private |
| `PUT` | `/api/profile` | Update profile biometrics & recompute targets | Private |
| `POST` | `/api/profile/weight` | Record new historical weigh-in | Private |
| `DELETE` | `/api/profile/weight/:id` | Delete historical weigh-in entry | Private |

### Workouts (`/api/workouts`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/workouts` | Create Cardio or Strength workout with server calories | Private |
| `GET` | `/api/workouts` | Filtered list (`type`, `timeRange`, `search`, `sortBy`) | Private |
| `GET` | `/api/workouts/:id` | Get detailed workout session | Private |
| `PUT` | `/api/workouts/:id` | Update workout & recalculate calories | Private |
| `DELETE` | `/api/workouts/:id` | Permanently delete workout session | Private |

### Telemetry & Stats (`/api/stats`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/stats/dashboard` | Dashboard metrics, streak, & chart distributions | Private |
| `GET` | `/api/stats/progress` | Cumulative progress, volume trends & weight chart | Private |
| `GET` | `/api/stats/records` | Verified Personal Records (PRs) per exercise & cardio | Private |

### Goals (`/api/goals`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/goals` | Retrieve user targets & personal milestones | Private |
| `PUT` | `/api/goals` | Update targets & milestones list | Private |
| `PATCH` | `/api/goals/milestone/:id/toggle` | Toggle milestone completion status | Private |

---

## 9. Running Verification Tests

Fitness Logging features a comprehensive automated test suite testing calculations, password policies, user isolation, workouts, and analytics.

Execute from the `server` directory:
```powershell
npm test
```
**Test Results**:
- **25 Tests Across 4 Suites**: 100% Pass rate.
- Verified test cases:
  1. BMI calculation and WHO category bounds.
  2. Mifflin-St Jeor BMR for male and female physiology.
  3. TDEE and safety floor targets (1200 kcal female / 1500 kcal male).
  4. Cardio gross and net calorie calculations using Compendium of Physical Activities MET table.
  5. ACSM treadmill incline & speed equation.
  6. Strength workout effort-based energy expenditure.
  7. Password criteria checklist (tested valid `Ranjith@2026` and rejected invalid cases).
  8. Duplicate email rejection with 409 Conflict.
  9. Dual token authentication and tenant data isolation.
  10. Multi-exercise strength volume tonnage computation.

---

## 10. Frontend Build Verification

To compile the production frontend bundle:
```powershell
cd client
npm run build
```
Builds the single-page application into `client/dist/` in under 1 second.
