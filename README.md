# LawPoint — AI-Assisted Court Case Management Portal

> **22AIE311 Software Engineering · Amrita School of Computing, Amritapuri · Amrita Vishwa Vidyapeetham**  
> BTech Computer Science and Engineering (AI)

LawPoint is a web-based court case management portal that digitizes the end-to-end lifecycle of legal complaints across three court types — Criminal, Civil, and Family. It replaces error-prone, paper-driven workflows with a structured, role-based digital platform incorporating an AI agent for intelligent court routing, while preserving full human oversight at every sensitive decision point.

---

## Table of Contents

- [Team](#team)
- [Problem Statement](#problem-statement)
- [System Overview](#system-overview)
- [Feature Pipeline](#feature-pipeline)
- [Data Architecture](#data-architecture)
- [Class Model](#class-model)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [API Contract](#api-contract)
- [Branch Ownership & Work Split](#branch-ownership--work-split)
- [Git Workflow](#git-workflow)
- [Development Timeline](#development-timeline)
- [Key Design Decisions](#key-design-decisions)
- [End-to-End Integration Test Checklist](#end-to-end-integration-test-checklist)
- [Future Scope](#future-scope)

---

## Team

| Member   | Domain                                           | Branch                            |
|----------|--------------------------------------------------|-----------------------------------|
| Member A | Backend API + AI Integration + Database          | `feature/backend`                 |
| Member B | Frontend (Citizen & Lawyer portals)              | `feature/frontend-citizen-lawyer` |
| Member C | Frontend (Admin portal) + DevOps + Integration   | `feature/frontend-admin-devops`   |

---

## Problem Statement

The Indian court system handles millions of cases annually, yet complaint filing, case assignment, and scheduling remain largely manual. Six documented failure points exist:

1. **Manual Filing** — Complaints submitted on paper; prone to loss, transcription errors, and registration delays.
2. **Misrouted Cases** — Court assignment by clerks without structured tools leads to frequent misrouting and case dismissals.
3. **No Online Tracking** — Citizens cannot check case status without physically attending court.
4. **Lawyer Discovery Gap** — No centralized directory of available lawyers per court type.
5. **Process Opacity** — Hearing schedules and outcomes not communicated digitally.
6. **Data Sensitivity Risk** — AI-assisted systems often expose raw model output directly to users, risking legally unvetted conclusions.

LawPoint addresses all six with a role-differentiated web portal that structures every stage of the case lifecycle.

---

## System Overview

### Actors

| Actor          | Type     | Description                                                                                   |
|----------------|----------|-----------------------------------------------------------------------------------------------|
| Citizen        | Primary  | Files complaints, selects lawyers, tracks case progress throughout the lifecycle.             |
| Admin          | Primary  | Reviews AI summaries, approves/rejects complaints, manages hearings, closes cases.            |
| Lawyer         | Primary  | Receives case requests for their assigned court and accepts or declines.                      |
| AI Agent       | External | LLM-based service: assesses complaint relevance, recommends court type via API.               |
| Accused Party  | External | Notified via phone/email on case approval. No portal login.                                   |

### Use Cases

| ID    | Use Case                        | Actor(s)          | Description                                                                  |
|-------|---------------------------------|-------------------|------------------------------------------------------------------------------|
| UC-01 | File Complaint                  | Citizen           | Submits complaint with case details and accused party contact.               |
| UC-02 | Assess & Route Complaint        | AI Agent          | Receives sanitised text, evaluates relevance, recommends court type.         |
| UC-03 | Review AI Summary & Approve     | Admin             | Views structured AI summary; approves or rejects the complaint.              |
| UC-04 | Notify Accused Party            | Admin, System     | On approval, system dispatches automated notification via phone/email.       |
| UC-05 | Select & Request Lawyer         | Citizen           | Browses assigned court's lawyer roster and sends a request.                  |
| UC-06 | Accept or Reject Case Request   | Lawyer            | Reviews request and accepts (case goes active) or rejects.                   |
| UC-07 | Manage Hearing Schedule         | Admin             | Creates and updates hearing records with date, court, and notes.             |
| UC-08 | Track Case Progress             | Citizen, Lawyer   | Views full case timeline including hearings and status.                      |
| UC-09 | Close Case                      | Admin             | Marks case closed and records a final outcome note.                          |

---

## Feature Pipeline

The system follows an 8-phase sequential pipeline:

**Phase 1 — Complaint Filing (UC-01)**  
Citizen authenticates and submits the complaint form (title, description, accused contact). CaseController assigns a UUID, sets status to `pending`, and writes to the Cases DB.

**Phase 2 — AI Assessment & Court Routing (UC-02)**  
CaseController sanitises the complaint text (stripping PII) and sends it to the LLM API. The AI returns a JSON object with `recommendedCourt`, `relevanceScore`, and a `summary`. Only schema-validated fields are stored — raw LLM output is never persisted or exposed.

**Phase 3 — Admin Review & Approval (UC-03)**  
Admin sees a queue of pending cases with the structured AI summary. Admin can approve (optionally overriding the AI's court recommendation) or reject (with a rejection note sent back to the Citizen).

**Phase 4 — Accused Party Notification (UC-04)**  
On approval, the system automatically dispatches a notification (email or SMS) to the accused party containing only the case reference number — not the full complaint text. Failed deliveries are logged and retried.

**Phase 5 — Lawyer Selection (UC-05)**  
Citizen browses the filtered lawyer roster (by `courtType` and `isAvailable`). A `LawyerRequest` record is created on selection and the lawyer is notified.

**Phase 6 — Lawyer Accept / Reject (UC-06)**  
Lawyer accepts (case → `active`, citizen notified) or declines (citizen returns to roster). All request history is preserved for audit, including declined requests.

**Phase 7 — Hearing Management (UC-07, UC-08)**  
Admin creates and updates `Hearing` records. All parties are notified. Citizen and Lawyer view the full timeline via CaseDashboard (read-only). Loop repeats for each subsequent hearing.

**Phase 8 — Case Closure (UC-09)**  
Admin closes the case with a final outcome note. Status → `closed`, `closedAt` is timestamped. The complete case lifecycle (hearings, AI summary, request history, outcome) is permanently visible and no records are deleted.

**Case status state machine:** `pending` → `approved` / `rejected` → `active` → `closed`

---

## Data Architecture

### Data Stores

| ID  | Store           | Table Name       | Key Fields                                                                           |
|-----|-----------------|------------------|--------------------------------------------------------------------------------------|
| DS1 | Cases DB        | `cases`          | `caseId` (PK), `courtType`, `status`, `complaintText`, `filedAt`, `closedAt`, `outcome`, `lawyerId` (FK) |
| DS2 | AI Summaries    | `ai_summaries`   | `summaryId` (PK), `caseId` (FK), `recommendedCourt`, `parsedSummary`, `generatedAt` |
| DS3 | Notifications   | `notifications`  | `notifId` (PK), `caseId` (FK), `recipientContact`, `channel`, `sentAt`, `status`    |
| DS4 | Lawyers         | `lawyers`        | `lawyerId` (PK), `name`, `barId`, `specialisation`, `courtType`, `isAvailable`       |
| DS5 | Hearings        | `hearings`       | `hearingId` (PK), `caseId` (FK), `scheduledDate`, `notes`, `outcome`                |
| DS6 | Lawyer Requests | `lawyer_requests`| `requestId` (PK), `caseId` (FK), `lawyerId` (FK), `status`, `requestedAt`           |

### DFD Level 1 Process Map

| Process                    | Reads From   | Writes To    | External Entity |
|----------------------------|--------------|--------------|-----------------|
| P1 — File Complaint        | —            | DS1          | Citizen         |
| P2 — AI Assess & Route     | DS1          | DS2          | AI Agent        |
| P3 — Admin Review & Approve| DS1, DS2     | DS1          | Admin           |
| P4 — Notify Accused        | DS1          | DS3          | Accused Party   |
| P5 — Lawyer Selection      | DS4          | DS6          | Citizen         |
| P6 — Handle Lawyer Request | DS6          | DS1, DS6     | Lawyer          |
| P7 — Manage Hearings       | DS1          | DS5, DS3     | Admin           |
| P8 — Close Case            | DS1          | DS1, DS3     | Admin           |

---

## Class Model

### Entity Classes

| Class          | Key Attributes                                                                                  | Key Methods                                              |
|----------------|-------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| User (base)    | `userId`, `name`, `email`, `passwordHash`, `role` (enum), `createdAt`                          | `login()`, `logout()`, `updateProfile()`                 |
| Citizen        | extends User + `phone`, `address`                                                               | `fileComplaint()`, `selectLawyer()`, `viewCaseTimeline()`|
| Admin          | extends User + `courtType`, `employeeId`                                                        | `reviewAISummary()`, `approveCase()`, `scheduleHearing()`, `closeCase()` |
| Lawyer         | extends User + `barId`, `specialisation`, `courtType`, `isAvailable`                           | `acceptRequest()`, `declineRequest()`, `viewCaseTimeline()` |
| Case           | `caseId`, `courtType`, `status`, `complaintText`, `filedAt`, `closedAt`, `outcome`             | `updateStatus()`, `getTimeline()`, `close()`             |
| AISummary      | `summaryId`, `caseId` (FK), `recommendedCourt`, `parsedSummary`, `generatedAt`                  | `generate()`, `getSanitisedOutput()`                     |
| Hearing        | `hearingId`, `caseId` (FK), `scheduledDate`, `notes`, `outcome`                                 | `schedule()`, `addNotes()`, `recordOutcome()`            |
| Notification   | `notifId`, `caseId` (FK), `recipientContact`, `channel`, `sentAt`, `status`                    | `send()`, `retry()`                                      |
| LawyerRequest  | `requestId`, `caseId` (FK), `lawyerId` (FK), `status`, `requestedAt`, `respondedAt`            | `sendRequest()`, `updateStatus()`                        |

### Boundary & Control Classes

| Class                       | Type     | Role                                                                       |
|-----------------------------|----------|----------------------------------------------------------------------------|
| ComplaintForm               | Boundary | Citizen complaint form. Methods: `validate()`, `submit()`, `resetForm()`   |
| CaseDashboard               | Boundary | Read-only timeline for citizen and lawyer. Methods: `loadTimeline()`, `renderStatus()` |
| AdminPortal                 | Boundary | Admin interface: pending queue, AI summary cards, hearing form, closure controls |
| CaseController              | Control  | `submitComplaint()`, `triggerAIAssessment()`, `routeToAdmin()`, `notifyAccused()` |
| LawyerAssignmentController  | Control  | `fetchRoster()`, `sendRequest()`, `handleResponse()`, `promptReselection()` |

### Key Relationships

| Relationship                    | Type        | Multiplicity | Rationale                                               |
|---------------------------------|-------------|--------------|----------------------------------------------------------|
| User → Citizen / Admin / Lawyer | Inheritance | 1:1          | Shared identity fields; role-specific attributes in subclass |
| Case → AISummary                | Composition | 1:1          | AISummary has no existence outside a Case               |
| Case → Hearing                  | Composition | 1:*          | Hearings are owned by and deleted with Case             |
| Case → Notification             | Composition | 1:*          | Notifications reference a specific Case                 |
| Case → LawyerRequest            | Composition | 1:*          | Requests belong to a Case                               |
| Citizen → Case                  | Association | 1:1..*       | A citizen may file one or more cases                    |
| Lawyer → LawyerRequest          | Association | 1:*          | A lawyer receives multiple requests                     |

---

## Technology Stack

| Layer          | Technology               | Purpose                                                          |
|----------------|--------------------------|------------------------------------------------------------------|
| Frontend       | React.js (Vite)          | SPA with component-based UI and role-based routing               |
| UI Library     | Tailwind CSS + shadcn/ui | Utility-first styling; pre-built accessible components           |
| Backend        | Node.js + Express.js     | REST API, controller logic, AI integration, RBAC middleware      |
| ORM            | Sequelize                | Schema management, migrations, parameterised queries             |
| Database       | PostgreSQL                | Relational storage for all six case lifecycle data stores        |
| AI Module      | OpenAI API / Gemini API  | External LLM for court routing and relevance assessment          |
| Authentication | JWT + RBAC middleware    | Role-based route guards: citizen, admin, lawyer                  |
| Notifications  | Nodemailer / Twilio      | Email and SMS dispatch for accused party and in-portal alerts    |
| Version Control| GitHub (3 branches)      | `feature/backend`, `feature/frontend-citizen-lawyer`, `feature/frontend-admin-devops` |
| Environment    | dotenv                   | API keys, DB credentials, JWT secret — never committed to git    |

---

## Project Structure

```
lawpoint/
├── client/                         # React frontend (Members B and C)
│   └── src/
│       ├── api/                    # Axios instance + endpoint functions
│       ├── components/             # Shared: Navbar, LoadingSpinner, Badge, Modal
│       ├── context/                # AuthContext.jsx
│       ├── hooks/                  # useAuth.js, useCases.js
│       ├── pages/
│       │   ├── auth/               # Login.jsx, Register.jsx
│       │   ├── citizen/            # ComplaintForm, LawyerSelect, CaseDashboard, MyCases
│       │   ├── lawyer/             # LawyerDashboard, RequestCard
│       │   └── admin/              # AdminDashboard, CaseReview, HearingForm, AdminCaseView
│       └── utils/                  # tokenStorage.js, formatDate.js
├── server/                         # Node.js backend (Member A)
│   └── src/
│       ├── config/                 # db.js, ai.js
│       ├── controllers/            # caseController, lawyerController, authController, etc.
│       ├── middleware/             # auth.js (JWT verify), rbac.js (role guard)
│       ├── models/                 # User, Case, AISummary, Hearing, Notification, LawyerRequest, Lawyer
│       ├── routes/                 # auth.js, cases.js, lawyers.js, admin.js, hearings.js
│       ├── seeders/                # lawyerSeeder.js (9 pre-seeded lawyer records)
│       └── services/              # aiService.js, notificationService.js
├── .gitignore
└── README.md
```

---

## Setup & Installation

### Prerequisites

- Node.js v18+
- PostgreSQL 15+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/<org>/lawpoint.git
cd lawpoint
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env   # Fill in your credentials
```

**server/.env keys:**

```
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/lawpoint
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=24h
OPENAI_API_KEY=your_openai_key_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE=+1xxxxxxxxxx
```

```bash
# Create the PostgreSQL database
psql -U postgres -c "CREATE DATABASE lawpoint;"

# Start the server (syncs schema on first run)
npm run dev

# Seed the lawyer data (run once after first sync)
node src/seeders/lawyerSeeder.js
```

### 3. Frontend Setup

```bash
cd client
npm install
cp .env.example .env
```

**client/.env keys:**

```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

---

## API Contract

**Base URL:** All endpoints are prefixed with `/api/v1/`

### Auth — `/api/v1/auth`

| Method | Path        | Auth | Request Body                            | Response                                 |
|--------|-------------|------|-----------------------------------------|------------------------------------------|
| POST   | /register   | None | `{ name, email, password, phone, address }` | `{ success, token, user: { userId, name, role } }` |
| POST   | /login      | None | `{ email, password }`                   | `{ success, token, user: { userId, name, role } }` |
| GET    | /me         | JWT  | —                                       | `{ success, user: { userId, name, email, role } }` |

### Cases — `/api/v1/cases`

| Method | Path              | Auth              | Description                                                   |
|--------|-------------------|-------------------|---------------------------------------------------------------|
| POST   | /                 | citizen           | File a new complaint. Triggers AI assessment automatically.   |
| GET    | /:id              | citizen/lawyer/admin | Get single case with full timeline (AI summary, hearings, requests). |
| GET    | /my/cases         | citizen           | Get all cases filed by the logged-in citizen.                 |
| GET    | /pending          | admin             | List all `pending` cases with AISummary included.             |
| PATCH  | /:id/approve      | admin             | Approve complaint. Body: `{ courtType? }` (optional override).|
| PATCH  | /:id/reject       | admin             | Reject complaint. Body: `{ rejectionNote }`.                  |
| PATCH  | /:id/close        | admin             | Close case. Body: `{ outcomeNote }`.                          |

### Lawyers — `/api/v1/lawyers`

| Method | Path                       | Auth    | Description                                        |
|--------|---------------------------|---------|----------------------------------------------------|
| GET    | /                          | citizen | List lawyers. Use `?courtType=criminal` to filter. |
| POST   | /request                   | citizen | Send a request. Body: `{ caseId, lawyerId }`.      |
| PATCH  | /request/:id/accept        | lawyer  | Accept a LawyerRequest.                            |
| PATCH  | /request/:id/decline       | lawyer  | Decline a LawyerRequest.                           |
| GET    | /requests/incoming         | lawyer  | Get all incoming requests for the logged-in lawyer.|

### Hearings — `/api/v1/hearings`

| Method | Path              | Auth              | Description                                          |
|--------|-------------------|-------------------|------------------------------------------------------|
| POST   | /                 | admin             | Create a hearing. Body: `{ caseId, scheduledDate, notes }`. |
| PATCH  | /:id              | admin             | Update outcome. Body: `{ outcome, nextDate? }`.      |
| GET    | /case/:caseId     | citizen/lawyer/admin | Get all hearings for a case.                      |

### Standard Error Response

```json
{ "success": false, "message": "Human-readable error", "error": "Technical detail (dev only)" }
```

---

## Branch Ownership & Work Split

**Rule: No member touches another member's branch files.** All shared API contract changes must be communicated before updating dependent call sites.

| File / Directory                  | Owner    | Rule                                                              |
|-----------------------------------|----------|-------------------------------------------------------------------|
| `server/`                         | Member A | B and C must not create or edit files in `server/`               |
| `client/src/pages/citizen/`       | Member B | A and C must not edit citizen pages                              |
| `client/src/pages/lawyer/`        | Member B | A and C must not edit lawyer pages                               |
| `client/src/pages/admin/`         | Member C | A and B must not edit admin pages                                |
| `client/src/components/`          | B creates, C uses | Discuss via group chat before editing shared components |
| `client/src/App.jsx`              | B and C  | B adds citizen/lawyer routes; C adds admin routes. Merge carefully. |
| `.gitignore`, `README.md`, `.env.example` | Member C | Only C edits these root files                           |

---

## Git Workflow

### Commit Message Convention

| Prefix      | When to use                         | Example                                  |
|-------------|-------------------------------------|------------------------------------------|
| `feat:`     | New feature added                   | `feat: add complaint submission endpoint`|
| `fix:`      | Bug fixed                           | `fix: correct JWT expiry header`         |
| `chore:`    | Config, tooling, setup              | `chore: add eslint config`               |
| `docs:`     | Documentation only                  | `docs: update API contract`              |
| `test:`     | Tests added or updated              | `test: add case controller unit tests`   |
| `refactor:` | Code restructured, no behaviour change | `refactor: extract AI prompt builder` |

### Integration Merge Order (Member C)

1. PR: `feature/backend` → `main` (after Member A signals complete)
2. PR: `feature/frontend-citizen-lawyer` → `main` (after Member B signals complete)
3. Resolve any conflicts (most likely in `App.jsx` routing and shared components)
4. PR: `feature/frontend-admin-devops` → `main`
5. Run full end-to-end integration test (all 16 scenarios in the checklist below)

**Branch protection on `main`:** Require 1 reviewer approval before merging. No direct pushes allowed.

---

## Development Timeline

| Week   | Member A                                              | Member B                                                 | Member C                                               |
|--------|-------------------------------------------------------|----------------------------------------------------------|--------------------------------------------------------|
| Week 1 | DB models + associations + seeder. Auth endpoints. Push `.env.example`. | Project setup: Vite, Tailwind, Axios, AuthContext, Router. Login & Register pages. | Repo setup, branches, branch protection, README. Admin scaffold. Start AdminDashboard. |
| Week 2 | All case endpoints (file, get, pending, approve, reject, close). AI service. | ComplaintForm, MyCases list page.                        | CaseReview page (AI summary display + approve/reject). |
| Week 3 | Lawyer and request endpoints. Hearing endpoints. Notification service. | CaseDashboard (full timeline). LawyerSelect page.        | HearingForm (create + update). AdminCaseView with full timeline. |
| Week 4 | Bug fixes. Help B/C with API issues. Write Postman collection. | LawyerDashboard (accept/reject). All loading/error states. Final polish. | CaseClose modal. Final admin polish. Integration: merge all branches, resolve conflicts, end-to-end test. |

---

## Key Design Decisions

**Human-in-the-Loop AI** — The AI agent never makes binding decisions. It recommends; the Admin approves. Raw LLM output never leaves `aiService.js` — only `parsedSummary` and `recommendedCourt` are stored and displayed. The Admin can override the AI's court recommendation at the approval step.

**PII Isolation** — Accused party contact details are stripped from the complaint before it is sent to the LLM API. No PII reaches the external model.

**Full Audit Trail** — `LawyerRequest` records are never deleted, even when declined, preserving a complete selection history. No case records are deleted; the full lifecycle is permanently accessible.

**Pre-Seeded Lawyer Roster** — 9 lawyer records (3 courts × 3 lawyers) are seeded via migration. There is no lawyer self-registration flow in scope. The `isAvailable` boolean is system-managed based on caseload, not a free-text field.

**ORM-Only Database Access** — All DB operations use Sequelize with parameterised queries. No raw SQL strings anywhere in the codebase.

**JWT + RBAC** — JWT tokens encode the user's role. Every protected API route runs an RBAC middleware check before reaching the controller. CORS allows only the frontend origin; all API routes are prefixed `/api/v1/`.

---

## End-to-End Integration Test Checklist

Member C runs this after all branches are merged into `main`.

| # | Test Scenario                                                     | Expected Result                                                    | Pass? |
|---|-------------------------------------------------------------------|--------------------------------------------------------------------|-------|
| 1 | Register a new Citizen account                                    | Account created, JWT returned, redirected to `/dashboard`         | [ ]   |
| 2 | Register a Lawyer account (seed login credentials)               | Lawyer logs in and sees `/lawyer/dashboard`                        | [ ]   |
| 3 | Register an Admin account (seed login credentials)               | Admin logs in and sees `/admin/dashboard`                          | [ ]   |
| 4 | Citizen files a complaint with valid fields                       | Case created with `status='pending'`, AI assessment runs           | [ ]   |
| 5 | Admin sees the case in pending queue with AI summary             | AISummary visible with `recommendedCourt` and `parsedSummary`     | [ ]   |
| 6 | Admin approves the case                                          | Status → `approved`, notification record created for accused       | [ ]   |
| 7 | Admin rejects the case                                           | Status → `rejected`, citizen receives rejection notification       | [ ]   |
| 8 | Citizen selects a lawyer from the filtered roster                | `LawyerRequest` created with `status='pending'`, lawyer notified  | [ ]   |
| 9 | Lawyer declines the request                                      | Status → `declined`, citizen prompted to pick another lawyer       | [ ]   |
| 10| Citizen selects a different lawyer; lawyer accepts               | Status → `active`, citizen notified of acceptance                 | [ ]   |
| 11| Admin schedules a hearing                                        | Hearing record created, all parties notified                       | [ ]   |
| 12| Admin updates hearing with outcome                               | Hearing updated, timeline visible on CaseDashboard                 | [ ]   |
| 13| Admin closes the case with outcome note                          | Status → `closed`, final outcome visible on CaseDashboard         | [ ]   |
| 14| Citizen cannot access `/admin/dashboard`                         | Redirected to 403 or `/login`                                      | [ ]   |
| 15| Lawyer cannot access `/case/new` (citizen-only)                  | Redirected to 403 or `/login`                                      | [ ]   |
| 16| Unauthenticated user accesses any protected route                | Redirected to `/login`                                             | [ ]   |

---

## Future Scope

- Full-text search across case history for Admin and authorised legal professionals.
- In-app push notifications and hearing reminders (Firebase, Twilio).
- Analytics dashboard for Admin showing case load trends across court types and time periods.
- Multi-jurisdiction support — expanding beyond 3 courts to district, high court, and appellate tiers.
- Document upload and evidence management — attaching supporting files to complaints.
- Blockchain-backed verdict integrity — recording case outcomes as immutable ledger entries.
- Lawyer self-registration portal with bar council verification integration.
- Mobile application (React Native) for citizens to file and track complaints on mobile devices.

---

*LawPoint — Making justice accessible, transparent, and digitally empowered.*
