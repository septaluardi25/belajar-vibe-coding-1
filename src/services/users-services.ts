import { eq } from "drizzle-orm";
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
