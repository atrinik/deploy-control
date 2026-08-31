import { describe, expect, it } from "vitest";
import worker from "../src/index";

describe("control-plane seed Worker", () => {
  it("exposes a credential-free health check", async () => {
    const response = await worker.fetch(
      new Request("https://control.example/healthz"),
      {},
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      service: "atrinik-deploy-control",
      status: "ok",
    });
  });

  it("does not expose unimplemented routes", async () => {
    const response = await worker.fetch(
      new Request("https://control.example/github/webhook", { method: "POST" }),
      {},
    );

    expect(response.status).toBe(404);
  });
});
