import React, { useRef, useEffect } from "react";

export const HeroGlobe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let rotation = 0;

    // Generate fixed 3D points on a sphere
    const points: { phi: number; theta: number; size: number; color: string }[] = [];
    const numPoints = 260;
    for (let i = 0; i < numPoints; i++) {
      points.push({
        phi: Math.acos(-1 + (2 * i) / numPoints),
        theta: Math.sqrt(numPoints * Math.PI) * i,
        size: Math.random() * 1.8 + 0.8,
        color: Math.random() > 0.5 ? "#FF5722" : Math.random() > 0.25 ? "#FFA000" : "rgba(255,255,255,0.6)",
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = canvas.width * 0.42;

      rotation += 0.0025;

      // Draw subtle outer glow
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.3);
      grad.addColorStop(0, "rgba(255, 87, 34, 0.12)");
      grad.addColorStop(0.5, "rgba(255, 87, 34, 0.03)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Draw latitude / longitude wireframe rings
      ctx.lineWidth = 0.8;
      for (let lat = -60; lat <= 60; lat += 25) {
        const radLat = (lat * Math.PI) / 180;
        const r = radius * Math.cos(radLat);
        const y = cy + radius * Math.sin(radLat);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.beginPath();
        ctx.ellipse(cx, y, r, r * 0.32, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw rotating longitude ellipses
      for (let lon = 0; lon < 6; lon++) {
        const angle = rotation + (lon * Math.PI) / 6;
        const rx = radius * Math.abs(Math.sin(angle));
        ctx.strokeStyle = "rgba(255, 87, 34, 0.04)";
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw rotating 3D surface points
      points.forEach((pt) => {
        const currentTheta = pt.theta + rotation;
        const x3d = radius * Math.sin(pt.phi) * Math.cos(currentTheta);
        const y3d = radius * Math.cos(pt.phi);
        const z3d = radius * Math.sin(pt.phi) * Math.sin(currentTheta);

        // Only draw front-facing points (z > 0 has higher opacity)
        if (z3d > -radius * 0.2) {
          const depthAlpha = Math.max(0.1, (z3d + radius) / (radius * 2));
          const screenX = cx + x3d;
          const screenY = cy + y3d * 0.9;

          ctx.beginPath();
          ctx.arc(screenX, screenY, pt.size * (0.8 + depthAlpha * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = depthAlpha * 0.85;
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={320}
      className="w-[480px] h-[320px] pointer-events-none opacity-80"
    />
  );
};
