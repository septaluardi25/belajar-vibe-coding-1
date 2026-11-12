import { eq } from "drizzle-orm";
import type { ResultSetHeader } from "mysql2";
import { db } from "../db";
import { session, users } from "../db/schema";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export type RegisterResult =
  | { success: true; data: "OK" }
  | { success: false; error: string; code: number };

/**
 * Mendaftarkan user baru ke dalam database.
 *
 * Memeriksa apakah email sudah terdaftar, melakukan hashing password
 * menggunakan bcrypt, lalu menyimpan data user baru ke tabel `users`.
 * Mengembalikan error 400 jika email sudah digunakan, atau `"OK"` jika berhasil.
 */
export async function registerUser(input: RegisterUserInput): Promise<RegisterResult> {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      success: false,
      error: "email sudah terdaftar",
      code: 400,
    };
  }

  const hashedPassword = await Bun.password.hash(input.password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  await db.insert(users).values({
    name: input.name,
    email: input.email,
    password: hashedPassword,
  });

  return {
    success: true,
    data: "OK",
  };
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export type LoginResult =
  | { success: true; data: string }
  | { success: false; error: string; code: number };

/**
 * Melakukan autentikasi (login) user menggunakan email dan password.
 *
 * Memverifikasi kecocokan email dan password terhadap hash bcrypt yang tersimpan.
 * Jika valid, menghasilkan token sesi acak (UUID), menyimpannya ke tabel `session`,
 * dan mengembalikan token tersebut; atau error 400 jika kredensial salah.
 */
export async function loginUser(input: LoginUserInput): Promise<LoginResult> {
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (!existingUser) {
    return {
      success: false,
      error: "email atau password salah",
      code: 400,
    };
  }

  const isPasswordValid = await Bun.password.verify(input.password, existingUser.password);

  if (!isPasswordValid) {
    return {
      success: false,
      error: "email atau password salah",
      code: 400,
    };
  }

  const token = crypto.randomUUID();

  await db.insert(session).values({
    token,
    userId: existingUser.id,
  });

  return {
    success: true,
    data: token,
  };
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  created_at: string | Date;
}

export type GetCurrentUserResult =
  | { success: true; data: UserProfile }
  | { success: false; error: string; code: number };

/**
 * Mengambil profil user yang sedang login berdasarkan token sesi.
 *
 * Melakukan query join antara tabel `session` dan `users` menggunakan token.
 * Mengembalikan data profil user (`id`, `name`, `email`, `created_at`) jika token valid,
 * atau error 401 (`"Unauthorized"`) jika sesi tidak ditemukan.
 */
export async function getCurrentUser(token: string): Promise<GetCurrentUserResult> {
  const [result] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(session)
    .innerJoin(users, eq(session.userId, users.id))
    .where(eq(session.token, token))
    .limit(1);

  if (!result) {
    return {
      success: false,
      error: "Unauthorized",
      code: 401,
    };
  }

  return {
    success: true,
    data: {
      id: result.id,
      name: result.name,
      email: result.email,
      created_at: result.createdAt,
    },
  };
}

export type LogoutResult =
  | { success: true; data: "OK" }
  | { success: false; error: string; code: number };

/**
 * Melakukan logout user dengan menghapus sesi aktif berdasarkan token.
 *
 * Menghapus record sesi pada tabel `session` yang cocok dengan token yang diberikan
 * tanpa memengaruhi sesi lain milik user tersebut. Mengembalikan `"OK"` jika berhasil,
 * atau error 401 (`"Unauthorized"`) jika token tidak ditemukan.
 */
export async function logoutUser(token: string): Promise<LogoutResult> {
  const [result] = (await db
    .delete(session)
    .where(eq(session.token, token))) as unknown as [ResultSetHeader, unknown];

  if (!result || result.affectedRows === 0) {
    return {
      success: false,
      error: "Unauthorized",
      code: 401,
    };
  }

  return {
    success: true,
    data: "OK",
  };
}
