# Issue: Registrasi gagal ketika `name` melebihi 255 karakter

## Deskripsi
Saat mencoba mendaftarkan user baru dengan **nama lebih dari 255 karakter**, API mengembalikan **500 Internal Server Error**. Error ini berasal dari pernyataan `INSERT` MySQL karena kolom `users.name` didefinisikan sebagai `VARCHAR(255)`. Payload request terlihat seperti:

```json
{
  "name": "aaaaaaaa... (300 karakter)",
  "email": "longname@example.com",
  "password": "secret123"
}
```

MySQL menolak insert tersebut, dan server meneruskan error DB sebagai:

```json
{ "error": "Failed query: insert into `users` ... params: aaaaaaaaa..." }
```

## Tujuan
Memberikan panduan langkah‑demi‑langkah yang jelas untuk programmer junior (atau model AI yang lebih murah) agar memperbaiki masalah ini sehingga:
- API melakukan validasi panjang input **sebelum** menyentuh database, mengembalikan `400 Bad Request` yang ramah.
- Atau, bila diperlukan nama yang lebih panjang, skema basis data diperbarui dan migrasi dijalankan.

---

## Pilihan Perbaikan
### 1️⃣ Tambahkan validasi pada level request (direkomendasikan bila batas 255 karakter sudah cukup)
1. Buka file `src/routes/users-route.ts`.
2. Temukan definisi route registrasi (`POST "/users"`).
3. Tambahkan batas maksimum pada field `name`:
   ```ts
   name: t.String({ minLength: 1, maxLength: 255 })
   ```
4. Simpan file.
5. Jalankan `bun check` untuk memastikan tidak ada error TypeScript.
6. Restart server (`bun src/index.ts`).
7. Uji kembali registrasi dengan nama 300 karakter – kini harus mendapat respons:
   ```json
   { "error": "name must be at most 255 characters" }
   ```
   (Elysia otomatis mengembalikan status 400 untuk pelanggaran schema.)

### 2️⃣ Perbesar ukuran kolom di database (jika memang perlu nama lebih panjang)
1. Buka file `src/db/schema.ts`.
2. Ubah definisi kolom `name`:
   ```ts
   // sebelumnya
   name: varchar("name", { length: 255 }).notNull(),
   // ganti menjadi (contoh 512)
   name: varchar("name", { length: 512 }).notNull(),
   ```
3. Buat migrasi baru:
   ```bash
   bun db:push   # akan menghasilkan skrip migrasi di folder drizzle/
   ```
4. Terapkan migrasi ke DB lokal:
   ```bash
   bun db:migrate
   ```
5. (Opsional) Perbarui validasi di route dengan `maxLength` yang sesuai.
6. Restart server dan jalankan kembali tes registrasi – kini request harus berhasil dengan status 200 dan data user baru.

---

## Checklist untuk Programmer Junior
- [ ] **Validasi input** – tambahkan `maxLength: 255` (atau ukuran yang cocok) pada schema route.
- [ ] **Jalankan type‑check** – `bun check` → tidak ada error.
- [ ] **Restart server** – `bun src/index.ts` (atau gunakan watcher).
- [ ] **Uji** – coba registrasi user dengan nama >255 karakter; harus mendapat error 400.
- Jika memilih opsi perubahan skema:
  - [ ] **Update skema DB** (`src/db/schema.ts`).
  - [ ] **Buat migrasi** (`bun db:push`).
  - [ ] **Terapkan migrasi** (`bun db:migrate`).
  - [ ] **Sesuaikan validasi** (jika diperlukan).
  - [ ] **Uji kembali** – registrasi harus berhasil.

---

## Tips Tambahan
- Simpan logika validasi di **layer route**; ini mencegah data tidak valid masuk ke service layer.
- Jika diperkirakan nama akan jauh lebih panjang di masa depan, pertimbangkan memakai tipe `TEXT` alih‑alih `VARCHAR` dengan ukuran tetap.
- Setelah ada perubahan skema, selalu jalankan seluruh test suite (`bun test` jika ada) untuk memastikan tidak ada yang rusak.

---

*Panduan ini dirancang agar mudah diikuti oleh programmer junior atau AI model yang lebih murah.*
