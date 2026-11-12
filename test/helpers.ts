import { db } from "../src/db";
import { session, users } from "../src/db/schema";

export async function clearDatabase() {
  try {
    await db.delete(session);
    await db.delete(users);
  } catch (err) {
    throw new Error(
      `clearDatabase gagal: pastikan DB berjalan dan env sudah benar.\nDetail: ${err}`
    );
  }
}

