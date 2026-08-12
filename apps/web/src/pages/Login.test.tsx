import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation, Routes, Route } from "react-router-dom";
import Login from "./Login";
import { login } from "../redux/apiCalls";
import { renderWithProviders } from "../test/renderWithProviders";

type PreloadedState = NonNullable<Parameters<typeof renderWithProviders>[1]>["preloadedState"];

vi.mock("../redux/apiCalls", () => ({
  login: vi.fn(() => async () => {}),
}));

const LocationProbe = () => {
  const { pathname } = useLocation();
  return <div data-testid="path">{pathname}</div>;
};

beforeEach(() => {
  (login as unknown as Mock).mockClear();
});

describe("Login page", () => {
  it("submits the entered credentials", async () => {
    renderWithProviders(<Login />, { route: "/login" });

    await userEvent.type(screen.getByLabelText("Username"), "bryson");
    await userEvent.type(screen.getByLabelText("Password"), "test-password-1");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(login).toHaveBeenCalledWith({ username: "bryson", password: "test-password-1" });
  });

  it("shows an error message and disables the button while fetching", () => {
    renderWithProviders(<Login />, {
      route: "/login",
      preloadedState: {
        user: { currentUser: null, isFetching: true, error: true, isLoggedIn: false, passwordFlowSuccess: false },
      } as PreloadedState,
    });

    expect(screen.getByText(/check your details again/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeDisabled();
  });

  const routedLogin = (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<LocationProbe />} />
    </Routes>
  );

  it("redirects a logged-in user to the requested internal path", () => {
    renderWithProviders(routedLogin, {
      route: "/login?redirect=/cart",
      preloadedState: {
        user: { currentUser: { _id: "u1" }, isLoggedIn: true },
      } as unknown as PreloadedState,
    });

    expect(screen.getByTestId("path").textContent).toBe("/cart");
  });

  it("ignores an external redirect target (open-redirect guard)", () => {
    renderWithProviders(routedLogin, {
      route: "/login?redirect=//evil.com",
      preloadedState: {
        user: { currentUser: { _id: "u1" }, isLoggedIn: true },
      } as unknown as PreloadedState,
    });

    expect(screen.getByTestId("path").textContent).toBe("/");
  });
});
