
import { useRef, useState, useEffect } from "react";

type Props = {
  onSave: (dataUrl: string) => void;
  disabled?: boolean;
};

export function SignaturePad({ onSave, disabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const hasDrawnRef = useRef(false);
  const lastWidthRef = useRef<number | null>(null);

  useEffect(() => {
    hasDrawnRef.current = hasDrawn;
  }, [hasDrawn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    function resizeCanvas() {
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();

      if (rect.width <= 0) return;

      if (lastWidthRef.current === rect.width) return;
      lastWidthRef.current = rect.width;

      const dpr = window.devicePixelRatio || 1;

      const prevDataUrl = hasDrawnRef.current
        ? canvas.toDataURL("image/png")
        : null;

      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(160 * dpr);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (prevDataUrl) {
        const img = new Image();

        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, 160);
        };

        img.src = prevDataUrl;
      }
    }

    resizeCanvas();

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function handlePointerDown(
    e: React.PointerEvent<HTMLCanvasElement>,
  ) {
    if (disabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();

    const { x, y } = getPos(e);

    ctx.beginPath();
    ctx.moveTo(x, y);

    // Mark as drawn immediately so a single dot can be saved.
    setHasDrawn(true);

    // Draw a small dot for a single-point signature.
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fillStyle = "#1f2937";
    ctx.fill();

    // Begin a new path for continuous drawing.
    ctx.beginPath();
    ctx.moveTo(x, y);

    setIsDrawing(true);
  }

  function handlePointerMove(
    e: React.PointerEvent<HTMLCanvasElement>,
  ) {
    if (!isDrawing || disabled) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    e.preventDefault();

    const { x, y } = getPos(e);

    ctx.lineTo(x, y);
    ctx.stroke();

    setHasDrawn(true);
  }

  function handlePointerUp(
    e: React.PointerEvent<HTMLCanvasElement>,
  ) {
    setIsDrawing(false);

    if (
      canvasRef.current?.hasPointerCapture(e.pointerId)
    ) {
      canvasRef.current.releasePointerCapture(e.pointerId);
    }
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(
      0,
      0,
      canvas.width / dpr,
      canvas.height / dpr,
    );

    setHasDrawn(false);
  }

  function handleSave() {
    const canvas = canvasRef.current;

    if (!canvas || !hasDrawn) return;

    const dataUrl = canvas.toDataURL("image/png");

    onSave(dataUrl);
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="w-full">
        <canvas
          ref={canvasRef}
          className="border rounded-lg bg-white touch-none w-full block"
          style={{
            height: "160px",
            touchAction: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>

      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className="px-3 py-1.5 text-sm border rounded-lg text-gray-600"
        >
          Clear
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={disabled || !hasDrawn}
          className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg disabled:bg-gray-300"
        >
          Save Signature
        </button>

        {!disabled && !hasDrawn && (
          <span className="text-xs text-gray-400">
            Draw your signature above first
          </span>
        )}
      </div>
    </div>
  );
}