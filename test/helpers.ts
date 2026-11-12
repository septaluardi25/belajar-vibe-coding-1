import { db } from "../src/db";
import { session, users } from "../src/db/schema";

export async function clearDatabase() {
  await db.delete(session);
  await db.delete(users);
}

