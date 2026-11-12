import { beforeEach, describe, expect, it } from "bun:test";
import { app } from "../src/index";
import { clearDatabase } from "./helpers";

describe("POST /api/users", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe("Skenario Sukses", () => {
    it("harus berhasil registrasi dengan data valid", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Dimas",
            email: "dimas@example.com",
            password: "password123",
          }),
        })
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({ data: "OK" });
    });
  });

  describe("Skenario Validasi", () => {
    it("harus ditolak jika body kosong", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
      );

      expect(res.status).toBe(422);
    });

    it("harus ditolak jika name kosong (string kosong)", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "",
            email: "dimas@example.com",
            password: "password123",
          }),
        })
      );

      expect(res.status).toBe(422);
    });

    it("harus ditolak jika name melebihi 255 karakter", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "a".repeat(256),
            email: "dimas@example.com",
            password: "password123",
          }),
        })
      );

      expect(res.status).toBe(422);
    });

    it("harus ditolak jika email kosong", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Dimas",
            email: "",
            password: "password123",
          }),
        })
      );

      expect(res.status).toBe(422);
    });

    it("harus ditolak jika email format tidak valid", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Dimas",
            email: "bukan-email",
            password: "password123",
          }),
        })
      );

      expect(res.status).toBe(422);
    });

    it("harus ditolak jika password kosong", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Dimas",
            email: "dimas@example.com",
            password: "",
          }),
        })
      );

      expect(res.status).toBe(422);
    });

    it("harus ditolak jika password kurang dari 8 karakter", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Dimas",
            email: "dimas@example.com",
            password: "pendek",
          }),
        })
      );

      expect(res.status).toBe(422);
    });

    it("harus ditolak jika password lebih dari 72 karakter (batas bcrypt)", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Dimas",
            email: "dimas@example.com",
            password: "a".repeat(73),
          }),
        })
      );

      expect(res.status).toBe(422);
    });

    it("harus berhasil jika password tepat 8 karakter dan tepat 72 karakter", async () => {
      // Tepat 8 karakter
      const res8 = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "User Delapan",
            email: "delapan@example.com",
            password: "a".repeat(8),
          }),
        })
      );
      expect(res8.status).toBe(200);

      // Tepat 72 karakter
      const res72 = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "User Tujuh Puluh Dua",
            email: "tujuhdua@example.com",
            password: "a".repeat(72),
          }),
        })
      );
      expect(res72.status).toBe(200);
    });

    it("harus berhasil jika name tepat 255 karakter", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "a".repeat(255),
            email: "tepat255@example.com",
            password: "password123",
          }),
        })
      );

      expect(res.status).toBe(200);
    });
  });

  describe("Skenario Duplikasi", () => {
    it("harus gagal dengan error 400 jika email sudah terdaftar", async () => {
      // Registrasi pertama
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Dimas",
            email: "dimas@example.com",
            password: "password123",
          }),
        })
      );

      // Registrasi kedua dengan email yang sama
      const res = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Dimas Lain",
            email: "dimas@example.com",
            password: "password456",
          }),
        })
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({
        error: "email sudah terdaftar",
      });
    });
  });
});

