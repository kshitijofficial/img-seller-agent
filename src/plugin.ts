import type { Plugin } from "@elizaos/core";
import { X402_IMAGE_ROUTE } from "./x402/config.ts";
import { handlePaidMonaLisaImageRoute } from "./x402/routes.ts";

const plugin: Plugin = {
  name: "seller-agent",
  description: "Seller agent routes for x402 image purchases.",
  init: async (_config, runtime) => {
    // ElizaOS prefixes plugin.routes with the plugin name. Register this
    // public payment endpoint directly so its URL matches the x402 config.
    runtime.routes.push({
      name: "paid-monalisa-image",
      path: X402_IMAGE_ROUTE,
      type: "GET",
      handler: handlePaidMonaLisaImageRoute,
    });
  },
};

export default plugin;
