# DevClash - Professional Networking & Hiring Platform

DevClash is a high-performance, LinkedIn-inspired professional networking platform built for developers and founders. It features a full-featured social feed, marketplace for funding, job board, and a robust admin verification system.

## 🚀 Tech Stack
- **Frontend**: Next.js 15+, TypeScript, Tailwind CSS, Framer Motion, Redux Toolkit
- **Backend**: Bun, Express, TypeScript, Socket.io
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT & Face Recognition Authentication
- **Media**: ImageKit for image uploads

---

## 🛠️ Project Structure
```text
devclash/
├── builtforjob-be/      # Bun + Express Backend
├── BuildForJob-FE/      # User Dashboard (Next.js)
└── admin/               # Admin Management Panel (Next.js)
```

---

## 🏁 Getting Started

### 1. Prerequisites
- [Bun](https://bun.sh/) installed (Recommended) or Node.js
- PostgreSQL database instance

### 2. Environment Setup
Create `.env` files in both the backend and frontend directories.

#### Backend (`builtforjob-be/.env`):
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/devclash"
JWT_SECRET="your_jwt_secret"
IMAGEKIT_PUBLIC_KEY="your_public_key"
IMAGEKIT_PRIVATE_KEY="your_private_key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_id"
RESEND_API_KEY="your_resend_key"
```

#### Frontend (`BuildForJob-FE/.env.local`):
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

### 3. Initialization

#### Step A: Backend Setup
```bash
cd builtforjob-be
bun install
bun run db:generate   # Generates Prisma client
bun run db:migrate    # Applies database migrations
bun run dev           # Starts backend on port 5000
```

#### Step B: Frontend Setup
```bash
cd BuildForJob-FE
bun install
bun run dev           # Starts dashboard on port 3000
```

#### Step C: Admin Panel Setup
```bash
cd admin
bun install
bun run dev           # Starts admin panel on port 3001
```

---

## 🏗️ Building for Production

To create optimized production builds, run the following commands in their respective directories:

- **Backend**: `bun run build` (Outputs to `dist/app.js`)
- **Frontend**: `bun run build`
- **Admin**: `bun run build`

---

## 🔍 Key Features
- **Short ID System**: Every user gets a unique, searchable ID (e.g., `#ABC123`).
- **Universal Search**: Search across users, companies, and roles instantly from the header.
- **Admin Verification**: Founders must upload documents which are reviewed by admins.
- **Marketplace**: Connect with middlemen or founders for funding opportunities.
- **Face Auth**: Highly secure biometric login option.

---

## 📝 License
This project is private and intended for internal use.
