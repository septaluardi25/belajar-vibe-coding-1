import { Elysia, t } from "elysia";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/users-services";

export const usersRoute = new Elysia({ prefix: "/api" })
  .post(
    "/users",
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String(),
        password: t.String({ minLength: 1 }),
      }),
    },
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
      } catch (err: any) {
        set.status = 500;
        return {
          error: err?.message || "Internal server error",
        };
      }
    }
  )
  .post(
    "/users/login",
    {
      body: t.Object({
        email: t.String(),
        password: t.String({ minLength: 1 }),
      }),
    },
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
      } catch (err: any) {
        set.status = 500;
        return {
          error: err?.message || "Internal server error",
        };
      }
    }
  )
  .get("/users/current", async ({ headers, set }) => {
    try {
      const authHeader = headers["authorization"];

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return {
          error: "Unauthorized users",
        };
      }

      const token = authHeader.slice(7).trim();

      if (!token) {
        set.status = 401;
        return {
          error: "Unauthorized users",
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
    } catch (err: any) {
      set.status = 500;
      return {
        error: err?.message || "Internal server error",
      };
    }
  })
  .delete("/users/logout", async ({ headers, set }) => {
    try {
      const authHeader = headers["authorization"];

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return {
          error: "Unauthorized",
        };
      }

      const token = authHeader.slice(7).trim();

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
    } catch (err: any) {
      set.status = 500;
      return {
        error: err?.message || "Internal server error",
      };
    }
  });
