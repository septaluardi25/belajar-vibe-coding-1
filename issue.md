# [Task] Setup Project Backend dengan Bun, ElysiaJS, Drizzle ORM, dan MySQL

## 1. Ringkasan
Inisialisasi project backend baru pada folder ini menggunakan runtime dan package manager **Bun**. Project ini menggunakan framework **ElysiaJS** untuk HTTP server dan **Drizzle ORM** untuk manajemen database **MySQL**.

---

## 2. Tech Stack & Dependencies
- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Web Framework**: [ElysiaJS](https://elysiajs.com/) (`elysia`)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) (`drizzle-orm`, `drizzle-kit`)
- **Database Driver**: MySQL (`mysql2`)
- **Environment Config**: Native Bun `.env` support

---

## 3. Tahapan Implementasi (High-Level Steps)

### Tahap 1: Inisialisasi Project Bun
- Jalankan inisialisasi project Bun di root direktori (`bun init`).
- Pastikan konfigurasi TypeScript (`tsconfig.json`) siap digunakan untuk project Bun & Elysia.
- Install dependensi utama:
  - `elysia`
  - `drizzle-orm`
  - Driver MySQL (`mysql2`)
- Install development dependencies:
  - `drizzle-kit` (untuk CLI migrasi / schema push)
  - Type definitions terkait (`@types/bun`)

### Tahap 2: Setup Environment & Git Ignore
- Buat file `.gitignore` untuk mengabaikan `node_modules`, file environment `.env`, dan folder build/dist.
- Buat file template `.env.example` dan `.env` lokal:
  - Port aplikasi (`PORT=3000`)
  - Konfigurasi koneksi MySQL (Host, Port, User, Password, Nama Database, atau `DATABASE_URL`).

### Tahap 3: Konfigurasi Database & Drizzle ORM
- Buat modul koneksi database MySQL menggunakan Drizzle ORM.
- Buat file konfigurasi Drizzle (`drizzle.config.ts`) untuk mengatur direktori schema dan kredensial database.
- Definisikan satu schema tabel dasar/sample (`users`) untuk memvalidasi ORM.
- Tambahkan script migrasi di `package.json` (`db:generate`, `db:push`).

### Tahap 4: Setup Server ElysiaJS
- Buat entry point server (`src/index.ts`).
- Inisialisasi server ElysiaJS dengan port yang dinamis dari environment variable.
- Sediakan endpoint health check (`GET /` dan `GET /health`):
  - Mengembalikan status server menyala.
  - Memverifikasi konektivitas dasar ke database MySQL melalui Drizzle ORM.
- Endpoint CRUD sample (`/api/users`).

### Tahap 5: Standardisasi Script & Dokumentasi
- Pastikan script runnable di `package.json`:
  - `dev`: Menjalankan server dalam mode watch (`bun --watch src/index.ts`).
  - `start`: Menjalankan server mode production (`bun src/index.ts`).
  - `db:generate` & `db:push`: Perintah CLI Drizzle.
- Buat atau perbarui `README.md` dengan instruksi setup dan penggunaan.

---

## 4. Acceptance Criteria (Kriteria Selesai)
- [x] Project Bun berhasil diinisialisasi dan semua dependensi terpasang tanpa konflik.
- [x] Server ElysiaJS dapat dijalankan dengan perintah `bun run dev` / `bun run start`.
- [x] Terdapat endpoint health check yang merespons status `200 OK` (atau `503` jika DB belum running).
- [x] Konfigurasi Drizzle ORM dan MySQL terintegrasi dengan schema tabel.
- [x] Script migrasi/push schema Drizzle (`drizzle-kit`) dapat dieksekusi dengan baik.
- [x] File rahasia `.env` tidak terlacak oleh Git.
- [x] Dokumentasi cara setup dan menjalankan aplikasi tertulis jelas di `README.md`.

