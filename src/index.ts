import { Elysia } from "elysia";
import { checkDatabaseConnection } from "./db";
import { usersRoute } from "./routes/users-route";
import { parsePort } from "./utils/port";

const port = parsePort(process.env.PORT, 3000);

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
  .use(usersRoute)
  .listen(port);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
