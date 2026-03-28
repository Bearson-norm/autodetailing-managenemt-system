# Auto Detailing Backend API

Backend API untuk sistem manajemen auto detailing menggunakan Express.js, TypeScript, dan PostgreSQL.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Pastikan PostgreSQL sudah terinstall dan berjalan. Buat database baru:

```sql
CREATE DATABASE autodetaailing;
```

### 3. Environment Variables

Copy `.env.example` ke `.env` dan isi dengan konfigurasi yang sesuai:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=autodetaailing
DB_USER=postgres
DB_PASSWORD=your_password_here

PORT=3001
NODE_ENV=development

SESSION_SECRET=your_session_secret_here_change_in_production

CORS_ORIGIN=http://localhost:5173

MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### 4. Run Migrations

```bash
npm run migrate
```

### 5. Seed Database

```bash
npm run seed
```

Ini akan membuat 3 user default:
- `consumer1` / `consumer123`
- `admin1` / `admin123`
- `worker1` / `worker123`

### 6. Start Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/workers` - Get all workers (admin only)
- `POST /api/users/workers` - Create worker (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Transactions
- `GET /api/transactions` - Get transactions (filtered by role)
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create transaction (consumer only)
- `PUT /api/transactions/:id/status` - Update status (admin only)

### Work Orders
- `GET /api/work-orders` - Get work orders (filtered by role)
- `GET /api/work-orders/:id` - Get work order by ID
- `POST /api/work-orders` - Create work order (admin only)
- `POST /api/work-orders/:id/documents` - Upload documentation (worker only)
- `PUT /api/work-orders/:id/finish` - Finish work order (worker only)

## Production Build

```bash
npm run build
npm start
```

## File Uploads

File uploads disimpan di `backend/uploads/work-orders/`. Pastikan direktori ini memiliki permission yang sesuai.
