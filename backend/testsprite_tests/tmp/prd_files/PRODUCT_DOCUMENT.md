# CureConnect — Product Document

> **AI-Driven Healthcare Navigator** | MERN Stack (MongoDB/Supabase · Express.js · React · Node.js)

---

## 1. Product Overview

**CureConnect** is a full-stack, AI-powered healthcare navigator designed to bridge the gap between patients and medical care. It empowers users to understand their symptoms, locate qualified specialist doctors, book appointments, and access life-saving first aid guidance — all from a single, clean, professional web interface.

The platform targets individual users in India seeking quick, intelligent healthcare guidance without navigating fragmented, hard-to-use health portals.

---

## 2. Core Purpose & Vision

| Pillar | Description |
|---|---|
| **Intelligent Triage** | Analyze symptoms using a local AI engine + cloud n8n AI agent to assess risk and suggest next steps |
| **Doctor Discovery** | Search and filter verified specialist doctors across India by specialty and city |
| **Frictionless Booking** | Book appointments in seconds with automated n8n workflow confirmation |
| **Emergency Readiness** | Provide clear, step-by-step first aid instructions for life-threatening situations |
| **Personal Health Hub** | Give every user a persistent dashboard and medical ID to track their health journey |

---

## 3. Technology Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 (Vite) |
| Routing | React Router v6 |
| Animations | Framer Motion (page transitions, card entrances) |
| Charts | Recharts (AreaChart for symptom risk trends) |
| Icons | Lucide React |
| Styling | Vanilla CSS with CSS variables (white & blue design system) |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js + Express.js |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (7-day tokens) + bcryptjs (password hashing, salt rounds: 12) |
| AI / Automation | n8n webhook pipeline + local rule-based AI engine |
| HTTP Client | Axios |

---

## 4. Application Architecture

```
┌──────────────────────────────────────────────────┐
│                 React Frontend                    │
│  LandingPage → Login/Register → Dashboard         │
│  SymptomChecker → DoctorsPage → AppointmentPage   │
│  FirstAidPage → ProfilePage                       │
└────────────────────┬─────────────────────────────┘
                     │ REST API (Axios)
┌────────────────────▼─────────────────────────────┐
│              Express.js Backend                   │
│  /api/auth  /api/symptoms  /api/doctors           │
│  /api/firstaid  /api/appointments                 │
└────────────┬────────────────┬────────────────────┘
             │                │
    ┌────────▼──────┐  ┌──────▼────────────┐
    │  Supabase DB  │  │  n8n AI Workflows  │
    │  (PostgreSQL) │  │  (Webhook pipeline)│
    └───────────────┘  └───────────────────┘
```

### Navigation & Layout Logic
- **Public pages** (`/`, `/login`, `/register`) → show top **Navbar**
- **Authenticated pages** (Dashboard, Symptoms, Doctors, Appointments, Profile) → show collapsible **Sidebar**
- All page transitions use Framer Motion `AnimatePresence` with fade + slide animations
- Protected routes redirect unauthenticated users to `/login`

---

## 5. User Flow

```
Landing Page
     │
     ├─► Register (name, email, password, phone, age, blood group)
     │        └─► Auto-login with JWT token
     │
     └─► Login (email + password)
              │
              ▼
         Dashboard
              ├─► Symptom Checker ──► Results (Risk + AI Recommendations) ──► Find Doctors
              ├─► Doctors Page ──────► Doctor Card ──► Book Appointment ──► Confirmation
              ├─► First Aid Page ────► Select Condition ──► Step-by-step Guide
              └─► Profile Page ──────► Medical ID, Allergies, Emergency Contact
```

---

## 6. Feature Breakdown

### 6.1 Landing Page (`/`)
- Hero section with a professional healthcare background image
- Clear calls-to-action: **"Get Started"** and **"Try Symptom Checker"**
- Feature highlights: AI Diagnosis, Doctor Discovery, Emergency First Aid, Appointment Booking
- Smooth animated entrance for all sections
- Top **Navbar** links to Login and Register

---

### 6.2 Authentication (`/register`, `/login`)

**Registration collects:**
- Full name, email address, password
- Optional: phone number, age, blood group

**Security:**
- Passwords hashed with bcryptjs (12 salt rounds)
- JWT token signed with 7-day expiry
- Duplicate email check before insertion

**Login:**
- Email + password validation against hashed record
- Returns JWT stored in browser for subsequent API calls

**Profile endpoint:** `GET /api/auth/me` returns name, email, phone, age, blood group.

---

### 6.3 Dashboard (`/dashboard`) — *Protected*

