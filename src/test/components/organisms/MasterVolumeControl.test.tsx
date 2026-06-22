import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MasterVolumeControl } from "../../../components/organisms/MasterVolumeControl";

describe("MasterVolumeControl", () => {
  it("renders the slider with the provided volume value", () => {
    render(
      <MasterVolumeControl volume={65} onVolumeChange={vi.fn()} />,
    );
    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("aria-valuenow", "65");
  });

  it("displays the volume percentage label as VOL {value}%", () => {
    render(
      <MasterVolumeControl volume={42} onVolumeChange={vi.fn()} />,
    );
    expect(screen.getByText("VOL 42%")).toBeInTheDocument();
  });

  it("calls onVolumeChange when the slider value changes", () => {
    const handleChange = vi.fn();
    render(
      <MasterVolumeControl volume={0} onVolumeChange={handleChange} />,
    );
    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
  });
});
