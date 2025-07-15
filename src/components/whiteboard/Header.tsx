import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Settings, Palette } from "lucide-react";

interface HeaderProps {
  title?: string;
  onShare?: () => void;
  onSettings?: () => void;
  collaborators?: number;
}

export const Header = ({ 
  title = "Untitled Whiteboard", 
  onShare, 
  onSettings,
  collaborators = 1 
}: HeaderProps) => {
  return (
    <header className="bg-toolbar-bg border-b border-toolbar-border px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Palette className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">Whiteboard</span>
          </div>
          
          <div className="text-muted-foreground">/</div>
          
          <input
            type="text"
            value={title}
            className="bg-transparent border-none outline-none text-foreground font-medium hover:bg-muted px-2 py-1 rounded transition-colors"
            placeholder="Untitled Whiteboard"
          />
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {collaborators} online
          </Badge>
          
          {onShare && (
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
          
          {onSettings && (
            <Button variant="ghost" size="icon" onClick={onSettings}>
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};