import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { 
  Pen, 
  Square, 
  Circle, 
  Eraser, 
  Trash2, 
  Download, 
  Upload,
  Users,
  Palette,
  Type,
  StickyNote,
  Minus,
  Triangle,
  ArrowUp,
  Undo2,
  Redo2,
  Smile,
  ThumbsUp,
  Heart,
  Flame,
  Star,
  Hand,
  FileImage,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToolType = "pen" | "rectangle" | "circle" | "eraser" | "text" | "sticky-note" | "line" | "triangle" | "arrow";

interface ToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  color: string;
  onColorChange: (color: string) => void;
  lineWidth: number;
  onLineWidthChange: (width: number) => void;
  onClearBoard: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onTemplate?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  connectedUsers?: number;
}

const tools = [
  { id: "pen" as const, icon: Pen, label: "Pen" },
  { id: "line" as const, icon: Minus, label: "Line" },
  { id: "rectangle" as const, icon: Square, label: "Rectangle" },
  { id: "circle" as const, icon: Circle, label: "Circle" },
  { id: "triangle" as const, icon: Triangle, label: "Triangle" },
  { id: "arrow" as const, icon: ArrowUp, label: "Arrow" },
  { id: "text" as const, icon: Type, label: "Text" },
  { id: "sticky-note" as const, icon: StickyNote, label: "Sticky Note" },
  { id: "eraser" as const, icon: Eraser, label: "Eraser" },
];

const reactions = [
  { emoji: "👍", label: "Thumbs up" },
  { emoji: "❤️", label: "Heart" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "😊", label: "Happy" },
  { emoji: "🎉", label: "Party" },
  { emoji: "👋", label: "Wave" },
];

const colors = [
  "#000000", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500",
  "#800080", "#FFC0CB", "#A52A2A", "#808080"
];

export const Toolbar = ({
  activeTool,
  onToolChange,
  color,
  onColorChange,
  lineWidth,
  onLineWidthChange,
  onClearBoard,
  onSave,
  onLoad,
  onUndo,
  onRedo,
  onTemplate,
  canUndo = false,
  canRedo = false,
  connectedUsers = 1
}: ToolbarProps) => {
  return (
    <div className="bg-gradient-glass backdrop-blur-md border border-toolbar-border rounded-xl p-4 shadow-toolbar">
      <div className="flex flex-col gap-4">
        {/* Undo/Redo Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
            className="transition-spring hover:scale-105"
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onRedo}
            disabled={!canRedo}
            className="transition-spring hover:scale-105"
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Drawing Tools */}
        <div className="grid grid-cols-3 gap-2">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? "default" : "secondary"}
              size="icon"
              onClick={() => onToolChange(tool.id)}
              className={cn(
                "transition-spring hover:scale-105",
                activeTool === tool.id && "bg-gradient-primary shadow-glow"
              )}
              title={tool.label}
            >
              <tool.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <Separator />

        {/* Color Palette */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Color</span>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {colors.map((c) => (
              <button
                key={c}
                className={cn(
                  "w-6 h-6 rounded border-2 transition-spring hover:scale-110",
                  color === c ? "border-primary shadow-glow" : "border-border"
                )}
                style={{ backgroundColor: c }}
                onClick={() => onColorChange(c)}
                title={`Color: ${c}`}
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* Brush Size */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Brush Size</span>
            <span className="text-xs text-muted-foreground">{lineWidth}px</span>
          </div>
          <Slider
            value={[lineWidth]}
            onValueChange={(value) => onLineWidthChange(value[0])}
            max={50}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        <Separator />

        {/* Templates & Actions */}
        <div className="flex flex-col gap-2">
          {onTemplate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onTemplate}
              className="w-full justify-start transition-spring hover:scale-105"
            >
              <Layers className="h-4 w-4 mr-2" />
              Templates
            </Button>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={onClearBoard}
            className="w-full justify-start transition-spring hover:scale-105"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Board
          </Button>
          
          {onSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              className="w-full justify-start transition-spring hover:scale-105"
            >
              <Download className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
          
          {onLoad && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoad}
              className="w-full justify-start transition-spring hover:scale-105"
            >
              <Upload className="h-4 w-4 mr-2" />
              Load
            </Button>
          )}
        </div>

        <Separator />

        {/* Reactions */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Smile className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Reactions</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                className="w-8 h-8 rounded border-2 border-border hover:border-primary transition-spring hover:scale-110 flex items-center justify-center text-lg"
                title={reaction.label}
                onClick={() => {
                  // Add reaction to canvas (placeholder)
                  console.log('Reaction:', reaction.emoji);
                }}
              >
                {reaction.emoji}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Collaboration Status */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{connectedUsers} user{connectedUsers !== 1 ? 's' : ''} online</span>
        </div>
      </div>
    </div>
  );
};