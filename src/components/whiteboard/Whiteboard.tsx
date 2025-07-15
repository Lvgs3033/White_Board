import { useState, useRef } from "react";
import { Canvas } from "./Canvas";
import { Toolbar, ToolType } from "./Toolbar";
import { toast } from "sonner";

export const Whiteboard = () => {
  const [activeTool, setActiveTool] = useState<ToolType>("pen");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleClearBoard = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawing(false);
        setHistory([]);
        setHistoryIndex(-1);
        toast("Board cleared!");
      }
    }
  };

  const handleSave = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `whiteboard-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast("Drawing saved!");
    }
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.querySelector('canvas');
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              setHasDrawing(true);
              toast("Image loaded!");
            }
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx && history[historyIndex - 1]) {
          ctx.putImageData(history[historyIndex - 1], 0, 0);
          setHistoryIndex(historyIndex - 1);
          toast("Undone!");
        }
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx && history[historyIndex + 1]) {
          ctx.putImageData(history[historyIndex + 1], 0, 0);
          setHistoryIndex(historyIndex + 1);
          toast("Redone!");
        }
      }
    }
  };

  const handleTemplate = () => {
    toast("Templates coming soon!");
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(imageData);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Toolbar */}
      <div className="w-64 p-4 border-r border-border">
        <Toolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          color={color}
          onColorChange={setColor}
          lineWidth={lineWidth}
          onLineWidthChange={setLineWidth}
          onClearBoard={handleClearBoard}
          onSave={handleSave}
          onLoad={handleLoad}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onTemplate={handleTemplate}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          connectedUsers={1}
        />
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-4">
        <Canvas
          ref={canvasRef}
          color={color}
          lineWidth={lineWidth}
          tool={activeTool}
          onDrawingChange={setHasDrawing}
          onStrokeComplete={saveToHistory}
        />
      </div>
    </div>
  );
};