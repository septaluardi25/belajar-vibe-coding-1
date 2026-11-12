import { beforeEach, describe, expect, it } from "bun:test";
import { app } from "../src/index";
import { clearDatabase } from "./helpers";

describe("POST /api/users/login", () => {
  const defaultUser = {
    name: "Dimas",
    email: "dimas@example.com",
    password: "password123",
  };

  beforeEach(async () => {
    await clearDatabase();
    // Daftarkan user terlebih dahulu
    await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultUser),
      })
    );
  });

  describe("Skenario Sukses", () => {
    it("harus berhasil login dengan email dan password yang benar", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: defaultUser.email,
            password: defaultUser.password,
          }),
        })
      );

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data).toBeDefined();
      expect(typeof body.data).toBe("string");
      expect(body.data.length).toBeGreaterThan(0);
    });
  });

  describe("Skenario Gagal", () => {
    it("harus gagal jika email tidak terdaftar", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "tidak-ada@example.com",
            password: "password123",
          }),
        })
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({
        error: "email atau password salah",
      });
    });

    it("harus gagal jika password salah", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: defaultUser.email,
            password: "passwordsalah",
          }),
        })
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({
        error: "email atau password salah",
      });
    });

    it("harus ditolak jika body kosong", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
      );

      expect(res.status).toBe(422);
    });

    it("harus ditolak jika email tidak disediakan", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: "password123",
          }),
        })
      );

      expect(res.status).toBe(422);
    });

    it("harus ditolak jika password kosong", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: defaultUser.email,
            password: "",
          }),
        })
      );

      expect(res.status).toBe(422);
    });
  });

  describe("Skenario Multiple Session", () => {
    it("harus menghasilkan token berbeda ketika user login dua kali", async () => {
      const res1 = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: defaultUser.email,
            password: defaultUser.password,
          }),
        })
      );
      expect(res1.status).toBe(200);
      const body1 = (await res1.json()) as any;

      const res2 = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: defaultUser.email,
            password: defaultUser.password,
          }),
        })
      );
      expect(res2.status).toBe(200);
      const body2 = (await res2.json()) as any;

      expect(body1.data).not.toBe(body2.data);
    });
  });
});
