import { describe, expect, it } from "bun:test";
import { app } from "../src/index";

describe("Swagger / OpenAPI", () => {
  it("harus dapat mengakses halaman Swagger UI (GET /swagger) dengan status 200", async () => {
    const res = await app.handle(new Request("http://localhost/swagger"));
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html.toLowerCase()).toContain("<!doctype html>");
  });

  it("harus dapat mengakses spesifikasi OpenAPI (GET /swagger/json) dengan format JSON", async () => {
    const res = await app.handle(new Request("http://localhost/swagger/json"));
    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.openapi).toBeDefined();
    expect(json.info).toBeDefined();
    expect(json.info.title).toBe("Belajar Vibe Coding - Backend API");
    expect(json.paths).toBeDefined();

    // Verifikasi endpoint users terdaftar di paths
    expect(json.paths["/api/users"]).toBeDefined();
    expect(json.paths["/api/users/login"]).toBeDefined();
    expect(json.paths["/api/users/current"]).toBeDefined();
    expect(json.paths["/api/users/logout"]).toBeDefined();

    // Verifikasi security schemes Bearer Auth terdefinisi
    expect(json.components?.securitySchemes?.bearerAuth).toBeDefined();
    expect(json.components.securitySchemes.bearerAuth.type).toBe("http");
    expect(json.components.securitySchemes.bearerAuth.scheme).toBe("bearer");
  });
});
