import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../../../components/ui/Button";

describe("Button", () => {
  it("renders children content", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("renders all variants without error", () => {
    const variants = [
      "default",
      "active",
      "ghost",
      "inset",
      "masterPlayInner",
    ] as const;
    for (const variant of variants) {
      const { container } = render(
        <Button variant={variant}>Variant {variant}</Button>,
      );
      expect(container.firstChild).toBeInTheDocument();
    }
  });

  it("renders all sizes without error", () => {
    const sizes = [
      "default",
      "sm",
      "lg",
      "icon",
      "iconSm",
      "iconLg",
      "masterPlayContainer",
      "masterPlayInner",
    ] as const;
    for (const size of sizes) {
      const { container } = render(<Button size={size}>Size {size}</Button>);
      expect(container.firstChild).toBeInTheDocument();
    }
  });

  it("shows loading spinner and hides children when loading is true", () => {
    const { container } = render(<Button loading>Loading</Button>);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
    const childSpan = screen.getByText("Loading");
    expect(childSpan).toHaveClass("opacity-0");
  });

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>Disabled</Button>);
    expect(
      screen.getByRole("button", { name: /disabled/i }),
    ).toBeDisabled();
  });
});
