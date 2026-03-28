# Auto Detailing Management System

Sistem manajemen layanan auto detailing dengan React frontend dan Express.js + PostgreSQL backend.

## Struktur Proyek

```
autodetaailing/
├── backend/          # Backend API (Express + PostgreSQL)
├── src/              # Frontend (React + TypeScript)
└── package.json      # Root package.json
```

## Setup

> **Full setup guide**: See [SETUP.md](./SETUP.md) for detailed instructions including PostgreSQL installation and troubleshooting.

### 1. Backend Setup

Masuk ke folder `backend`:

```bash
cd backend
npm install
```

Setup database PostgreSQL dan buat file `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=autodetaailing
DB_USER=postgres
DB_PASSWORD=your_password

PORT=3001
NODE_ENV=development
SESSION_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

Jalankan migrasi dan seed:

```bash
npm run migrate
npm run seed
```

Start backend server:

```bash
npm run dev
```

Backend akan berjalan di `http://localhost:3001`

### 2. Frontend Setup

Di root directory:

```bash
npm install
```

Buat file `.env` (optional, default ke `http://localhost:3001/api`):

```env
VITE_API_URL=http://localhost:3001/api
```

Start development server:

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## Default Users

Setelah menjalankan seed, tersedia 3 user default:

- **Consumer**: `consumer1` / `consumer123`
- **Admin**: `admin1` / `admin123`
- **Worker**: `worker1` / `worker123`

## Fitur

### Consumer
- Buat pesanan detailing
- Lihat status pesanan
- Riwayat transaksi

### Admin
- Dashboard dengan pesanan baru
- Buat work order
- Kelola workers
- Lihat semua transaksi

### Worker
- Lihat work order yang di-assign
- Upload dokumentasi
- Selesaikan work order

## Teknologi

### Backend
- Express.js
- TypeScript
- PostgreSQL
- Express Session
- Bcrypt
- Multer (file upload)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Motion (Framer Motion)

## Production Build

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
npm run build
```

Output akan di folder `dist/`
