import type { RouteRequest } from "@elizaos/core";
import type { HTTPAdapter } from "@x402/core/server";
import {
  getHeaderValue,
  getNormalizedQueryParams,
  getRequestBaseUrl,
  getRouteRequestPath,
} from "../http/request.ts";

class ElizaRouteAdapter implements HTTPAdapter {
  constructor(
    private readonly req: RouteRequest,
    private readonly fallbackPath: string,
  ) {}

  getHeader(name: string) {
    return getHeaderValue(this.req, name);
  }

  getMethod() {
    return this.req.method || "GET";
  }

  getPath() {
    return getRouteRequestPath(this.req, this.fallbackPath);
  }

  getUrl() {
    const rawUrl = this.req.url;
    if (rawUrl?.startsWith("http://") || rawUrl?.startsWith("https://"))
      return rawUrl;

    const path = rawUrl || this.getPath();
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${getRequestBaseUrl(this.req)}${normalizedPath}`;
  }

  getAcceptHeader() {
    return this.getHeader("accept") || "";
  }

  getUserAgent() {
    return this.getHeader("user-agent") || "";
  }

  getQueryParams() {
    return getNormalizedQueryParams(this.req);
  }

  getQueryParam(name: string) {
    return this.getQueryParams()[name];
  }

  getBody() {
    return this.req.body;
  }
}

export const buildRouteContext = (req: RouteRequest, path: string) => {
  const adapter = new ElizaRouteAdapter(req, path);

  return {
    adapter,
    path: adapter.getPath(),
    decodedPath: adapter.getPath(),
    method: adapter.getMethod(),
    paymentHeader:
      adapter.getHeader("payment-signature") ||
      adapter.getHeader("PAYMENT-SIGNATURE") ||
      adapter.getHeader("x-payment") ||
      adapter.getHeader("X-PAYMENT"),
  };
};
