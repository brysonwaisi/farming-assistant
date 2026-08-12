import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Newsletter from "./Newsletter";
import { pubRequest } from "../reqMethods";
import { renderWithProviders } from "../test/renderWithProviders";

vi.mock("../reqMethods", () => ({ pubRequest: { post: vi.fn() } }));

const post = (pubRequest as unknown as { post: Mock }).post;

const subscribe = async (email: string) => {
  if (email) await userEvent.type(screen.getByPlaceholderText("Your email"), email);
  await userEvent.click(screen.getByRole("button"));
};

beforeEach(() => {
  post.mockReset();
});

describe("Newsletter", () => {
  it("subscribes a valid email and confirms", async () => {
    post.mockResolvedValue({ data: { message: "ok" } });
    renderWithProviders(<Newsletter />);

    await subscribe("b@x.com");

    expect(post).toHaveBeenCalledWith("/subscribe", { email: "b@x.com" });
    expect(await screen.findByText(/subscription successful/i)).toBeInTheDocument();
  });

  it("shows a failure message when the server rejects", async () => {
    post.mockRejectedValue(new Error("500"));
    renderWithProviders(<Newsletter />);

    await subscribe("b@x.com");

    expect(await screen.findByText(/subscription failed/i)).toBeInTheDocument();
  });

  it("rejects an invalid email without calling the server", async () => {
    renderWithProviders(<Newsletter />);

    await subscribe("not-an-email");

    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it("requires an email", async () => {
    renderWithProviders(<Newsletter />);

    await subscribe("");

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });
});
