import { Elysia, t } from "elysia";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/users-services";

export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }
  const trimmed = authHeader.trim();
  if (!/^Bearer\s+/i.test(trimmed)) {
    return null;
  }
  const token = trimmed.replace(/^Bearer\s+/i, "").trim();
  return token.length > 0 ? token : null;
}

export const usersRoute = new Elysia({ prefix: "/api" })
  .post(
    "/users",
    async ({ body, set }) => {
      try {
        const result = await registerUser(body);

        if (!result.success) {
          set.status = result.code;
          return {
            error: result.error,
          };
        }

        set.status = 200;
        return {
          data: result.data,
        };
      } catch (err: unknown) {
        console.error("Error in POST /api/users:", err);
        set.status = 500;
        return {
          error: "Internal server error",
        };
      }
    },
    {
      body: t.Object({
        name: t.String({
          minLength: 1,
          maxLength: 255,
          examples: ["Dimas Septaluardi"],
          description: "Nama lengkap user (1-255 karakter)",
        }),
        email: t.String({
          format: "email",
          examples: ["dimas@example.com"],
          description: "Alamat email unik user",
        }),
        password: t.String({
          minLength: 8,
          maxLength: 72,
          examples: ["rahasia123"],
          description: "Password user (8-72 karakter)",
        }),
      }),
      response: {
        200: t.Object(
          {
            data: t.String({ examples: ["OK"] }),
          },
          { description: "Registrasi berhasil" }
        ),
        400: t.Object(
          {
            error: t.String({ examples: ["email sudah terdaftar"] }),
          },
          { description: "Email sudah digunakan sebelumnya" }
        ),
        422: t.Object(
          {
            error: t.String({ examples: ["Validation Error"] }),
          },
          { description: "Validasi field request gagal (format email salah, password terlalu pendek/panjang)" }
        ),
        500: t.Object(
          {
            error: t.String({ examples: ["Internal server error"] }),
          },
          { description: "Terjadi kesalahan internal pada server" }
        ),
      },
      detail: {
        tags: ["Users"],
        summary: "Register user baru",
        description: "Mendaftarkan user baru dengan nama, email unik, dan password aman",
      },
    }
  )
  .post(
    "/users/login",
    async ({ body, set }) => {
      try {
        const result = await loginUser(body);

        if (!result.success) {
          set.status = result.code;
          return {
            error: result.error,
          };
        }

        set.status = 200;
        return {
          data: result.data,
        };
      } catch (err: unknown) {
        console.error("Error in POST /api/users/login:", err);
        set.status = 500;
        return {
          error: "Internal server error",
        };
      }
    },
    {
      body: t.Object({
        email: t.String({
          format: "email",
          examples: ["dimas@example.com"],
          description: "Alamat email user yang terdaftar",
        }),
        password: t.String({
          minLength: 1,
          examples: ["rahasia123"],
          description: "Password akun user",
        }),
      }),
      response: {
        200: t.Object(
          {
            data: t.String({
              examples: ["9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"],
              description: "Token sesi (UUID) untuk otorisasi endpoint berikutnya",
            }),
          },
          { description: "Login berhasil, mengembalikan token sesi" }
        ),
        400: t.Object(
          {
            error: t.String({ examples: ["email atau password salah"] }),
          },
          { description: "Kredensial login tidak cocok" }
        ),
        422: t.Object(
          {
            error: t.String({ examples: ["Validation Error"] }),
          },
          { description: "Format input body tidak valid" }
        ),
        500: t.Object(
          {
            error: t.String({ examples: ["Internal server error"] }),
          },
          { description: "Terjadi kesalahan internal pada server" }
        ),
      },
      detail: {
        tags: ["Users"],
        summary: "Login user",
        description: "Mengotentikasi user dan menghasilkan token sesi aktif",
      },
    }
  )
  .get(
    "/users/current",
    async ({ headers, set }) => {
      try {
        const token = extractBearerToken(headers["authorization"]);

        if (!token) {
          set.status = 401;
          return {
            error: "Unauthorized",
          };
        }

        const result = await getCurrentUser(token);

        if (!result.success) {
          set.status = result.code;
          return {
            error: result.error,
          };
        }

        set.status = 200;
        return {
          data: result.data,
        };
      } catch (err: unknown) {
        console.error("Error in GET /api/users/current:", err);
        set.status = 500;
        return {
          error: "Internal server error",
        };
      }
    },
    {
      response: {
        200: t.Object(
          {
            data: t.Object({
              id: t.Number({ examples: [1] }),
              name: t.String({ examples: ["Dimas Septaluardi"] }),
              email: t.String({ examples: ["dimas@example.com"] }),
              created_at: t.Union([t.String(), t.Date()], {
                examples: ["2026-11-12T06:00:00.000Z"],
              }),
            }),
          },
          { description: "Profil user berhasil diambil" }
        ),
        401: t.Object(
          {
            error: t.String({ examples: ["Unauthorized"] }),
          },
          { description: "Token tidak diberikan, tidak valid, atau telah logout" }
        ),
        500: t.Object(
          {
            error: t.String({ examples: ["Internal server error"] }),
          },
          { description: "Terjadi kesalahan internal pada server" }
        ),
      },
      detail: {
        tags: ["Users"],
        summary: "Get current user profile",
        description: "Mendapatkan profil data user yang sedang login menggunakan Bearer token",
        security: [{ bearerAuth: [] }],
      },
    }
  )
  .delete(
    "/users/logout",
    async ({ headers, set }) => {
      try {
        const token = extractBearerToken(headers["authorization"]);

        if (!token) {
          set.status = 401;
          return {
            error: "Unauthorized",
          };
        }

        const result = await logoutUser(token);

        if (!result.success) {
          set.status = result.code;
          return {
            error: result.error,
          };
        }

        set.status = 200;
        return {
          data: result.data,
        };
      } catch (err: unknown) {
        console.error("Error in DELETE /api/users/logout:", err);
        set.status = 500;
        return {
          error: "Internal server error",
        };
      }
    },
    {
      response: {
        200: t.Object(
          {
            data: t.String({ examples: ["OK"] }),
          },
          { description: "Logout berhasil dan sesi dihapus" }
        ),
        401: t.Object(
          {
            error: t.String({ examples: ["Unauthorized"] }),
          },
          { description: "Token tidak valid atau sudah logout sebelumnya" }
        ),
        500: t.Object(
          {
            error: t.String({ examples: ["Internal server error"] }),
          },
          { description: "Terjadi kesalahan internal pada server" }
        ),
      },
      detail: {
        tags: ["Users"],
        summary: "Logout user",
        description: "Menghapus token sesi aktif user yang sedang login",
        security: [{ bearerAuth: [] }],
      },
    }
  );
