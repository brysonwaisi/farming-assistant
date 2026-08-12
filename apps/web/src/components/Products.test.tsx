import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Products from "./Products";
import type { ProductItem } from "./Product";
import { pubRequest } from "../reqMethods";
import { renderWithProviders } from "../test/renderWithProviders";

vi.mock("../reqMethods", () => ({ pubRequest: { get: vi.fn() } }));

const get = (pubRequest as unknown as { get: Mock }).get;

const item = (over: Partial<ProductItem>): ProductItem =>
  ({ _id: "x", title: "X", img: "/x.jpg", price: 0, categories: [], ...over }) as ProductItem;

const catalog: ProductItem[] = [
  item({ _id: "1", title: "Apple", price: 30, categories: ["fruits"], createdAt: "2024-03-01" }),
  item({ _id: "2", title: "Beet", price: 10, categories: ["veggies"], createdAt: "2024-01-01" }),
  item({ _id: "3", title: "Corn", price: 20, categories: ["Veggies"], createdAt: "2024-02-01" }),
];

const renderedTitles = () =>
  screen.getAllByRole("img").map((img) => img.getAttribute("alt"));

beforeEach(() => {
  get.mockReset();
});

describe("Products (controlled)", () => {
  it("filters case-insensitively on array fields", () => {
    renderWithProviders(
      <Products products={catalog} filter={{ categories: "veggies" }} />,
    );
    expect(renderedTitles().sort()).toEqual(["Beet", "Corn"]);
  });

  it("sorts by price ascending and descending", () => {
    const { unmount } = renderWithProviders(
      <Products products={catalog} sort="asc" />,
    );
    expect(renderedTitles()).toEqual(["Beet", "Corn", "Apple"]);
    unmount();

    renderWithProviders(<Products products={catalog} sort="desc" />);
    expect(renderedTitles()).toEqual(["Apple", "Corn", "Beet"]);
  });

  it("sorts newest first by default", () => {
    renderWithProviders(<Products products={catalog} />);
    expect(renderedTitles()).toEqual(["Apple", "Corn", "Beet"]);
  });

  it("paginates by 8 with a load-more button", async () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      item({ _id: `p${i}`, title: `P${i}`, price: i }),
    );
    renderWithProviders(<Products products={many} />);

    expect(screen.getAllByRole("img")).toHaveLength(8);
    await userEvent.click(screen.getByRole("button", { name: /load more \(2 more\)/i }));
    expect(screen.getAllByRole("img")).toHaveLength(10);
  });

  it("shows a message when nothing matches the filter", () => {
    renderWithProviders(
      <Products products={catalog} filter={{ categories: "dairy" }} />,
    );
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });
});

describe("Products (self-fetching)", () => {
  it("fetches the catalog and renders it", async () => {
    get.mockResolvedValue({ data: catalog });
    renderWithProviders(<Products />);

    await waitFor(() => expect(screen.getAllByRole("img")).toHaveLength(3));
    expect(get).toHaveBeenCalledWith("products");
  });

  it("shows the empty message when the fetch fails", async () => {
    get.mockRejectedValue(new Error("down"));
    renderWithProviders(<Products />);

    expect(await screen.findByText(/no products found/i)).toBeInTheDocument();
  });
});
