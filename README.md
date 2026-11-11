# Belajar Vibe Coding - Backend API

Project backend yang dibangun menggunakan **Bun**, framework **ElysiaJS**, ORM **Drizzle**, dan database **MySQL**.

---

## 🛠️ Tech Stack
- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Web Framework**: [ElysiaJS](https://elysiajs.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database Driver**: [mysql2](https://github.com/sidorares/node-mysql2)
- **Database**: MySQL

---

## 📁 Struktur Direktori
```text
.
├── drizzle/                # File migrasi SQL hasil generate Drizzle
├── src/
│   ├── db/
│   │   ├── index.ts        # Setup koneksi pool MySQL & client Drizzle
│   │   └── schema.ts       # Definisi schema tabel database
│   └── index.ts            # Entry point HTTP server Elysia
├── .env.example            # Template environment variables
├── .gitignore
├── drizzle.config.ts       # Konfigurasi Drizzle Kit & migrasi
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Memulai Project

### 1. Prasyarat
- [Bun](https://bun.sh/) (v1.1+)
- Server MySQL yang berjalan lokal atau remote.

### 2. Instalasi Dependensi
```bash
bun install
```

### 3. Konfigurasi Lingkungan (`.env`)
Salin file `.env.example` ke `.env` dan sesuaikan kredensial MySQL Anda:
```bash
cp .env.example .env
```

Contoh konfigurasi `.env`:
```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=belajar_vibe_coding
DATABASE_URL=mysql://root:@127.0.0.1:3306/belajar_vibe_coding
```

### 4. Migrasi Database
Untuk menghasilkan file migrasi SQL dari schema:
```bash
bun run db:generate
```

Untuk menerapkan langsung schema ke database MySQL:
```bash
bun run db:push
```

### 5. Menjalankan Server
Mode pengembangan (watch mode):
```bash
bun run dev
```

Mode produksi:
```bash
bun run start
```

---

## 📡 Endpoint API

| Method | Path | Deskripsi |
|---|---|---|
| `GET` | `/` | Root endpoint informasi server |
| `GET` | `/health` | Health check server & verifikasi koneksi MySQL |
| `GET` | `/api/users` | Mengambil daftar semua user |
| `POST` | `/api/users` | Menambahkan user baru (JSON body: `{ "name": "...", "email": "..." }`) |

---

## 🧪 Pemeriksaan Tipe & Linting
```bash
bun run typecheck
```
