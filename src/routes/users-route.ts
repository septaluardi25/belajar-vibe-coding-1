import { Elysia, t } from "elysia";
import { registerUser } from "../services/users-services";

export const usersRoute = new Elysia({ prefix: "/api" }).post(
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
);
