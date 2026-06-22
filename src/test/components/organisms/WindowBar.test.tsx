import { describe, it, expect, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { platform } from "@tauri-apps/plugin-os";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { Mock } from "vitest";
import { WindowBar } from "../../../components/organisms/WindowBar";

describe("WindowBar", () => {
  afterEach(() => {
    (platform as Mock).mockReturnValue("macos");
  });

  it("renders no window buttons on macOS (relies on native traffic lights)", async () => {
    (platform as Mock).mockReturnValue("macos");
    render(<WindowBar />);
    await waitFor(() => {
      expect(screen.queryAllByRole("button")).toHaveLength(0);
    });
  });

  it("renders three Windows-style buttons when platform is win32", async () => {
    (platform as Mock).mockReturnValue("win32");
    render(<WindowBar />);
    await waitFor(() => {
      expect(screen.getAllByRole("button")).toHaveLength(3);
    });
  });

  it("calls window.close when close button is clicked on Windows", async () => {
    (platform as Mock).mockReturnValue("win32");
    const mockWindow = getCurrentWindow();
    render(<WindowBar />);

    await waitFor(() => {
      expect(screen.getAllByRole("button")).toHaveLength(3);
    });

    const buttons = screen.getAllByRole("button");
    buttons[2].click();
    expect(mockWindow.close).toHaveBeenCalled();
  });
});
