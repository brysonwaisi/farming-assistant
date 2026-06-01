import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Account from "./Account";
import { renderWithProviders } from "../test/renderWithProviders";

// Orders are fetched on mount; updateProfile is the edit thunk. Stub both.
vi.mock("../reqMethods", () => ({
  userRequest: { get: vi.fn().mockResolvedValue({ data: [] }), post: vi.fn().mockResolvedValue({}) },
}));
const updateProfileMock = vi.fn().mockResolvedValue({ ok: true });
vi.mock("../redux/apiCalls", () => ({ updateProfile: (...a) => updateProfileMock(...a) }));

const loggedIn = {
  user: {
    currentUser: {
      _id: "u1",
      username: "shopper",
      email: "shopper@farming.test",
      isVerified: true,
      createdAt: "2026-01-01T00:00:00Z",
    },
    isLoggedIn: true,
  },
};

beforeEach(() => updateProfileMock.mockClear());

describe("Account page", () => {
  it("shows the signed-in user's profile details", () => {
    renderWithProviders(<Account />, { preloadedState: loggedIn });
    expect(screen.getByText("shopper")).toBeInTheDocument();
    expect(screen.getByText("shopper@farming.test")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit profile/i })).toBeInTheDocument();
  });

  it("opens the edit form prefilled and submits changes via updateProfile", async () => {
    renderWithProviders(<Account />, { preloadedState: loggedIn });
    await userEvent.click(screen.getByRole("button", { name: /edit profile/i }));

    const email = screen.getByDisplayValue("shopper@farming.test");
    await userEvent.clear(email);
    await userEvent.type(email, "new@farming.test");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(updateProfileMock).toHaveBeenCalled());
    const changes = updateProfileMock.mock.calls[0][2];
    expect(changes.email).toBe("new@farming.test");
    expect(changes.username).toBe("shopper");
  });

  it("renders nothing when there is no logged-in user", () => {
    const { container } = renderWithProviders(<Account />, {
      preloadedState: { user: { currentUser: null, isLoggedIn: false } },
    });
    expect(container.querySelector("h1")).toBeNull();
  });
});
