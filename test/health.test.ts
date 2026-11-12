import { describe, expect, it } from "bun:test";
import { app } from "../src/index";

describe("GET /health", () => {
  it("harus mengembalikan status 200 dan status healthy ketika DB terhubung", async () => {
    const res = await app.handle(new Request("http://localhost/health"));
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.status).toBe("healthy");
    expect(typeof body.uptime).toBe("number");
    expect(body.database).toBeDefined();
    expect(body.database.ok).toBe(true);
    expect(body.database.message).toBe("Database connected successfully");
  });
});
