import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TopAppBar } from "../../../components/organisms/TopAppBar";

describe("TopAppBar", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("renders the Echo title text", () => {
    render(<TopAppBar />);
    expect(screen.getByText("Echo")).toBeInTheDocument();
  });

  it("starts in dark mode when localStorage has dark theme", async () => {
    localStorage.setItem("theme", "dark");
    render(<TopAppBar />);
    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
    const svg = screen.getByRole("button").querySelector("svg");
    expect(svg?.classList.toString()).toContain("lucide-sun");
  });

  it("toggles from light to dark on button click", async () => {
    render(<TopAppBar />);
    const button = screen.getByRole("button");

    button.click();
    await waitFor(() => {
      expect(localStorage.getItem("theme")).toBe("dark");
    });
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggles from dark to light on button click", async () => {
    localStorage.setItem("theme", "dark");
    render(<TopAppBar />);
    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    const button = screen.getByRole("button");
    button.click();
    await waitFor(() => {
      expect(localStorage.getItem("theme")).toBe("light");
    });
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("respects system prefers-color-scheme when localStorage is empty", async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<TopAppBar />);
    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
    const svg = screen.getByRole("button").querySelector("svg");
    expect(svg?.classList.toString()).toContain("lucide-sun");
  });
});
