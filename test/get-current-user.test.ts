import { beforeEach, describe, expect, it } from "bun:test";
import { app } from "../src/index";
import { clearDatabase } from "./helpers";

describe("GET /api/users/current", () => {
  const defaultUser = {
    name: "Dimas",
    email: "dimas@example.com",
    password: "password123",
  };

  let validToken: string;

  beforeEach(async () => {
    await clearDatabase();

    // Register user
    await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultUser),
      })
    );

    // Login user to get valid token
    const loginRes = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: defaultUser.email,
          password: defaultUser.password,
        }),
      })
    );
    const loginBody = (await loginRes.json()) as any;
    validToken = loginBody.data;
  });

  describe("Skenario Sukses", () => {
    it("harus berhasil mendapatkan data user saat ini dengan token valid", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        })
      );

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.data).toBeDefined();
      expect(typeof body.data.id).toBe("number");
      expect(body.data.name).toBe(defaultUser.name);
      expect(body.data.email).toBe(defaultUser.email);
      expect(body.data.created_at).toBeDefined();
    });
  });

  describe("Skenario Gagal", () => {
    it("harus ditolak jika tanpa header Authorization (401)", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
        })
      );

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("harus ditolak jika header Authorization tanpa prefix Bearer", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: validToken,
          },
        })
      );

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("harus ditolak jika header Authorization Bearer dengan token kosong", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: "Bearer ",
          },
        })
      );

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("harus ditolak jika token tidak valid / tidak ada di database", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: "Bearer random-token-yang-tidak-ada",
          },
        })
      );

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("harus ditolak jika token sudah di-logout (dihapus dari session)", async () => {
      // Logout terlebih dahulu
      const logoutRes = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        })
      );
      expect(logoutRes.status).toBe(200);

      // Coba akses current user dengan token yang sudah di-logout
      const res = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        })
      );

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });
  });
});
