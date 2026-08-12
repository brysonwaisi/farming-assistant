import { describe, it, expect, vi, type Mock } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import Register from "./Register";
import { signup } from "../redux/apiCalls";
import { renderWithProviders } from "../test/renderWithProviders";

vi.mock("../redux/apiCalls", () => ({
  signup: vi.fn(() => async () => {}),
}));

const LocationProbe = () => {
  const { pathname } = useLocation();
  return <div data-testid="path">{pathname}</div>;
};

describe("Register page", () => {
  it("submits the full form and moves on to login", async () => {
    renderWithProviders(
      <>
        <Register />
        <LocationProbe />
      </>,
      { route: "/register" },
    );

    await userEvent.type(screen.getByPlaceholderText("first name"), "Bry");
    await userEvent.type(screen.getByPlaceholderText("last name"), "Son");
    await userEvent.type(screen.getByPlaceholderText("username"), "bryson");
    await userEvent.type(screen.getByPlaceholderText("email"), "b@x.com");
    await userEvent.type(screen.getByPlaceholderText("password"), "Passw0rd!");
    await userEvent.type(screen.getByPlaceholderText("confirm password"), "Passw0rd!");
    await userEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(signup).toHaveBeenCalledWith({
      name: "Bry",
      lastName: "Son",
      username: "bryson",
      email: "b@x.com",
      password: "Passw0rd!",
      confirmPassword: "Passw0rd!",
    });
    expect((signup as unknown as Mock).mock.calls).toHaveLength(1);
    expect(screen.getByTestId("path").textContent).toBe("/login");
  });
});
