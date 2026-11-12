import { beforeEach, describe, expect, it } from "bun:test";
import { app } from "../src/index";
import { clearDatabase } from "./helpers";
import type { ApiSuccessResponse, UserProfileResponse } from "./types";

describe("DELETE /api/users/logout", () => {
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
    const loginBody = (await loginRes.json()) as ApiSuccessResponse<string>;
    validToken = loginBody.data;
  });

  describe("Skenario Sukses", () => {
    it("harus berhasil logout dengan token valid dan token tidak bisa digunakan lagi", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        })
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({ data: "OK" });

      // Verifikasi token tidak bisa digunakan lagi di GET /users/current
      const currentRes = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        })
      );
      expect(currentRes.status).toBe(401);
    });

    it("harus berhasil logout dengan prefix bearer huruf kecil", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            Authorization: `bearer ${validToken}`,
          },
        })
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({ data: "OK" });
    });
  });

  describe("Skenario Gagal", () => {
    it("harus gagal jika tanpa header Authorization (401)", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
        })
      );

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("harus gagal jika header Authorization tanpa prefix Bearer", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            Authorization: validToken,
          },
        })
      );

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("harus gagal jika token tidak valid / tidak ada di database", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            Authorization: "Bearer token-palsu-123",
          },
        })
      );

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("harus gagal jika logout dua kali dengan token yang sama", async () => {
      // Logout pertama -> 200
      const res1 = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        })
      );
      expect(res1.status).toBe(200);

      // Logout kedua -> 401
      const res2 = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        })
      );
      expect(res2.status).toBe(401);
      const body2 = await res2.json();
      expect(body2).toEqual({ error: "Unauthorized" });
    });
  });

  describe("Skenario Multiple Session", () => {
    it("harus hanya menghapus session yang di-logout dan mempertahankan session lainnya", async () => {
      // Login lagi untuk dapat token kedua
      const loginRes2 = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: defaultUser.email,
            password: defaultUser.password,
          }),
        })
      );
      const loginBody2 = (await loginRes2.json()) as ApiSuccessResponse<string>;
      const token2 = loginBody2.data;

      // Logout token pertama
      const logoutRes = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        })
      );
      expect(logoutRes.status).toBe(200);

      // Token 1 harus invalid (401)
      const checkToken1 = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        })
      );
      expect(checkToken1.status).toBe(401);

      // Token 2 harus tetap valid (200)
      const checkToken2 = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token2}`,
          },
        })
      );
      expect(checkToken2.status).toBe(200);
      const body2 = (await checkToken2.json()) as ApiSuccessResponse<UserProfileResponse>;
      expect(body2.data.email).toBe(defaultUser.email);
    });
  });
});
