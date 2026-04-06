# Auto Detailing - Setup Guide

Complete setup instructions for the Auto Detailing Management System.

## Prerequisites

- **Node.js** (v18 or newer)
- **PostgreSQL** (v12 or newer)
- **npm** or **pnpm**

## Step 1: Install PostgreSQL

### Windows
1. Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run the installer and remember the password you set for the `postgres` user
3. Add PostgreSQL's `bin` folder to your PATH (e.g. `C:\Program Files\PostgreSQL\16\bin`)

### macOS
```bash
brew install postgresql@16
brew services start postgresql@16
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Step 2: Create the Database

The migration script expects a database named `autodetaailing` to exist.

### Option A: Using psql (recommended)
```bash
# Connect to PostgreSQL (you'll be prompted for the postgres user password)
psql -U postgres -d postgres

# In the psql prompt, run:
CREATE DATABASE autodetaailing;

# Exit
\q
```

### Option B: Using the setup script (Windows)
```powershell
cd backend\scripts
.\create-database.ps1
```

### Option C: Using pgAdmin
1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name: `autodetaailing`
4. Click Save

## Step 3: Configure Environment Variables

### Backend (.env)
The file `backend/.env` has been created. **Edit it and set your PostgreSQL password:**

```env
DB_PASSWORD=your_actual_postgres_password
```

If you use different database settings, update:
- `DB_HOST` - default: localhost
- `DB_PORT` - default: 5432
- `DB_USER` - default: postgres
- `DB_NAME` - default: autodetaailing

### Frontend (.env)
The file `.env` in the project root is optional. It defaults to `http://localhost:5000/api`. Only change if your backend runs on a different URL.

## Step 4: Install Dependencies & Run Migrations

### Backend
```bash
cd backend
npm install
npm run migrate    # Creates tables
npm run seed       # Adds default users
npm run dev        # Start backend server
```

### Frontend (in a new terminal)
```bash
# From project root
npm install
npm run dev        # Start frontend (Vite)
```

## Step 5: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Default Login Credentials

After running the seed:

| Role     | Username   | Password    |
|----------|------------|-------------|
| Consumer | consumer1  | consumer123 |
| Admin    | admin1     | admin123    |
| Worker   | worker1    | worker123   |

## Testing Consumer + Admin Bersamaan

Untuk menguji alur (misalnya consumer buat pesanan → admin terima notifikasi), Anda perlu **dua browser context terpisah** karena satu browser hanya menyimpan satu session cookie per domain:

| Browser 1 | Browser 2 |
|-----------|------------|
| Chrome biasa | Chrome Incognito (Ctrl+Shift+N) |
| Firefox | Chrome |
| Edge | Firefox |

**Cara:**
1. Buka browser 1 → http://localhost:5173 → login sebagai **admin**
2. Buka browser 2 (atau incognito) → http://localhost:5173 → login sebagai **consumer**
3. Di consumer: buat pesanan baru
4. Di admin: notifikasi popup + sound akan muncul

## Notifikasi di Laptop & Handphone

### Laptop
- **Banner** – Muncul di bagian atas layar saat pesanan baru masuk (bisa ditutup dengan tombol X)
- **Toast** – Popup kecil di tengah layar
- **Browser notification** – Notifikasi sistem (muncul meski tab tidak fokus)
- **Sound** – Efek suara saat pesanan baru

### Handphone
- **Banner** – Responsif, tampil di atas layar
- **Browser notification** – Di Android Chrome: izinkan notifikasi saat diminta, notifikasi akan muncul meski browser di background
- **Vibrate** – Getar saat notifikasi (jika didukung perangkat)
- **iOS** – Dukungan terbatas; untuk notifikasi saat app tertutup, tambahkan ke Home Screen (PWA) dan gunakan iOS 16.4+

### Web Push (tab tertutup / layar kunci)

Notifikasi **sistem** ke HP/laptop saat tab tidak aktif memakai **Web Push** (admin & worker).

1. **Migrasi tabel** `push_subscriptions`:
   - Database baru: `cd backend && npm run migrate` (sudah menyertakan `002_push_subscriptions.sql`)
   - Database lama yang sudah pernah di-migrate: `cd backend && npm run migrate:push`
2. **Kunci VAPID** di `backend/.env`:
   ```bash
   cd backend
   npx web-push generate-vapid-keys
   ```
   Salin output ke `VAPID_PUBLIC_KEY` dan `VAPID_PRIVATE_KEY`, dan set `VAPID_SUBJECT=mailto:email@domain.com`.
3. **HTTPS** di production (wajib untuk push di browser); `localhost` boleh HTTP untuk development.
4. Setelah login sebagai **admin** atau **worker**, terima prompt **izinkan notifikasi** — subscription akan tersimpan otomatis.

Tanpa VAPID yang valid, SSE + banner di dalam tab tetap berjalan; Web Push dinonaktifkan sampai env diisi.

## Troubleshooting

### "Connection refused" or "ECONNREFUSED"
- Ensure PostgreSQL is running
- Check `DB_HOST` and `DB_PORT` in `.env`
- On Windows: Services → PostgreSQL → Start

### "password authentication failed"
- Verify `DB_PASSWORD` in `backend/.env` matches your PostgreSQL user password
- Default PostgreSQL user is `postgres`

### "database does not exist"
- Create the database first (Step 2)
- Verify `DB_NAME=autodetaailing` in `.env`

### Migration fails with "relation already exists"
- The database was already migrated. You can run `npm run seed` to add/update default users
- To start fresh: drop the database and recreate it, then run migrate again

### CORS errors in browser
- Ensure backend is running on port 5000
- Check `CORS_ORIGIN=http://localhost:5173` in `backend/.env`
