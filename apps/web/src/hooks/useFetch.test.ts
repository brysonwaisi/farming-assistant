import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useFetch } from "./useFetch";
import { pubRequest } from "../reqMethods";

vi.mock("../reqMethods", () => ({ pubRequest: { get: vi.fn() } }));

const get = (pubRequest as unknown as { get: Mock }).get;

beforeEach(() => {
  get.mockReset();
});

describe("useFetch", () => {
  it("loads data and clears the loading flag", async () => {
    get.mockResolvedValue({ data: [{ _id: "1" }] });
    const { result } = renderHook(() => useFetch("products"));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([{ _id: "1" }]);
    expect(result.current.error).toBe(false);
  });

  it("sets the error flag and empties data on failure", async () => {
    get.mockRejectedValue(new Error("down"));
    const { result } = renderHook(() => useFetch("products"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it("skips fetching entirely for an empty path", async () => {
    const { result } = renderHook(() => useFetch(""));
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual([]);
    expect(get).not.toHaveBeenCalled();
  });

  it("refetches when the path changes", async () => {
    get.mockImplementation((path: string) => Promise.resolve({ data: { path } }));
    const { result, rerender } = renderHook(({ p }) => useFetch<{ path: string }>(p), {
      initialProps: { p: "products/find/1" },
    });

    await waitFor(() => expect(result.current.data).toEqual({ path: "products/find/1" }));
    rerender({ p: "products/find/2" });
    await waitFor(() => expect(result.current.data).toEqual({ path: "products/find/2" }));
    expect(get).toHaveBeenCalledTimes(2);
  });
});
