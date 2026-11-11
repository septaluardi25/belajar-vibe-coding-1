import { Elysia, t } from "elysia";
import { db, checkDatabaseConnection } from "./db";
import { users } from "./db/schema";

const port = Number(process.env.PORT) || 3000;

export const app = new Elysia()
  .get("/", () => ({
    success: true,
    message: "Server is running with Bun, Elysia, Drizzle ORM, and MySQL",
  }))
  .get("/health", async ({ set }) => {
    const dbStatus = await checkDatabaseConnection();
    if (!dbStatus.ok) {
      set.status = 503;
      return {
        status: "degraded",
        uptime: process.uptime(),
        database: dbStatus,
      };
    }
    return {
      status: "healthy",
      uptime: process.uptime(),
      database: dbStatus,
    };
  })
  .get("/api/users", async ({ set }) => {
    try {
      const allUsers = await db.select().from(users);
      return { success: true, data: allUsers };
    } catch (error: any) {
      set.status = 500;
      return { success: false, error: error?.message || "Failed to fetch users" };
    }
  })
  .post(
    "/api/users",
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String(),
      }),
    },
    async ({ body, set }) => {
      try {
        const [result] = await db.insert(users).values({
          name: body.name,
          email: body.email,
        });
        set.status = 201;
        return { success: true, message: "User created", insertId: result?.insertId };
      } catch (error: any) {
        set.status = 500;
        return { success: false, error: error?.message || "Failed to create user" };
      }
    }
  )
  .listen(port);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
