"use client";

import { useEffect, useRef } from "react";

import type { NodeDataPoint } from "@/lib/ping/types";

type PingQualityCanvasProps = {
  className?: string;
  points: NodeDataPoint[];
};

const BAR_WIDTH = 2;
const BAR_GAP = 1;

function getBarColor(point: NodeDataPoint) {
  if (point.timeout) {
    return "#ef4444";
  }
  if (point.value <= 50) {
    return "#10b981";
  }
  if (point.value <= 100) {
    return "#84cc16";
  }
  if (point.value <= 200) {
    return "#facc15";
  }
  if (point.value <= 250) {
    return "#fb923c";
  }

  return "#f87171";
}

function drawCanvas(canvas: HTMLCanvasElement, points: NodeDataPoint[]) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  const maxVisibleCount = Math.max(
    1,
    Math.floor((width + BAR_GAP) / (BAR_WIDTH + BAR_GAP)),
  );
  const visiblePoints = points.slice(-maxVisibleCount);
  const dpr = window.devicePixelRatio || 1;
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);

  if (!visiblePoints.length) {
    return;
  }

  visiblePoints.forEach((point, index) => {
    const value = point.timeout ? 200 : point.value;
    const barHeight = Math.max(6, Math.min(height - 1, value / 8));
    const x = index * (BAR_WIDTH + BAR_GAP);
    const y = height - barHeight;

    context.fillStyle = getBarColor(point);
    context.fillRect(x, y, BAR_WIDTH, barHeight);
  });
}

export function PingQualityCanvas({ className, points }: PingQualityCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    let frame = 0;
    const render = () => {
      drawCanvas(canvas, points);
    };

    render();

    const resizeObserver = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(render);
    });
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [points]);

  return (
    <canvas
      aria-label="网络质量趋势图"
      className={className || "block h-8 w-48"}
      ref={canvasRef}
      role="img"
    />
  );
}
