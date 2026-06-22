import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Surface } from "../../../components/ui/Surface";

describe("Surface", () => {
  it("renders children content", () => {
    render(<Surface>Hello World</Surface>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("applies variant-specific visual classes", () => {
    const { container } = render(
      <Surface variant="card" elevation="raised">
        Card Content
      </Surface>,
    );
    expect(container.firstChild).toHaveClass("rounded-xl");
    expect(container.firstChild).toHaveClass("neo-shadow");
  });

  it("renders as a different element when as prop is provided", () => {
    const { container } = render(
      <Surface as="section">Section Content</Surface>,
    );
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });
});