The personal health command center. Displays:

| Section | Details |
|---|---|
| **Welcome Header** | Time-of-day greeting (Good morning / afternoon / evening) with user's first name |
| **Symptom Risk Trend Chart** | Recharts `AreaChart` showing last 7 symptom check risk levels (critical=4, high=3, medium=2, low=1) |
| **Quick Action Cards** | Links to Symptom Checker and Doctors page |
| **Stats Row** | Symptom History count · Total Appointments · Active Critical Alerts · Medical Score (92/100) |
| **Activity Log** | 3 most recent symptom checks with risk badge and date |
| **Upcoming Visits** | Pending appointments with doctor name, specialty, date, and time |

---

### 6.4 AI Symptom Checker (`/symptoms`)

The flagship feature. Works in two modes simultaneously:

#### Input Methods
1. **Tag Selection** — 29 pre-defined common symptoms as clickable tags (max 15 selectable)
2. **Free-text Prompt** — Describe symptoms in natural language

#### How Analysis Works

**Step 1 — Local AI Engine (`aiService.js`)**

A rule-based knowledge base maps symptom combinations to 14 disease profiles:

| Disease Category | Conditions |
|---|---|
| Cardiovascular | Heart Attack (Critical), Hypertension (High) |
| Respiratory | Pneumonia (High), Asthma (Medium), Common Cold (Low), Influenza (Medium) |
| Neurological | Migraine (Medium), Stroke (Critical) |
| Gastrointestinal | Food Poisoning (Medium), Appendicitis (High) |
| Metabolic | Diabetes Symptoms (Medium) |
| Infectious | Dengue (High), Malaria (High) |

Each condition has a `minMatch` threshold. Matches are scored by `probability × (matchCount / totalSymptoms)`. Results are sorted highest-probability first (up to top 5).

**Risk Levels:** `low` → `medium` → `high` → `critical`

**Step 2 — n8n AI Cloud Agent**

Clean payload (user identity + symptoms + free-text prompt) is sent to an n8n webhook. The n8n workflow routes via an AI agent (e.g., Gemini/OpenAI) and returns natural-language recommendations. The backend **waits up to 45 seconds** for a response.

#### Results Display
- **Risk Banner** — Large icon + risk badge (color-coded: red/orange/purple/green)
- **AI Recommendations Card** — Natural-language output from n8n's AI agent
- **Matched Conditions** — Each disease card shows: name, probability %, risk level badge, recommended specialty, first aid link (if applicable), and a probability progress bar
- **Action Buttons** — "Find Doctors", "First Aid Guides", "Check Again"

#### Data Persistence
After responding to the user, results are saved asynchronously to `symptom_checks` table in Supabase (user ID, symptoms, risk level, diseases, recommendations).

---

### 6.5 First Aid Guides (`/firstaid`)

Emergency reference library — accessible without login.

**6 built-in conditions:**

| Condition | Severity |
|---|---|
| Heart Attack | Life-Threatening |
| Choking | Life-Threatening |
| Stroke | Life-Threatening |
| Severe Allergy (Anaphylaxis) | Life-Threatening |
| Burns | Moderate |
| Bone Fracture | Moderate |

**Each guide contains:**
- Numbered step-by-step instructions with **pro tips** per step
- **CRITICAL: Do NOT** section (red-highlighted danger warnings)
- **Emergency Action** — precise trigger condition to call 108
- Severity badge and condition-specific icon

**Grid → Detail Flow:** User selects a card from the grid → full-screen detail view with all steps.

Falls back gracefully to built-in data if Supabase table is unavailable.

---

### 6.6 Doctors Directory (`/doctors`)

Browse and filter verified specialist doctors.

**Filtering:**
- **Search bar** — by doctor name or city (real-time)
- **Specialty dropdown** — All, Cardiologist, Neurologist, General Physician, Pulmonologist, Dermatologist, Orthopedic Surgeon, Endocrinologist, Gastroenterologist

**Doctor Card displays:**
- Name, Specialty badge, Hospital, City, Qualification, Phone
- Star rating (rendered as filled SVG stars), Experience (years), Consultation fee (₹)
- Available days (Mon–Sat, color-coded green pills)
- **"Schedule Appointment"** button → navigates to `/appointments` with doctor pre-selected via React Router state

**Fallback:** 6 curated doctor profiles across major Indian cities and specialties (Apollo, AIIMS, Yashoda, Fortis, Max hospitals) are shown if the database is unavailable.

#### Database Query
`GET /api/doctors?specialty=Cardiologist&city=Mumbai` supports partial-match filtering (`ilike`) on both fields, ordered by rating descending.

