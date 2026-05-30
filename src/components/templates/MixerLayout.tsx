import { ReactNode } from "react";
import { Surface } from "../ui/Surface";

import { useEffect, useState } from "react";
import { platform } from "@tauri-apps/plugin-os";
import { cn } from "../../utils";

interface MixerLayoutProps {
  topBar: ReactNode;
  centerContent: ReactNode;
  rightPanel?: ReactNode;
  leftPanel?: ReactNode;
}

export const MixerLayout = ({ topBar, centerContent, rightPanel, leftPanel }: MixerLayoutProps) => {
  const [isMac, setIsMac] = useState(true); // Default to true to prevent flash of square corners on mac

  useEffect(() => {
    setIsMac(platform() === "macos");
  }, []);

  return (
    <div className={cn("h-screen w-screen overflow-hidden", isMac ? "p-0" : "p-0.5 bg-transparent")}>
      <Surface className={cn(
        "h-full w-full flex flex-col font-body-md text-body-md overflow-hidden relative bg-neo-surface",
        !isMac && "rounded-2xl border border-on-surface-variant/20 shadow-xl"
      )}>
      {topBar}

      {/* Bottom Metadata */}
      <div className="hidden lg:flex fixed bottom-12 left-12 flex-col gap-1 pointer-events-none opacity-50"></div>

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col justify-center items-center relative w-full h-full px-4 md:px-6 py-4 md:py-12">
        <div className="w-full h-full max-w-6xl flex flex-col lg:grid lg:grid-cols-12 gap-2 md:gap-12 items-center justify-center">

          {/* Left Side (Presets/Nav) */}
          <div className="col-span-3 flex flex-col gap-6 items-center lg:items-end justify-center lg:pr-12 opacity-60 w-full">
            {leftPanel}
          </div>

          {/* Central Mixer Core */}
          <div className="col-span-6 flex flex-col items-center w-full">
            {centerContent}
          </div>

          {/* Right Side / Presets Area */}
          <div className="col-span-3 flex flex-col gap-6 items-center lg:items-start justify-center lg:pl-12 w-full max-w-md lg:max-w-none">
            {rightPanel}
          </div>

        </div>
        </main>
      </Surface>
    </div>
  );
};
