# Belajar Vibe Coding - Backend API

REST API autentikasi user berbasis token (registrasi, login, lihat profil, logout). Dibangun dengan **Bun**, **ElysiaJS**, **Drizzle ORM**, dan **MySQL**.

Setelah login, server membuat token (UUID) yang disimpan di tabel `session`. Token dikirim client lewat header `Authorization: Bearer <token>` untuk mengakses endpoint yang dilindungi.

---

## Tech Stack

| Kategori | Teknologi |
|---|---|
| Runtime, package manager, test runner | [Bun](https://bun.sh/) |
| Web framework | [ElysiaJS](https://elysiajs.com/) (validasi request memakai `t` / TypeBox bawaan Elysia) |
| ORM & migrasi | [Drizzle ORM](https://orm.drizzle.team/) + [drizzle-kit](https://orm.drizzle.team/kit-docs/overview) |
| Driver database | [mysql2](https://github.com/sidorares/node-mysql2) |
| Database | MySQL 8 |
| Hash password | `Bun.password` (bcrypt, cost 10) |
| Bahasa | TypeScript |

---

## Struktur Folder

```text
.
├── drizzle/                  # File migrasi SQL hasil drizzle-kit generate
├── src/
│   ├── db/
│   │   ├── index.ts          # Koneksi pool MySQL + client Drizzle
│   │   └── schema.ts         # Definisi tabel (users, session)
│   ├── routes/
│   │   └── users-route.ts    # Routing Elysia (HTTP layer: validasi & response)
│   ├── services/
│   │   └── users-services.ts # Logika bisnis & akses database
│   ├── utils/
│   │   └── port.ts           # Helper parsePort
│   └── index.ts              # Entry point: membuat app Elysia & menjalankan server
├── test/                     # Unit test (bun test)
│   ├── helpers.ts            # clearDatabase & helper register/login
│   ├── types.ts              # Tipe response untuk test
│   └── *.test.ts             # Satu file test per endpoint
├── .env.example              # Template environment aplikasi
├── .env.test.example         # Template environment untuk test
├── drizzle.config.ts         # Konfigurasi drizzle-kit
└── package.json
```

### Konvensi
- **Routes** (`src/routes/`): hanya menangani HTTP (validasi input, status code, bentuk response). Nama file `<nama>-route.ts`, contoh `users-route.ts`.
- **Services** (`src/services/`): berisi logika bisnis dan query database. Nama file `<nama>-services.ts`, contoh `users-services.ts`.
- Service mengembalikan hasil `{ success, data }` atau `{ success: false, error, code }`, lalu route yang menerjemahkannya menjadi response HTTP.
- File test memakai format `<nama>.test.ts` di folder `test/`.

---

## Schema Database

### Tabel `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | BIGINT UNSIGNED, PK, auto increment | |
| `name` | VARCHAR(255), NOT NULL | |
| `email` | VARCHAR(255), NOT NULL, UNIQUE | |
| `password` | VARCHAR(255), NOT NULL | Hash bcrypt, bukan teks asli |
| `created_at` | TIMESTAMP, NOT NULL | Default waktu sekarang |

### Tabel `session`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | BIGINT UNSIGNED, PK, auto increment | |
| `token` | VARCHAR(255), NOT NULL, UNIQUE (`session_token_unique_idx`) | Token UUID hasil login |
| `user_id` | BIGINT UNSIGNED, NOT NULL | FK ke `users.id`, `ON DELETE CASCADE` |
| `created_at` | TIMESTAMP, NOT NULL | Default waktu sekarang |

Satu user bisa punya banyak session (login dari banyak perangkat). Logout hanya menghapus session milik token yang dipakai.

---

## Setup Project

### 1. Prasyarat
- [Bun](https://bun.sh/) v1.1+
- MySQL yang sedang berjalan (lokal atau remote)

### 2. Install dependensi
```bash
bun install
```

### 3. Environment
```bash
cp .env.example .env
```
Isi `.env` sesuai MySQL Anda:
```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<password-mysql-anda>
DB_NAME=belajar_vibe_coding
```
`DB_USER`, `DB_PASSWORD`, dan `DB_NAME` wajib diisi. Tanpa ketiganya aplikasi gagal start dengan pesan error. `PORT` dan `DB_PORT` yang tidak valid (bukan angka 1–65535) akan memakai nilai default (3000 dan 3306).

### 4. Buat database dan tabel
Buat database kosong lebih dulu:
```sql
CREATE DATABASE belajar_vibe_coding;
```
Lalu terapkan schema:
```bash
bun run db:push       # langsung sinkronkan schema ke database
# atau
bun run db:migrate    # jalankan file migrasi di folder drizzle/
```
Jika schema berubah, buat migrasi baru dengan `bun run db:generate`.

---

## Menjalankan Aplikasi

```bash
bun run dev      # mode development (watch / auto reload)
bun run start    # mode produksi
```
Server berjalan di `http://localhost:3000` (atau sesuai `PORT`).

---

## API

Semua endpoint user berada di bawah prefix `/api`. Body request berformat JSON.

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| `GET` | `/` | - | Info bahwa server berjalan |
| `GET` | `/health` | - | Health check + status koneksi database |
| `POST` | `/api/users` | - | Registrasi user baru |
| `POST` | `/api/users/login` | - | Login, mengembalikan token |
| `GET` | `/api/users/current` | Bearer | Data user yang sedang login |
| `DELETE` | `/api/users/logout` | Bearer | Logout (hapus session token) |

### `GET /health`
- `200`: `{ "status": "healthy", "uptime": 12.3, "database": { "ok": true, "message": "..." } }`
- `503`: status `degraded` jika database tidak terhubung.

### `POST /api/users`
Body:
```json
{ "name": "Dimas", "email": "dimas@example.com", "password": "rahasia123" }
```
Validasi: `name` 1–255 karakter, `email` format email valid, `password` 8–72 karakter.
- `200`: `{ "data": "OK" }`
- `400`: `{ "error": "email sudah terdaftar" }`
- `422`: validasi gagal

### `POST /api/users/login`
Body:
```json
{ "email": "dimas@example.com", "password": "rahasia123" }
```
- `200`: `{ "data": "<token>" }`
- `400`: `{ "error": "email atau password salah" }`
- `422`: validasi gagal (email tidak valid / password kosong)

### `GET /api/users/current`
Header: `Authorization: Bearer <token>` (kata `Bearer` tidak case-sensitive)
- `200`:
  ```json
  { "data": { "id": 1, "name": "Dimas", "email": "dimas@example.com", "created_at": "2026-11-12T06:00:00.000Z" } }
  ```
- `401`: `{ "error": "Unauthorized" }` (header kosong/format salah/token tidak ditemukan)

### `DELETE /api/users/logout`
Header: `Authorization: Bearer <token>`
- `200`: `{ "data": "OK" }`
- `401`: `{ "error": "Unauthorized" }`

### Error server
Kesalahan tak terduga mengembalikan `500` dengan `{ "error": "Internal server error" }`. Detail error hanya dicatat di log server dan tidak dikirim ke client.

### Contoh pemakaian (curl)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Dimas","email":"dimas@example.com","password":"rahasia123"}'

curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dimas@example.com","password":"rahasia123"}'

curl http://localhost:3000/api/users/current -H "Authorization: Bearer <token>"
curl -X DELETE http://localhost:3000/api/users/logout -H "Authorization: Bearer <token>"
```

---

## Testing

Unit test memakai `bun test` dan memanggil app lewat `app.handle(new Request(...))`, jadi tidak perlu menjalankan server terpisah. Test tetap membutuhkan MySQL karena menyentuh database asli.

> **Penting:** sebelum setiap skenario, test menghapus semua data di tabel `session` dan `users`. Karena itu test **harus** memakai database terpisah. Fungsi `clearDatabase()` menolak berjalan jika `DB_NAME` tidak berakhiran `_test`.

### Persiapan
1. Buat database test dan tabelnya:
   ```sql
   CREATE DATABASE belajar_vibe_coding_test;
   ```
2. Salin template environment test lalu isi password MySQL:
   ```bash
   cp .env.test.example .env.test
   ```
   `.env.test` dimuat otomatis oleh `bun test` dan sudah masuk `.gitignore`.
3. Terapkan schema ke database test, misalnya dengan menjalankan `bun run db:push` sementara `DB_NAME=belajar_vibe_coding_test` (lewat environment variable).

### Menjalankan
```bash
bun test                          # semua test
bun test test/login.test.ts       # satu file saja
bun run typecheck                 # cek tipe TypeScript
```

### Cakupan test
| File | Yang diuji |
|---|---|
| `root.test.ts` | `GET /` |
| `health.test.ts` | `GET /health` |
| `register.test.ts` | Registrasi: sukses, validasi (name/email/password), batas panjang, email duplikat |
| `login.test.ts` | Login: sukses, email/password salah, validasi, multi-session |
| `get-current-user.test.ts` | Profil user: token valid, header salah, token tidak valid, token yang sudah logout |
| `logout.test.ts` | Logout: sukses, token tidak valid, logout ganda, session lain tetap aktif |
