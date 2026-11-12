# Issue: Buatkan Unit Test untuk Semua API

## Deskripsi
Proyek ini belum memiliki unit test. Diperlukan unit test yang lengkap untuk semua endpoint API yang tersedia menggunakan **Bun test** (`bun test`).

## Aturan Umum
- Simpan semua file test di folder `test/` pada root project.
- Gunakan `bun test` untuk menjalankan test.
- **Setiap skenario test, hapus data terkait terlebih dahulu** (bersihkan tabel `session` dan `users` sebelum tiap test) agar hasilnya konsisten dan tidak tergantung pada data sebelumnya.
- Gunakan `app.handle(new Request(...))` dari Elysia untuk mengirim request tanpa perlu menjalankan server secara terpisah.
- Gunakan `describe` dan `it`/`test` untuk mengelompokkan skenario test.
- Gunakan `beforeEach` atau `beforeAll` untuk membersihkan data sebelum setiap skenario.

## Daftar API yang Harus Ditest

### 1. `GET /` — Root / Welcome
**File test**: `test/root.test.ts`

**Skenario**:
- Harus mengembalikan status `200`
- Harus mengembalikan `{ success: true, message: "..." }`

---

### 2. `GET /health` — Health Check
**File test**: `test/health.test.ts`

**Skenario**:
- Harus mengembalikan status `200` dengan `{ status: "healthy", ... }` ketika DB terhubung
- Harus mengembalikan field `uptime` bertipe number
- Harus mengembalikan field `database` yang berisi status koneksi DB

---

### 3. `POST /api/users` — Registrasi User
**File test**: `test/register.test.ts`

**Skenario sukses**:
- Registrasi dengan data valid (name, email, password) → status `200`, response `{ data: "OK" }`

**Skenario validasi (harus ditolak)**:
- Body kosong (tanpa field apapun)
- `name` kosong (string kosong `""`)
- `name` melebihi 255 karakter
- `email` kosong
- `email` format tidak valid (bukan format email)
- `password` kosong

**Skenario duplikasi**:
- Registrasi dengan email yang sudah terdaftar → harus error `400` dengan pesan `"email sudah terdaftar"`

---

### 4. `POST /api/users/login` — Login User
**File test**: `test/login.test.ts`

> **Prasyarat**: sebelum test login, daftarkan user terlebih dahulu di `beforeEach`/`beforeAll`.

**Skenario sukses**:
- Login dengan email dan password yang benar → status `200`, response `{ data: "<token>" }` (token berupa string UUID)

**Skenario gagal**:
- Email tidak terdaftar → status `400`, error `"email atau password salah"`
- Email terdaftar tapi password salah → status `400`, error `"email atau password salah"`
- Body kosong
- `email` kosong
- `password` kosong

**Skenario multiple session**:
- Login dua kali dengan user yang sama → harus menghasilkan dua token yang berbeda (multiple session didukung)

---

### 5. `GET /api/users/current` — Get Current User
**File test**: `test/get-current-user.test.ts`

> **Prasyarat**: daftarkan user dan login terlebih dahulu untuk mendapatkan token.

**Skenario sukses**:
- Request dengan header `Authorization: Bearer <token_valid>` → status `200`, response `{ data: { id, name, email, created_at } }`
- Pastikan field `id` bertipe number
- Pastikan field `name` dan `email` sesuai dengan data yang didaftarkan
- Pastikan field `created_at` ada dan tidak kosong

**Skenario gagal**:
- Tanpa header `Authorization` → status `401`, error `"Unauthorized"`
- Header `Authorization` tanpa prefix `Bearer` (misalnya `Authorization: <token>`) → status `401`
- Header `Authorization: Bearer ` (ada prefix tapi token kosong) → status `401`
- Token tidak valid / tidak ada di database → status `401`, error `"Unauthorized"`
- Token yang sudah di-logout (sudah dihapus dari session) → status `401`

---

### 6. `DELETE /api/users/logout` — Logout User
**File test**: `test/logout.test.ts`

> **Prasyarat**: daftarkan user dan login terlebih dahulu untuk mendapatkan token.

**Skenario sukses**:
- Logout dengan token valid → status `200`, response `{ data: "OK" }`
- Setelah logout, token tersebut tidak bisa digunakan lagi untuk `GET /api/users/current` (harus `401`)

**Skenario gagal**:
- Tanpa header `Authorization` → status `401`, error `"Unauthorized"`
- Header `Authorization` tanpa prefix `Bearer` → status `401`
- Token tidak valid / tidak ada di database → status `401`, error `"Unauthorized"`
- Logout dua kali dengan token yang sama → yang pertama `200`, yang kedua `401`

**Skenario multiple session**:
- User login dua kali (dapat token A dan token B), logout token A → token A tidak bisa digunakan, tapi token B masih bisa digunakan

---

## Struktur Folder yang Diharapkan

```
test/
├── root.test.ts
├── health.test.ts
├── register.test.ts
├── login.test.ts
├── get-current-user.test.ts
└── logout.test.ts
```

## Cara Menjalankan

```bash
bun test
```

## Checklist
- [ ] Buat folder `test/`
- [ ] Buat helper/util untuk membersihkan data sebelum setiap test
- [ ] Buat `test/root.test.ts`
- [ ] Buat `test/health.test.ts`
- [ ] Buat `test/register.test.ts`
- [ ] Buat `test/login.test.ts`
- [ ] Buat `test/get-current-user.test.ts`
- [ ] Buat `test/logout.test.ts`
- [ ] Jalankan `bun test` dan pastikan semua test passed

---

*Panduan ini dirancang agar mudah diikuti oleh programmer junior atau AI model yang lebih murah.*
