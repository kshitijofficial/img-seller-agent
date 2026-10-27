import type { RouteRequest, RouteResponse } from "@elizaos/core";

export const getHeaderValue = (req: RouteRequest, name: string) => {
  const value = req.headers?.[name.toLowerCase()] || req.headers?.[name];
  return Array.isArray(value) ? value[0] : value;
};

const getConfiguredBaseUrl = () => process.env.SELLER_PUBLIC_URL?.trim();

export const getRequestBaseUrl = (req: RouteRequest) => {
  const configuredUrl = getConfiguredBaseUrl();
  if (configuredUrl) return configuredUrl.replace(/\/+$/, "");
  throw new Error("SELLER_PUBLIC_URL is required");
};

export const getRouteRequestPath = (
  req: RouteRequest,
  fallbackPath: string,
) => {
  if (req.path) return req.path;
  if (!req.url) return fallbackPath;

  try {
    return new URL(req.url, "http://localhost").pathname;
  } catch {
    return fallbackPath;
  }
};

export const getNormalizedQueryParams = (req: RouteRequest) => {
  const normalized: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(req.query || {})) {
    if (typeof value === "string") normalized[key] = value;
    else if (Array.isArray(value)) {
      const values = value.filter(
        (item): item is string => typeof item === "string",
      );
      if (values.length > 0) normalized[key] = values;
    } else if (value != null) {
      normalized[key] = String(value);
    }
  }
  return normalized;
};

export const setResponseHeaders = (
  res: RouteResponse,
  headers: Record<string, string>,
) => {
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader?.(key, value);
  }
};
