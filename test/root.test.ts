import { describe, expect, it } from "bun:test";
import { app } from "../src/index";

describe("GET /", () => {
  it("harus mengembalikan status 200 dan pesan server running", async () => {
    const res = await app.handle(new Request("http://localhost/"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual({
      success: true,
      message: "Server is running with Bun, Elysia, Drizzle ORM, and MySQL",
    });
  });
});

