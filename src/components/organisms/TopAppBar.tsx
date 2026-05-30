import { Bell, Settings } from "lucide-react";
import { Typography } from "../ui/Typography";
import { Button } from "../ui/Button";

export const TopAppBar = () => {
  return (
    <header className="hidden lg:flex fixed top-0 w-full z-50 justify-between items-center px-6 md:px-12 h-20 md:h-24 pointer-events-none">
      <Typography variant="display" className="tracking-tighter opacity-80 pointer-events-auto">
        Echo
      </Typography>
      <div className="flex items-center gap-4 pointer-events-auto">
        <Button variant="default" size="icon" className="text-opacity-80">
          <Bell size={20} strokeWidth={1.5} />
        </Button>
        <Button variant="default" size="icon" className="text-opacity-80">
          <Settings size={20} strokeWidth={1.5} />
        </Button>
      </div>
    </header>
  );
};
