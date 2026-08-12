import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import Logout from "./Logout";
import { pubRequest } from "../reqMethods";
import { renderWithProviders } from "../test/renderWithProviders";

type PreloadedState = NonNullable<Parameters<typeof renderWithProviders>[1]>["preloadedState"];

vi.mock("../reqMethods", () => ({
  pubRequest: { post: vi.fn() },
}));

const post = (pubRequest as unknown as { post: Mock }).post;

const LocationProbe = () => {
  const { pathname } = useLocation();
  return <div data-testid="path">{pathname}</div>;
};

const loggedIn = {
  user: { currentUser: { _id: "u1", username: "b" }, isLoggedIn: true },
} as unknown as PreloadedState;

beforeEach(() => {
  post.mockReset();
});

describe("Logout page", () => {
  it("ends the server session, clears local state and redirects to login", async () => {
    post.mockResolvedValue({});
    localStorage.setItem("persist:root", "{}");

    const { store } = renderWithProviders(
      <>
        <Logout />
        <LocationProbe />
      </>,
      { preloadedState: loggedIn },
    );

    await userEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(post).toHaveBeenCalledWith("/auth/logout");
    expect(store.getState().user.isLoggedIn).toBe(false);
    expect(store.getState().user.currentUser).toBeNull();
    expect(localStorage.getItem("persist:root")).toBeNull();
    expect(screen.getByTestId("path").textContent).toBe("/login");
  });

  it("still clears the local session when the server call fails", async () => {
    post.mockRejectedValue(new Error("offline"));

    const { store } = renderWithProviders(
      <>
        <Logout />
        <LocationProbe />
      </>,
      { preloadedState: loggedIn },
    );

    await userEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(store.getState().user.isLoggedIn).toBe(false);
    expect(screen.getByTestId("path").textContent).toBe("/login");
  });

  it("renders nothing actionable when logged out", () => {
    renderWithProviders(<Logout />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
