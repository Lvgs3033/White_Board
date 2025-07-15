import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

export interface DrawingData {
  x: number;
  y: number;
  prevX?: number;
  prevY?: number;
  color: string;
  lineWidth: number;
  tool: string;
  isDrawing?: boolean;
}

interface CanvasProps {
  color: string;
  lineWidth: number;
  tool: string;
  onDrawingChange?: (hasDrawing: boolean) => void;
  onStrokeComplete?: () => void;
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({ color, lineWidth, tool, onDrawingChange, onStrokeComplete }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    const context = canvas.getContext("2d");
    if (!context) return;

    // Scale context for high DPI displays
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    // Set context properties
    context.lineCap = "round";
    context.lineJoin = "round";
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    contextRef.current = context;

    // Initialize WebSocket connection (mock for now - would connect to real server)
    try {
      const socket = io("ws://localhost:3001", {
        transports: ["websocket"],
        autoConnect: false
      });
      
      socket.on("connect", () => {
        console.log("Connected to drawing server");
        toast("Connected to collaboration server!");
      });

      socket.on("drawing", (data: DrawingData) => {
        drawFromSocket(data);
      });

      socket.on("clear", () => {
        clearCanvas();
      });

      socket.on("connect_error", () => {
        console.log("Could not connect to server - working in offline mode");
        toast("Working in offline mode");
      });

      socketRef.current = socket;
      // Don't auto-connect for demo - would connect in real app
      // socket.connect();
    } catch (error) {
      console.log("Socket.io not available - working in offline mode");
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "eraser") {
      context.globalCompositeOperation = "destination-out";
    } else {
      context.globalCompositeOperation = "source-over";
    }

    context.strokeStyle = color;
    context.lineWidth = lineWidth;

    // Handle different tools
    if (tool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        context.font = `${lineWidth * 8}px Arial`;
        context.fillStyle = color;
        context.fillText(text, x, y);
        setHasDrawing(true);
        onDrawingChange?.(true);
        onStrokeComplete?.();
      }
      return;
    } else if (tool === "sticky-note") {
      const text = prompt("Enter note text:");
      if (text) {
        const noteWidth = 150;
        const noteHeight = 100;
        
        // Draw sticky note background
        context.fillStyle = "#fef08a";
        context.fillRect(x, y, noteWidth, noteHeight);
        context.strokeStyle = "#eab308";
        context.lineWidth = 2;
        context.strokeRect(x, y, noteWidth, noteHeight);
        
        // Draw text
        context.fillStyle = "#374151";
        context.font = "14px Arial";
        const words = text.split(' ');
        let line = '';
        let lineY = y + 20;
        
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const metrics = context.measureText(testLine);
          const testWidth = metrics.width;
          
          if (testWidth > noteWidth - 20 && i > 0) {
            context.fillText(line, x + 10, lineY);
            line = words[i] + ' ';
            lineY += 20;
          } else {
            line = testLine;
          }
        }
        context.fillText(line, x + 10, lineY);
        
        setHasDrawing(true);
        onDrawingChange?.(true);
        onStrokeComplete?.();
      }
      return;
    } else if (["rectangle", "circle", "triangle", "line", "arrow"].includes(tool)) {
      setStartPos({ x, y });
      setIsDrawing(true);
      return;
    } else {
      // Pen and eraser tools
      context.beginPath();
      context.moveTo(x, y);
      setIsDrawing(true);
    }

    // Emit to socket
    const drawingData: DrawingData = {
      x,
      y,
      color,
      lineWidth,
      tool,
      isDrawing: true
    };
    socketRef.current?.emit("drawing", drawingData);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // Skip drawing for shape tools during drag
    if (["rectangle", "circle", "triangle", "line", "arrow"].includes(tool)) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.lineTo(x, y);
    context.stroke();

    setHasDrawing(true);
    onDrawingChange?.(true);

    // Emit to socket
    const drawingData: DrawingData = {
      x,
      y,
      color,
      lineWidth,
      tool
    };
    socketRef.current?.emit("drawing", drawingData);
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle shape tools
    if (tool === "rectangle" && startPos) {
      context.beginPath();
      context.rect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      context.stroke();
    } else if (tool === "circle" && startPos) {
      const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
      context.beginPath();
      context.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      context.stroke();
    } else if (tool === "triangle" && startPos) {
      context.beginPath();
      context.moveTo(startPos.x, startPos.y);
      context.lineTo(x, y);
      context.lineTo(startPos.x - (x - startPos.x), y);
      context.closePath();
      context.stroke();
    } else if (tool === "line" && startPos) {
      context.beginPath();
      context.moveTo(startPos.x, startPos.y);
      context.lineTo(x, y);
      context.stroke();
    } else if (tool === "arrow" && startPos) {
      // Draw arrow line
      context.beginPath();
      context.moveTo(startPos.x, startPos.y);
      context.lineTo(x, y);
      context.stroke();
      
      // Draw arrowhead
      const angle = Math.atan2(y - startPos.y, x - startPos.x);
      const headLength = 15;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x - headLength * Math.cos(angle - Math.PI / 6), y - headLength * Math.sin(angle - Math.PI / 6));
      context.moveTo(x, y);
      context.lineTo(x - headLength * Math.cos(angle + Math.PI / 6), y - headLength * Math.sin(angle + Math.PI / 6));
      context.stroke();
    }

    setIsDrawing(false);
    setStartPos(null);
    contextRef.current?.closePath();
    onStrokeComplete?.();

    // Emit stop drawing to socket
    socketRef.current?.emit("drawing", { 
      x: 0, 
      y: 0, 
      color, 
      lineWidth, 
      tool, 
      isDrawing: false 
    });
  };

  const drawFromSocket = (data: DrawingData) => {
    const context = contextRef.current;
    if (!context) return;

    if (data.tool === "eraser") {
      context.globalCompositeOperation = "destination-out";
    } else {
      context.globalCompositeOperation = "source-over";
    }

    context.strokeStyle = data.color;
    context.lineWidth = data.lineWidth;

    if (data.isDrawing) {
      context.beginPath();
      context.moveTo(data.x, data.y);
    } else if (data.prevX && data.prevY) {
      context.beginPath();
      context.moveTo(data.prevX, data.prevY);
      context.lineTo(data.x, data.y);
      context.stroke();
      context.closePath();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
    onDrawingChange?.(false);
    socketRef.current?.emit("clear");
  };

  return (
    <div className="flex-1 bg-canvas-bg rounded-lg shadow-elegant overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ touchAction: "none" }}
      />
    </div>
  );
});