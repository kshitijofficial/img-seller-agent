import { logger, type RouteRequest, type RouteResponse } from "@elizaos/core";
import {
  getFacilitatorResponseError,
  type HTTPProcessResult,
  type HTTPTransportContext,
  withPrivateCacheControl,
  type x402HTTPResourceServer,
} from "@x402/core/server";
import { setResponseHeaders } from "../http/request.ts";
import { sellerProducts } from "../seller/catalog.ts";
import { buildRouteContext } from "./adapter.ts";
import { getX402PayTo, X402_IMAGE_ROUTE } from "./config.ts";
import { initializeX402HttpServer } from "./server.ts";

type X402PaymentErrorResponse = Extract<
  HTTPProcessResult,
  { type: "payment-error" }
>["response"];

const sendX402Response = (
  res: RouteResponse,
  response: X402PaymentErrorResponse,
) => {
  setResponseHeaders(res, response.headers);
  res.status(response.status);

  if (response.isHtml) {
    res.send(response.body || "");
    return;
  }

  res.json(response.body || {});
};

const sendX402ServerError = (res: RouteResponse, error: unknown) => {
  const facilitatorError = getFacilitatorResponseError(error);
  if (facilitatorError) {
    res.status(502).json({ error: facilitatorError.message });
    return;
  }

  logger.error({ error }, "x402 payment processing failed");
  res.status(500).json({
    error: "x402_payment_processing_failed",
    message: error instanceof Error ? error.message : String(error),
  });
};

const buildMonaLisaImageResponse = () => ({
  image_url: sellerProducts[0].delivery_url,
  license: sellerProducts[0].license,
  product_id: sellerProducts[0].product_id,
});

export const handlePaidMonaLisaImageRoute = async (
  req: RouteRequest,
  res: RouteResponse,
) => {
  if (!getX402PayTo()) {
    res.status(500).json({
      error: "x402_not_configured",
      message:
        "Set X402_PAY_TO to the seller receiving address before serving paid assets.",
    });
    return;
  }

  let httpServer: x402HTTPResourceServer;
  try {
    httpServer = await initializeX402HttpServer();
  } catch (error) {
    sendX402ServerError(res, error);
    return;
  }

  const requestContext = buildRouteContext(req, X402_IMAGE_ROUTE);
  let paymentResult: HTTPProcessResult;

  try {
    paymentResult = await httpServer.processHTTPRequest(requestContext);
  } catch (error) {
    sendX402ServerError(res, error);
    return;
  }

  if (paymentResult.type === "payment-error") {
    sendX402Response(res, paymentResult.response);
    return;
  }

  const body = buildMonaLisaImageResponse();

  if (paymentResult.type === "no-payment-required") {
    res.json(body);
    return;
  }

  const responseBody = Buffer.from(JSON.stringify(body));
  const responseHeaders = { "Content-Type": "application/json" };
  const transportContext: HTTPTransportContext = {
    request: requestContext,
    responseBody,
    responseHeaders,
  };

  try {
    const settleResult = await httpServer.processSettlement(
      paymentResult.paymentPayload,
      paymentResult.paymentRequirements,
      paymentResult.declaredExtensions,
      transportContext,
      undefined,
      paymentResult.beforeHandlerSettlement,
    );

    if (!settleResult.success) {
      sendX402Response(res, settleResult.response);
      return;
    }

    setResponseHeaders(res, settleResult.headers);
    res.setHeader?.("Cache-Control", withPrivateCacheControl(null));
    res.json(body);
  } catch (error) {
    sendX402ServerError(res, error);
  }
};
