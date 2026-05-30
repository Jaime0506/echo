import { ReactNode } from "react";
import { Surface } from "../ui/Surface";

interface MixerLayoutProps {
  topBar: ReactNode;
  centerContent: ReactNode;
  rightPanel?: ReactNode;
  leftPanel?: ReactNode;
}

export const MixerLayout = ({ topBar, centerContent, rightPanel, leftPanel }: MixerLayoutProps) => {
  return (
    <Surface className="min-h-screen flex font-body-md text-body-md overflow-hidden relative">
      {topBar}


      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col justify-center items-center relative w-full min-h-screen px-4 md:px-6 pt-24 pb-24 overflow-y-auto">
        <div className="w-full max-w-6xl flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">

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
  );
};
