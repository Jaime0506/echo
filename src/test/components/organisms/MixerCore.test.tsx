import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MixerCore } from "../../../components/organisms/MixerCore";
import type { SoundChannel } from "../../../types/core";

const mockChannels: SoundChannel[] = [
  {
    id: "rain",
    label: "Lluvia",
    icon: "rain",
    value: 50,
    active: true,
    attribution: {
      author: "Test",
      platform: "Test",
      license: "Test",
      uri: "test",
      fileName: "test.wav",
    },
  },
  {
    id: "wind",
    label: "Viento",
    icon: "wind",
    value: 0,
    active: false,
    attribution: {
      author: "Test",
      platform: "Test",
      license: "Test",
      uri: "test",
      fileName: "test.wav",
    },
  },
];

describe("MixerCore", () => {
  const defaultProps = {
    channels: mockChannels,
    onChannelChange: vi.fn(),
    isPaused: false,
    onPressPlayControl: vi.fn(),
  };

  it("renders Play icon when isPaused is true", () => {
    const { container } = render(
      <MixerCore {...defaultProps} isPaused={true} />,
    );
    const playButton = container.firstChild?.firstChild as HTMLElement;
    const svg = playButton.querySelector("svg");
    expect(svg?.classList.toString()).toContain("lucide-play");
  });

  it("renders Pause icon when isPaused is false", () => {
    const { container } = render(
      <MixerCore {...defaultProps} isPaused={false} />,
    );
    const playButton = container.firstChild?.firstChild as HTMLElement;
    const svg = playButton.querySelector("svg");
    expect(svg?.classList.toString()).toContain("lucide-pause");
  });

  it("renders a ChannelItem for each channel in the array", () => {
    render(<MixerCore {...defaultProps} />);
    expect(screen.getByText("Lluvia")).toBeInTheDocument();
    expect(screen.getByText("Viento")).toBeInTheDocument();
  });

  it("renders topControl node when provided", () => {
    const topControl = <div>Volume Control</div>;
    render(<MixerCore {...defaultProps} topControl={topControl} />);
    expect(screen.getByText("Volume Control")).toBeInTheDocument();
  });
});
