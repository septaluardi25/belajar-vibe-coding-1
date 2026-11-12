import { app } from "../src/index";
import { db } from "../src/db";
import { session, users } from "../src/db/schema";
import type { ApiSuccessResponse } from "./types";

export async function clearDatabase() {
  if (!process.env.DB_NAME?.endsWith("_test")) {
    throw new Error(
      `Operasi ditolak: clearDatabase hanya boleh dijalankan pada database test (*_test). DB_NAME saat ini: ${process.env.DB_NAME}`
    );
  }

  try {
    await db.delete(session);
    await db.delete(users);
  } catch (err) {
    throw new Error(
      `clearDatabase gagal: pastikan DB berjalan dan env sudah benar.\nDetail: ${err}`
    );
  }
}

export function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function registerTestUser(input = {
  name: "Dimas",
  email: "dimas@example.com",
  password: "password123",
}) {
  return app.handle(
    new Request("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
  );
}

export async function loginTestUser(input = {
  email: "dimas@example.com",
  password: "password123",
}): Promise<string> {
  const res = await app.handle(
    new Request("http://localhost/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
  );
  const body = (await res.json()) as ApiSuccessResponse<string>;
  return body.data;
}

