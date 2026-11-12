import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { checkDatabaseConnection } from "./db";
import { usersRoute } from "./routes/users-route";
import { parsePort } from "./utils/port";

const port = parsePort(process.env.PORT, 3000);

export const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "Belajar Vibe Coding - Backend API",
          version: "1.0.0",
          description: "API dokumentasi autentikasi user dan session management",
        },
        tags: [
          { name: "General", description: "Endpoint informasi umum dan status server" },
          { name: "Users", description: "Endpoint manajemen akun dan autentikasi user" },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "UUID",
              description: "Masukkan token autentikasi (tanpa awalan 'Bearer')",
            },
          },
        },
      },
    })
  )
  .get(
    "/",
    () => ({
      success: true,
      message: "Server is running with Bun, Elysia, Drizzle ORM, and MySQL",
    }),
    {
      detail: {
        tags: ["General"],
        summary: "Root endpoint",
        description: "Menampilkan informasi server yang sedang berjalan",
      },
    }
  )
  .get(
    "/health",
    async ({ set }) => {
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
    },
    {
      detail: {
        tags: ["General"],
        summary: "Health check",
        description: "Memeriksa status server dan konektivitas database MySQL",
      },
    }
  )
  .use(usersRoute)
  .listen(port);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
