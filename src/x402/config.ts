import type { RoutesConfig } from "@x402/core/server";
import type { Network } from "@x402/core/types";

export const X402_IMAGE_ROUTE = "/api/v1/images/monalisa";

const DEFAULT_X402_NETWORK = "eip155:84532";
const DEFAULT_X402_IMAGE_PRICE = "$0.10";
const DEFAULT_X402_FACILITATOR_URL = "https://x402.org/facilitator";

export const getX402PayTo = () => process.env.X402_PAY_TO?.trim();

export const getX402Network = (): Network => DEFAULT_X402_NETWORK as Network;

export const getX402FacilitatorUrl = () => DEFAULT_X402_FACILITATOR_URL;

export const getX402ImagePrice = () => DEFAULT_X402_IMAGE_PRICE;

export const getX402Routes = (): RoutesConfig => ({
  [`GET ${X402_IMAGE_ROUTE}`]: {
    accepts: {
      scheme: "exact",
      network: getX402Network(),
      payTo: () => {
        const payTo = getX402PayTo();
        if (!payTo) throw new Error("X402_PAY_TO is not configured");
        return payTo;
      },
      price: getX402ImagePrice(),
      maxTimeoutSeconds: 60,
    },
    description: "Mona Lisa image download",
    mimeType: "application/json",
    serviceName: "Seller Agent",
    tags: ["mona lisa", "image", "digital asset"],
    unpaidResponseBody: () => ({
      contentType: "application/json",
      body: {
        error: "payment_required",
        resource: X402_IMAGE_ROUTE,
        description: "Mona Lisa image download",
      },
    }),
  },
});