---

### 6.7 Appointment Booking (`/appointments`) — *Protected*

A two-tab interface:

#### Tab 1: Schedule New
**Form fields:**
- Select specialist (dropdown)
- Preferred date (date picker, minimum: today)
- Available time slot (14 slots from 09:00 to 17:30)
- Reason for visit (optional text)
- Additional notes (optional textarea)

**Booking Logic:**
1. Backend checks for duplicate slot (same doctor + date + time, status != cancelled)
2. Creates appointment with status `pending`
3. Fires n8n webhook **without waiting** (fire-and-forget) → sends patient + doctor + appointment data
4. Returns confirmation immediately to user

**Confirmation Screen:**
- Appointment summary grid (doctor, specialty, date, time, health center, status)
- n8n automation success indicator
- Collapsible "Technical Details" panel showing the full webhook payload JSON

#### Tab 2: My Appointments
- All user appointments in a card grid
- Status badges: **Pending** (amber), **Confirmed** (green), **Cancelled** (red), **Completed** (blue)
- "⚡ AI Synced" indicator if n8n webhook was successfully sent
- **Cancel** button for pending appointments (with browser confirmation dialog)

---

### 6.8 Profile & Medical ID (`/profile`) — *Protected*

Personal health identity card:

| Section | Fields |
|---|---|
| **Header** | Avatar (initials), Full Name, Patient ID (UUID), Verified badge |
| **Official Medical ID** | Blood Group, Weight, Height |
| **Allergies** | Displayed as red pills (e.g., Penicillin, Peanuts) |
| **Chronic Conditions** | Displayed as grey pills |
| **Emergency Contact** | Name + phone with an edit button |
| **Export** | "Download Health Record (PDF)" button |

---

### 6.9 Navigation Components

**Sidebar** (authenticated layout):
- Collapsible (icon-only ↔ expanded with labels)
- Navigation links with active-state highlighting: Dashboard, Symptom Checker, First Aid, Doctors, Appointments, Profile
- **SOS Emergency shortcut** at the bottom (prominent red button)
- Logo links back to Dashboard

**Navbar** (public pages):
- Logo + brand name
- Links: Home, Symptom Checker, First Aid, Doctors
- Login / Register CTA buttons

---

## 7. Backend API Reference

### Authentication — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | None | Create new account |
| POST | `/login` | None | Login and receive JWT |
| GET | `/me` | JWT | Get current user profile |

### Symptoms — `/api/symptoms`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/check` | Optional JWT | Analyze symptoms (local AI + n8n) |
| GET | `/history` | JWT Required | Get last 10 symptom checks |

### Doctors — `/api/doctors`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | None | List all doctors (filterable by `specialty`, `city`) |
| GET | `/:id` | None | Get single doctor profile |

### First Aid — `/api/firstaid`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | None | List all first aid guides |
| GET | `/:condition` | None | Get full guide for a condition |

### Appointments — `/api/appointments`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | JWT Required | Book a new appointment |
| GET | `/my` | JWT Required | Get current user's appointments |
| PUT | `/:id/cancel` | JWT Required | Cancel a specific appointment |

