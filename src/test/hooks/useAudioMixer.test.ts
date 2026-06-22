import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useAudioMixer } from "../../hooks/useAudioMixer";
import { defaultChannels } from "../../utils/channels";

const { mockInvoke, mockStore, clearStore, setStoreData } = vi.hoisted(() => {
  const storeData = new Map<string, any>();
  storeData.set("isPaused", false);
  storeData.set("masterVolume", 50);
  storeData.set("channels", []);

  return {
    mockInvoke: vi.fn().mockResolvedValue(undefined),
    mockStore: {
      get: vi.fn(
        async <T>(key: string): Promise<T | undefined> =>
          storeData.get(key) as T | undefined,
      ),
      set: vi.fn(async (key: string, value: any) => {
        storeData.set(key, value);
      }),
      save: vi.fn(),
    },
    clearStore: () => storeData.clear(),
    setStoreData: (key: string, value: any) => storeData.set(key, value),
  };
});

vi.mock("@tauri-apps/api/core", () => ({
  invoke: mockInvoke,
}));

vi.mock("../../store/store", () => ({
  store: mockStore,
}));

describe("useAudioMixer", () => {
  beforeEach(() => {
    clearStore();
    setStoreData("isPaused", false);
    setStoreData("masterVolume", 50);
    setStoreData("channels", []);
    mockInvoke.mockClear();
    mockStore.get.mockClear();
    mockStore.set.mockClear();
    mockStore.save.mockClear();
  });

  it("initializes with isLoading set to true", () => {
    const { result } = renderHook(() => useAudioMixer());
    expect(result.current.isLoading).toBe(true);
  });

  it("loads persisted settings from store on mount", async () => {
    setStoreData("masterVolume", 75);
    setStoreData("channels", [
      { id: "rain", value: 50, active: true, label: "Rain", icon: "rain" },
      { id: "wind", value: 30, active: true, label: "Wind", icon: "wind" },
    ]);
    setStoreData("isPaused", false);

    const { result } = renderHook(() => useAudioMixer());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockStore.get).toHaveBeenCalledWith("masterVolume");
    expect(mockStore.get).toHaveBeenCalledWith("channels");
    expect(mockStore.get).toHaveBeenCalledWith("isPaused");
  });

  it("falls back to default channels when no settings are saved", async () => {
    const { result } = renderHook(() => useAudioMixer());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.channels).toHaveLength(defaultChannels.length);
    expect(result.current.channels[0].id).toBe("rain");
    expect(result.current.channels[1].id).toBe("wind");
    expect(result.current.masterVolume).toBe(50);
  });

  it("keeps app paused when loaded with all channels at zero", async () => {
    setStoreData("channels", [
      { id: "rain", value: 0, active: false },
      { id: "wind", value: 0, active: false },
    ]);
    setStoreData("isPaused", false);

    const { result } = renderHook(() => useAudioMixer());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isPaused).toBe(true);
    expect(mockInvoke).toHaveBeenCalledWith("set_global_pause", {
      paused: true,
    });
  });

  it("restores active channels from saved settings and invokes backend", async () => {
    setStoreData("channels", [{ id: "rain", value: 75, active: true }]);
    setStoreData("masterVolume", 50);

    const { result } = renderHook(() => useAudioMixer());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const rainChannel = result.current.channels.find((c) => c.id === "rain");
    expect(rainChannel?.value).toBe(75);
    expect(rainChannel?.active).toBe(true);

    expect(mockInvoke).toHaveBeenCalledWith("set_channel_volume", {
      id: "rain",
      volume: 0.75,
    });
  });

  it("updateChannelValue updates the channel and persists to store", async () => {
    const { result } = renderHook(() => useAudioMixer());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.updateChannelValue("rain", 80);
    });

    const rainChannel = result.current.channels.find((c) => c.id === "rain");
    expect(rainChannel?.value).toBe(80);
    expect(rainChannel?.active).toBe(true);

    expect(mockInvoke).toHaveBeenCalledWith("set_channel_volume", {
      id: "rain",
      volume: 0.8,
    });
    expect(mockStore.set).toHaveBeenCalledWith("channels", expect.any(Array));
  });

  it("auto-unpauses when a channel value increases above zero while paused", async () => {
    const { result } = renderHook(() => useAudioMixer());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onPressPlayControl();
    });
    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.updateChannelValue("rain", 50);
    });

    expect(result.current.isPaused).toBe(false);
    expect(mockInvoke).toHaveBeenCalledWith("set_global_pause", {
      paused: false,
    });
  });

  it("auto-pauses when all channels are set to zero", async () => {
    const { result } = renderHook(() => useAudioMixer());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.updateChannelValue("rain", 60);
    });
    act(() => {
      result.current.updateChannelValue("wind", 40);
    });

    act(() => {
      result.current.updateChannelValue("rain", 0);
    });
    act(() => {
      result.current.updateChannelValue("wind", 0);
    });

    expect(result.current.isPaused).toBe(true);
    expect(mockInvoke).toHaveBeenCalledWith("set_global_pause", {
      paused: true,
    });
  });

  it("updateMasterVolume updates and persists master volume", async () => {
    const { result } = renderHook(() => useAudioMixer());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.updateMasterVolume(75);
    });

    expect(result.current.masterVolume).toBe(75);
    expect(mockInvoke).toHaveBeenCalledWith("set_master_volume", {
      volume: 0.75,
    });
    expect(mockStore.set).toHaveBeenCalledWith("masterVolume", 75);
  });

  it("onPressPlayControl toggles pause state", async () => {
    const { result } = renderHook(() => useAudioMixer());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onPressPlayControl();
    });
    expect(result.current.isPaused).toBe(true);
    expect(mockInvoke).toHaveBeenCalledWith("set_global_pause", {
      paused: true,
    });

    act(() => {
      result.current.onPressPlayControl();
    });
    expect(result.current.isPaused).toBe(false);
    expect(mockInvoke).toHaveBeenCalledWith("set_global_pause", {
      paused: false,
    });
  });

  it("merges saved channels with defaultChannels, keeping new defaults", async () => {
    setStoreData("channels", [{ id: "rain", value: 50, active: true }]);

    const { result } = renderHook(() => useAudioMixer());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.channels).toHaveLength(2);
    expect(result.current.channels[0].id).toBe("rain");
    expect(result.current.channels[0].value).toBe(50);
    expect(result.current.channels[1].id).toBe("wind");
    expect(result.current.channels[1].value).toBe(0);
  });

  it("catches invoke errors without crashing", async () => {
    mockInvoke.mockRejectedValueOnce(new Error("backend failure"));

    const { result } = renderHook(() => useAudioMixer());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(() => {
      act(() => {
        result.current.updateChannelValue("rain", 50);
      });
    }).not.toThrow();
  });
});
