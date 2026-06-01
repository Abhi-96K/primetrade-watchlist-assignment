# Primetrade.ai - Web3 Watchlist REST API & UI Panel

A highly polished, production-ready full-stack application built for the **Backend Developer (Intern) Assignment**. 

It features a modular **Node.js Express + TypeScript + Prisma** backend and a premium, high-fidelity **React + Vite** frontend styled with customized Web3 space gradients and glassmorphism.

---

## 🚀 Quick Demo Access (Prefilled Credentials)
To make evaluation fast and smooth, the database is pre-seeded with two accounts. The UI includes **one-click login prefill buttons** for both:
- **Standard Trader Profile**:
  - **Email**: `user@primetrade.ai`
  - **Password**: `password123`
- **Systems Architect (Admin) Profile**:
  - **Email**: `admin@primetrade.ai`
  - **Password**: `password123`

---

## 🛠️ Technology Stack & Modular Architecture
### 1. Backend Service (`backend/`)
- **Core Framework**: Express.js with TypeScript (`tsc` compiled).
- **Database Layer**: Prisma ORM with SQLite (zero-config, SQLite runs out of the box. Highly modular: easily swappable to PostgreSQL or MySQL by modifying `schema.prisma`).
- **Authentication**: JWT (JSON Web Tokens) with a 24-hour expiration check.
- **Security & Reliability**:
  - `bcryptjs` for secure password hashing.
  - `helmet` to set HTTP response headers for security against standard exploits.
  - `cors` enabling selective cross-origin requests.
  - `express-rate-limit` for DDoS prevention and rate limiting.
- **Input Validation**: `zod` schema validator matching inputs before they reach controllers.
- **Structured Logging**: `winston` logging levels (HTTP, info, warning, error) with timestamps.
- **Self-Documenting API**: Swagger UI documentation hosted natively at `/api-docs`.

### 2. Frontend Interface (`frontend/`)
- **Engine**: Vite + React.js with TypeScript.
- **Custom Design System**: Pure Vanilla CSS (`index.css`) utilizing customized HSL colors, CSS variables, glowing shadows, glass frosted overlays, and fluid mobile responsiveness.
- **State Coordination**: React Contexts for global authentication sessions and sliding success/error notifications (Toasts).
- **Advanced Admin Observability**: Special interactive charts, analytics lists, and platform log streams rendered dynamically depending on the user's JWT role.

---

## 📂 Project Directory Structure
```
innternship_assignment/
├── backend/
│   ├── prisma/
│   │   ├── dev.db            # Local SQLite database
│   │   ├── schema.prisma     # DB Schema definitions
│   │   └── migrations/       # SQL Migration records
│   ├── src/
│   │   ├── config/           # DB Client, Winston Logger
│   │   ├── controllers/      # Express controllers (auth, watchlist)
│   │   ├── middlewares/      # JWT verification, Role authorization, Zod validation, error handler
│   │   ├── routes/           # Versioned REST APIs (/api/v1)
│   │   ├── schemas/          # Zod schema definitions
│   │   ├── services/         # Business logic layer (interaction with Prisma)
│   │   ├── app.ts            # Entrypoint & Swagger mounting
│   │   └── seed.ts           # DB Seeding script
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # Custom React UI components
│   │   ├── context/          # AuthSession and ToastNotification Contexts
│   │   ├── pages/            # Login, Register, and Dashboard Pages
│   │   ├── App.tsx           # Session-based Route Coordinator
│   │   ├── index.css         # Styling system (Glassmorphism & animations)
│   │   └── main.tsx          # Application Mounting
│   ├── package.json
│   └── tsconfig.json
├── README.md                 # Complete guide
├── SCALABILITY.md            # Advanced scalability note
└── Dockerfile                # Multi-stage Docker setup (optional)
```

---

## ⚙️ Local Setup & Execution Guide

### Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed.

---

### Step 1: Initialize and Seed the Backend Database
Navigate to the `backend/` folder:
```bash
cd backend
```

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Apply Database Schema**:
   Prisma will initialize the SQLite database file (`dev.db`) and create standard SQL tables:
   ```bash
   npx prisma migrate dev --name init
   ```
3. **Seed Default Records**:
   Run the seeding script to inject pre-populated portfolios and user accounts:
   ```bash
   npx ts-node src/seed.ts
   ```
4. **Boot Dev Server**:
   Start the Node server with auto-refresh:
   ```bash
   npm run dev
   ```
   *The server will start running on **`http://localhost:5001`**.*
   *Interactive Swagger Documentation is available at **`http://localhost:5001/api-docs`**.*

---

### Step 2: Boot the Frontend Dashboard
Open a new terminal window and navigate to the `frontend/` folder:
```bash
cd frontend
```

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Launch Dev Client**:
   ```bash
   npm run dev
   ```
   *The frontend client will open on **`http://localhost:5173`** (or another port outputted in the terminal).*

---

## 🔒 Security Best Practices Implemented
1. **Password Safety**: High-security salting & hashing via `bcryptjs`. Raw passwords are never stored in the database.
2. **Sanitization**: Dynamic SQL injection protection via Prisma parameter binding, and deep JSON validation via Zod.
3. **Access Controls**: Multi-tier security middleware ensuring standard users can only view and modify their own watchlists, while elevating dashboard permissions for system admins.
4. **Rate Limiting**: Custom limits (200 requests / 15 minutes) prevent route bombardment and API abuse.
