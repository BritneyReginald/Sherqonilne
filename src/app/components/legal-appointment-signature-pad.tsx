import { useEffect, useRef, useState } from "react";

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
  saving?: boolean;
}

/**
 * Minimal draw-to-sign canvas. No external signature library — just
 * pointer events on a <canvas>, exported as a PNG data URL on save.
 * Works with mouse, trackpad and touch (pointer events cover all three).
 */
export function SignaturePad({ onSave, onCancel, saving }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Start with a plain white canvas so the exported PNG isn't transparent
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    drawingRef.current = true;
    lastPointRef.current = getPoint(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !lastPointRef.current) return;

    const point = getPoint(e);
    ctx.strokeStyle = "#0F172A";
    ctx.lineWidth = 2.25;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPointRef.current = point;
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    onSave(canvas.toDataURL("image/png"));
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={500}
        height={160}
        className="w-full rounded-lg border touch-none cursor-crosshair"
        style={{
          borderColor: "rgba(148,163,184,0.4)",
          backgroundColor: "#ffffff",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
      />
      <p className="text-xs mt-1.5" style={{ color: "#94A3B8" }}>
        Sign above using a mouse, trackpad, or touchscreen.
      </p>
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-2 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: "rgba(148,163,184,0.15)",
            color: "#475569",
          }}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: "rgba(148,163,184,0.15)",
            color: "#475569",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasDrawn || saving}
          className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
          style={{ backgroundColor: "#3B82F6" }}
        >
          {saving ? "Saving…" : "Save Signature"}
        </button>
      </div>
    </div>
  );
}
