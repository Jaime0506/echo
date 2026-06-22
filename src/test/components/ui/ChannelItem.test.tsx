import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChannelItem } from "../../../components/ui/ChannelItem";

describe("ChannelItem", () => {
  const defaultProps = {
    id: "rain",
    label: "Rain Channel",
    iconName: "rain",
    value: 50,
    onValueChange: vi.fn(),
  };

  it("renders the channel label text", () => {
    render(<ChannelItem {...defaultProps} />);
    expect(screen.getByText("Rain Channel")).toBeInTheDocument();
  });

  it("renders CloudRain icon when iconName is rain", () => {
    const { container } = render(
      <ChannelItem {...defaultProps} iconName="rain" />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders Wind icon when iconName is wind", () => {
    const { container } = render(
      <ChannelItem {...defaultProps} iconName="wind" label="Wind Channel" />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies active variant styling when isActive is true", () => {
    const { container } = render(
      <ChannelItem {...defaultProps} isActive={true} />,
    );
    const firstChild = container.firstChild as HTMLElement;
    const buttonIcon = firstChild.firstChild as HTMLElement;
    expect(buttonIcon.className).toContain("neo-active-glow");
    expect(buttonIcon.className).toContain("text-neo-accent");
  });

  it("applies inactive styling when isActive is false", () => {
    const { container } = render(
      <ChannelItem {...defaultProps} isActive={false} />,
    );
    const firstChild = container.firstChild as HTMLElement;
    const buttonIcon = firstChild.firstChild as HTMLElement;
    expect(buttonIcon.className).not.toContain("neo-active-glow");
  });
});
