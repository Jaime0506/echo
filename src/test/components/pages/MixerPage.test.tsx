import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MixerPage } from "../../../components/pages/MixerPage";
import { defaultChannels } from "../../../utils/channels";

const { mockUseAudioMixer } = vi.hoisted(() => ({
  mockUseAudioMixer: vi.fn(),
}));

vi.mock("../../../hooks/useAudioMixer", () => ({
  useAudioMixer: mockUseAudioMixer,
}));

describe("MixerPage", () => {
  beforeEach(() => {
    mockUseAudioMixer.mockReset();
  });

  it("displays loading screen when isLoading is true", () => {
    mockUseAudioMixer.mockReturnValue({
      channels: [],
      masterVolume: 0,
      isLoading: true,
      isPaused: true,
      updateChannelValue: vi.fn(),
      updateMasterVolume: vi.fn(),
      onPressPlayControl: vi.fn(),
    });

    render(<MixerPage />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("renders full mixer interface when isLoading is false", () => {
    mockUseAudioMixer.mockReturnValue({
      channels: defaultChannels,
      masterVolume: 50,
      isLoading: false,
      isPaused: false,
      updateChannelValue: vi.fn(),
      updateMasterVolume: vi.fn(),
      onPressPlayControl: vi.fn(),
    });

    render(<MixerPage />);
    expect(screen.getByText("Echo")).toBeInTheDocument();
    expect(screen.getByText("Lluvia")).toBeInTheDocument();
    expect(screen.getByText("Viento")).toBeInTheDocument();
    expect(screen.getByText("VOL 50%")).toBeInTheDocument();
  });

  it("renders play button when isPaused is true", () => {
    mockUseAudioMixer.mockReturnValue({
      channels: defaultChannels,
      masterVolume: 50,
      isLoading: false,
      isPaused: true,
      updateChannelValue: vi.fn(),
      updateMasterVolume: vi.fn(),
      onPressPlayControl: vi.fn(),
    });

    const { container } = render(<MixerPage />);
    const playIcon = container.querySelector(".lucide-play");
    expect(playIcon).toBeInTheDocument();
  });
});
