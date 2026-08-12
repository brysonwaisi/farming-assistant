import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { pubRequest, userRequest } from "./reqMethods";

const ok = (config: InternalAxiosRequestConfig, data: unknown): AxiosResponse => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config,
});

const unauthorized = (config: InternalAxiosRequestConfig): AxiosError =>
  new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, null, {
    data: {},
    status: 401,
    statusText: "Unauthorized",
    headers: {},
    config,
  });

const serverError = (config: InternalAxiosRequestConfig): AxiosError =>
  new AxiosError("Boom", "ERR_BAD_RESPONSE", config, null, {
    data: {},
    status: 500,
    statusText: "Server Error",
    headers: {},
    config,
  });

const originalAdapter = userRequest.defaults.adapter;
let refreshSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  refreshSpy = vi
    .spyOn(pubRequest, "post")
    .mockResolvedValue({} as AxiosResponse) as ReturnType<typeof vi.spyOn>;
});

afterEach(() => {
  userRequest.defaults.adapter = originalAdapter;
  vi.restoreAllMocks();
});

describe("userRequest 401 refresh interceptor", () => {
  it("refreshes the session once and retries the original request", async () => {
    let attempts = 0;
    userRequest.defaults.adapter = async (config) => {
      attempts += 1;
      if (attempts === 1) throw unauthorized(config);
      return ok(config, { ok: true });
    };

    const res = await userRequest.get("/orders/find/u1");

    expect(res.data).toEqual({ ok: true });
    expect(attempts).toBe(2);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(refreshSpy).toHaveBeenCalledWith("/auth/refresh");
  });

  it("does not retry more than once when the retry also gets 401", async () => {
    let attempts = 0;
    userRequest.defaults.adapter = async (config) => {
      attempts += 1;
      throw unauthorized(config);
    };

    await expect(userRequest.get("/orders/find/u1")).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(attempts).toBe(2);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it("passes non-401 errors through without refreshing", async () => {
    userRequest.defaults.adapter = async (config) => {
      throw serverError(config);
    };

    await expect(userRequest.get("/orders/find/u1")).rejects.toMatchObject({
      response: { status: 500 },
    });
    expect(refreshSpy).not.toHaveBeenCalled();
  });

  it("propagates a failed refresh instead of retrying", async () => {
    let attempts = 0;
    userRequest.defaults.adapter = async (config) => {
      attempts += 1;
      throw unauthorized(config);
    };
    const refreshErr = new Error("refresh failed");
    refreshSpy.mockRejectedValue(refreshErr);

    await expect(userRequest.get("/orders/find/u1")).rejects.toBe(refreshErr);
    expect(attempts).toBe(1);
  });

  it("shares a single refresh across concurrent 401s", async () => {
    const attemptsByUrl: Record<string, number> = {};
    userRequest.defaults.adapter = async (config) => {
      const url = config.url || "";
      attemptsByUrl[url] = (attemptsByUrl[url] || 0) + 1;
      if (attemptsByUrl[url] === 1) throw unauthorized(config);
      return ok(config, { url });
    };

    const [a, b] = await Promise.all([
      userRequest.get("/carts/find/u1"),
      userRequest.get("/wishlist/find/u1"),
    ]);

    expect(a.data.url).toBe("/carts/find/u1");
    expect(b.data.url).toBe("/wishlist/find/u1");
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });
});
