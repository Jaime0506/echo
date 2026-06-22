import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Slider } from "../../../components/ui/Slider";

describe("Slider", () => {
  it("renders horizontal orientation with correct aria attributes", () => {
    render(
      <Slider orientation="horizontal" value={[50]} max={100} min={0} />,
    );
    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("aria-orientation", "horizontal");
    expect(slider).toHaveAttribute("aria-valuenow", "50");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders vertical orientation with correct aria attributes", () => {
    render(
      <Slider orientation="vertical" value={[30]} max={100} min={0} />,
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-orientation", "vertical");
    expect(slider).toHaveAttribute("aria-valuenow", "30");
  });

  it("marks slider as disabled when disabled prop is set", () => {
    render(
      <Slider
        orientation="horizontal"
        value={[50]}
        max={100}
        min={0}
        disabled
      />,
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("data-disabled");
    expect(slider).toHaveClass("cursor-pointer");
  });
});
