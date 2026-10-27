import { describe, expect, it } from "bun:test";
import { AgentRuntime } from "@elizaos/core";
import { projectAgent } from "../index.ts";
import { X402_IMAGE_ROUTE } from "../x402/config.ts";

describe("Seller route registration", () => {
  it("exposes the paid image handler through the project agent", async () => {
    const runtime = new AgentRuntime({
      character: { name: "seller-route-test" },
    });
    for (const plugin of projectAgent.plugins || []) {
      await runtime.registerPlugin(plugin);
    }
    const route = runtime.routes.find(
      (route) => route.type === "GET" && route.path === X402_IMAGE_ROUTE,
    );

    expect(route?.handler).toBeDefined();
    expect(
      runtime.routes.some((route) => route.path.includes("/seller-agent/")),
    ).toBe(false);

    const previousPayTo = process.env.X402_PAY_TO;
    delete process.env.X402_PAY_TO;
    let statusCode = 200;
    let body: unknown;
    const response = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(value: unknown) {
        body = value;
        return this;
      },
    };

    try {
      await route!.handler!({}, response, {} as never);
      expect(statusCode).toBe(500);
      expect(body).toMatchObject({ error: "x402_not_configured" });
    } finally {
      if (previousPayTo === undefined) delete process.env.X402_PAY_TO;
      else process.env.X402_PAY_TO = previousPayTo;
    }
  });
});