### Webhooks
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/webhook/n8n` | Receive automation events from n8n (appointment reminders, health alerts) |

---

## 8. Database Schema (Supabase / PostgreSQL)

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | TEXT | Full name |
| `email` | TEXT | Unique, lowercase |
| `password_hash` | TEXT | bcrypt hash |
| `phone` | TEXT | Optional |
| `age` | INTEGER | Optional |
| `blood_group` | TEXT | Optional (A+, B+, O+, etc.) |
| `created_at` | TIMESTAMP | Auto-generated |

### `doctors`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | TEXT | |
| `specialty` | TEXT | |
| `qualification` | TEXT | |
| `hospital` | TEXT | |
| `city` | TEXT | |
| `phone` | TEXT | |
| `rating` | DECIMAL | Out of 5 |
| `experience_years` | INTEGER | |
| `consultation_fee` | INTEGER | In ₹ |
| `available_days` | TEXT[] | Array (Mon, Tue, etc.) |

### `appointments`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → users |
| `doctor_id` | UUID | FK → doctors |
| `appointment_date` | DATE | |
| `appointment_time` | TEXT | e.g., "09:30" |
| `reason` | TEXT | Optional |
| `notes` | TEXT | Optional |
| `status` | TEXT | pending / confirmed / cancelled / completed |
| `n8n_sent` | BOOLEAN | Whether n8n webhook succeeded |
| `updated_at` | TIMESTAMP | |

### `symptom_checks`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → users |
| `symptoms` | TEXT[] | Array of selected symptoms |
| `risk_level` | TEXT | low / medium / high / critical |
| `possible_diseases` | JSONB | Array of matched condition objects |
| `recommendations` | TEXT[] | Array of recommendation strings |
| `first_aid_needed` | BOOLEAN | |
| `n8n_sent` | BOOLEAN | |
| `created_at` | TIMESTAMP | |

---

## 9. n8n Automation Integration

CureConnect uses **n8n** as its AI workflow orchestration layer. The backend sends structured JSON payloads to a single webhook URL, with an `action` field used to route between workflows.

### Symptom Check Payload (`action: "symptom_checking"`)
```json
{
  "action": "symptom_checking",
  "symptom_checking": {
    "user_id": "...",
    "name": "Patient Name",
    "email": "patient@example.com",
    "age": 28,
    "blood_group": "O+",
    "Symptoms": ["Fever", "Cough", "Fatigue"],
    "prompt": "I've had a mild fever for 3 days...",
    "full_description": "Symptoms: Fever, Cough, Fatigue. Patient says: I've had a mild fever for 3 days..."
  }
}
```

### Appointment Booking Payload (`action: "appointment"`)
```json
{
  "action": "appointment",
  "appointment": {
    "id": "...",
    "date": "2025-04-15",
    "time": "10:00",
    "status": "pending",
    "reason": "Chest checkup",
    "notes": "None"
  },
  "patient": { "id": "...", "name": "...", "email": "..." },
  "doctor": {
    "name": "Dr. Priya Sharma",
    "specialty": "Cardiologist",
    "hospital": "Apollo Hospital",
    "city": "Chennai",
    "phone": "+91-...",
    "consultation_fee": "₹800"
  }
}
```

The n8n workflow processes these via a **Switch node** that routes to either the Symptom AI Agent or the Appointment Scheduling Agent depending on the `action` field.

---

## 10. Design System

| Token | Value |
|---|---|
| Primary Color | `#0066ff` (Blue) |
| Background | `#f8fafc` (Off-white) |
| Card Background | `#ffffff` |
| Text Primary | `#1e293b` |
| Text Secondary | `#64748b` |
| Border | `#e2e8f0` |
| Critical Red | `#ef4444` |
| Success Green | `#10b981` |
| Warning Amber | `#f59e0b` |
| Font | System sans-serif (Inter-style) |
| Border Radius | `12–20px` (rounded, modern cards) |
| Animation | Framer Motion (opacity + Y translate, 350ms ease-out) |

**Risk color coding** is consistent across all features:
- 🔴 `critical` — `#ef4444`
- 🟠 `high` — `#f59e0b`
- 🟣 `medium` — `#7c3aed`
- 🟢 `low` — `#10b981`

---

## 11. Security Model

| Concern | Implementation |
|---|---|
| Password Storage | bcryptjs, 12 salt rounds |
| Session Management | Stateless JWT, 7-day expiry |
| Route Protection | `protect` middleware verifies Bearer token on every private route |
| CORS | Whitelist: `localhost:5173` (Vite) and `localhost:3000` (CRA) |
| Input Validation | Required field checks on all POST routes |
| Duplicate Prevention | Email uniqueness check on register; slot conflict check on booking |
| Error Handling | Global Express error handler; graceful fallback data for all external dependencies |

---

## 12. Error Handling & Resilience

- **Doctors list** falls back to 6 built-in profiles if Supabase is unavailable
- **First Aid guides** fall back to 6 built-in guides if the `first_aid_guides` table doesn't exist
- **Symptom Checker** uses local AI analysis if n8n webhook fails or times out
- All API calls wrapped in `try/catch` with user-friendly error messages
- Frontend shows loading spinners and inline error alerts everywhere

---

## 13. Development Server Setup

### Backend
```bash
cd backend
npm install
# Configure .env with: PORT, SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET, N8N_WEBHOOK_URL
node server.js
# Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 14. Future Roadmap

| Feature | Priority |
|---|---|
| Real-time appointment slot availability | High |
| Telemedicine / Video consultation | High |
| Push notifications for appointment reminders | Medium |
| Health record PDF export (Profile page) | Medium |
| Map-based doctor discovery | Medium |
| Prescription and lab report upload | Medium |
| Multi-language support (Hindi, Tamil, etc.) | Low |
| Mobile app (React Native) | Low |
| Health vitals tracking (heart rate, BP log) | Low |

---

*Document generated from full codebase analysis — CureConnect v1.0.0*
