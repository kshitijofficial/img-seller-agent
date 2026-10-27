import {
  HTTPFacilitatorClient,
  x402HTTPResourceServer,
  x402ResourceServer,
} from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import {
  getX402FacilitatorUrl,
  getX402Network,
  getX402Routes,
} from "./config.ts";

let serverPromise: Promise<x402HTTPResourceServer> | undefined;

export const initializeX402HttpServer = async () => {
  serverPromise ||= (async () => {
    const facilitator = new HTTPFacilitatorClient({
      url: getX402FacilitatorUrl(),
    });

    const resourceServer = new x402ResourceServer(facilitator).register(
      getX402Network(),
      new ExactEvmScheme(),
    );

    const httpServer = new x402HTTPResourceServer(
      resourceServer,
      getX402Routes(),
    );
    await httpServer.initialize();
    return httpServer;
  })().catch((error) => {
    serverPromise = undefined;
    throw error;
  });
  return serverPromise;
};
