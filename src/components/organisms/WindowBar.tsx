import { useEffect, useState } from 'react';

import { getCurrentWindow } from '@tauri-apps/api/window';
import { Minus, Square, X } from 'lucide-react';

import { platform } from '@tauri-apps/plugin-os';

export const WindowBar = () => {
  const currentPlatform = platform();
  const appWindow = getCurrentWindow();

  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (currentPlatform === 'macos') {
      setIsMac(true)
    } else {
      setIsMac(false)
    }
  }, [currentPlatform]);

  const ButtonGroup = () => (
    <div className={`flex items-center gap-2 ${isMac ? 'ml-2' : 'mr-2'} pointer-events-auto group/window`}>
      {isMac ? (
        <>
          <button onClick={() => appWindow.close()} className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-black/10 flex items-center justify-center transition-all cursor-pointer">
            <X size={8} className="opacity-0 group-hover/window:opacity-60 text-black" strokeWidth={3} />
          </button>
          <button onClick={() => appWindow.minimize()} className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-black/10 flex items-center justify-center transition-all cursor-pointer">
            <Minus size={8} className="opacity-0 group-hover/window:opacity-60 text-black" strokeWidth={3} />
          </button>
          <button onClick={() => appWindow.toggleMaximize()} className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-black/10 flex items-center justify-center transition-all cursor-pointer">
            <Square size={6} className="opacity-0 group-hover/window:opacity-60 text-black" strokeWidth={3} />
          </button>
        </>
      ) : (
        <>
          <button onClick={() => appWindow.minimize()} className="w-6 h-6 rounded-full bg-neo-surface neo-shadow-sm border border-on-surface-variant/10 flex items-center justify-center text-on-surface-variant transition-all hover:bg-on-surface-variant/10 cursor-pointer">
            <Minus size={12} />
          </button>
          <button onClick={() => appWindow.toggleMaximize()} className="w-6 h-6 rounded-full bg-neo-surface neo-shadow-sm border border-on-surface-variant/10 flex items-center justify-center text-on-surface-variant transition-all hover:bg-on-surface-variant/10 cursor-pointer">
            <Square size={10} />
          </button>
          <button onClick={() => appWindow.close()} className="w-6 h-6 rounded-full bg-neo-surface border border-error/50 neo-shadow-sm flex items-center justify-center text-error transition-all hover:bg-error hover:text-white cursor-pointer">
            <X size={12} />
          </button>
        </>
      )}
    </div>
  );

  return (
    <div data-tauri-drag-region className="fixed top-0 left-0 right-0 h-12 flex items-center px-4 z-60 select-none">
      {isMac ? (
        <>
          <div data-tauri-drag-region className="flex-1 h-full" />
        </>
      ) : (
        <>
          <div data-tauri-drag-region className="flex-1 h-full" />
          <ButtonGroup />
        </>
      )}
    </div>
  );
};
