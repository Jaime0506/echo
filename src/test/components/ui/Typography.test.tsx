import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Typography } from "../../../components/ui/Typography";

describe("Typography", () => {
  it("renders children text content", () => {
    render(<Typography>Hello World</Typography>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders correct semantic element for display variant (h1)", () => {
    const { container } = render(
      <Typography variant="display">Display Text</Typography>,
    );
    expect(container.querySelector("h1")).toBeInTheDocument();
  });

  it("renders correct semantic element for body variant (p)", () => {
    const { container } = render(
      <Typography variant="body">Body Text</Typography>,
    );
    expect(container.querySelector("p")).toBeInTheDocument();
  });

  it("applies color-specific text class", () => {
    const { container } = render(
      <Typography color="accent">Accent Text</Typography>,
    );
    expect(container.firstChild).toHaveClass("text-neo-accent");
  });

  it("renders as custom element when as prop is provided", () => {
    const { container } = render(
      <Typography as="h3">Custom Element</Typography>,
    );
    expect(container.querySelector("h3")).toBeInTheDocument();
  });
});
