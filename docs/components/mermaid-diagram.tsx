"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

interface MermaidDiagramProps {
  chart: string;
  title?: string;
  className?: string;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

export function MermaidDiagram({
  chart,
  title,
  className,
}: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const renderKeyRef = useRef(0);
  const isRenderingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const renderDiagram = async () => {
      // Prevent concurrent renders
      if (isRenderingRef.current) return;
      isRenderingRef.current = true;

      try {
        const currentKey = ++renderKeyRef.current;
        const container = containerRef.current;

        // Create a new div for Mermaid (React won't manage this)
        if (
          mermaidRef.current &&
          container &&
          mermaidRef.current.parentNode === container
        ) {
          // Remove old mermaid div safely
          try {
            container.removeChild(mermaidRef.current);
          } catch (e) {
            // Ignore if already removed
          }
        }

        // Check if we're still the current render
        if (currentKey !== renderKeyRef.current) {
          isRenderingRef.current = false;
          return;
        }

        // Create new mermaid container
        if (!container) {
          isRenderingRef.current = false;
          return;
        }

        const mermaidContainer = document.createElement("div");
        mermaidContainer.className = "mermaid";
        mermaidContainer.textContent = chart;
        mermaidContainer.id = `mermaid-${Math.random()
          .toString(36)
          .substring(7)}`;

        container.appendChild(mermaidContainer);
        mermaidRef.current = mermaidContainer;

        // Check again if we're still current
        if (currentKey !== renderKeyRef.current) {
          isRenderingRef.current = false;
          return;
        }

        await mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "default",
          themeVariables: {
            fontFamily: "var(--font-mono)",
            fontSize: "16px",
            // Neutral colors - no bright colors
            primaryColor: isDark ? "#6b7280" : "#6b7280",
            primaryTextColor: isDark ? "#e5e7eb" : "#374151",
            primaryBorderColor: isDark ? "#4b5563" : "#9ca3af",
            lineColor: isDark ? "#6b7280" : "#9ca3af",
            secondaryColor: isDark ? "#374151" : "#f3f4f6",
            tertiaryColor: isDark ? "#1f2937" : "#ffffff",
            // Flowchart specific
            mainBkgColor: isDark ? "#374151" : "#f9fafb",
            secondBkgColor: isDark ? "#4b5563" : "#f3f4f6",
            tertiaryBkgColor: isDark ? "#6b7280" : "#e5e7eb",
            secondaryBorderColor: isDark ? "#4b5563" : "#d1d5db",
            tertiaryBorderColor: isDark ? "#374151" : "#e5e7eb",
            secondaryTextColor: isDark ? "#d1d5db" : "#4b5563",
            tertiaryTextColor: isDark ? "#9ca3af" : "#6b7280",
            textColor: isDark ? "#e5e7eb" : "#374151",
            // Sequence diagram specific
            actorBorder: isDark ? "#6b7280" : "#9ca3af",
            actorBkg: isDark ? "#374151" : "#f9fafb",
            actorTextColor: isDark ? "#e5e7eb" : "#374151",
            actorLineColor: isDark ? "#6b7280" : "#9ca3af",
            signalColor: isDark ? "#9ca3af" : "#6b7280",
            signalTextColor: isDark ? "#e5e7eb" : "#374151",
            labelBoxBkgColor: isDark ? "#374151" : "#f9fafb",
            labelBoxBorderColor: isDark ? "#6b7280" : "#9ca3af",
            labelTextColor: isDark ? "#e5e7eb" : "#374151",
            noteBorderColor: isDark ? "#6b7280" : "#9ca3af",
            noteBkgColor: isDark ? "#374151" : "#f9fafb",
            noteTextColor: isDark ? "#e5e7eb" : "#374151",
            activationBorderColor: isDark ? "#6b7280" : "#9ca3af",
            activationBkgColor: isDark ? "#4b5563" : "#e5e7eb",
          },
          securityLevel: "loose",
        });

        // Wait a bit to ensure DOM is ready
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Final check if we're still current
        if (currentKey !== renderKeyRef.current || !mermaidRef.current) {
          isRenderingRef.current = false;
          return;
        }

        try {
          await mermaid.run({
            nodes: [mermaidRef.current],
            suppressErrors: true,
          });
        } catch (runError) {
          console.error("Mermaid run error:", runError);
          // Fallback: show code if rendering fails
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = `<pre class="text-sm text-muted-foreground p-4">${chart}</pre>`;
          }
        }
      } catch (error) {
        console.error("Mermaid rendering error:", error);
      } finally {
        isRenderingRef.current = false;
      }
    };

    renderDiagram();

    // Cleanup function
    return () => {
      renderKeyRef.current++;
      if (mermaidRef.current && mermaidRef.current.parentNode) {
        try {
          mermaidRef.current.parentNode.removeChild(mermaidRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
        mermaidRef.current = null;
      }
    };
  }, [chart, mounted, isDark]);

  // Listen for theme changes
  useEffect(() => {
    if (!mounted) return;

    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains("dark");
      if (dark !== isDark) {
        setIsDark(dark);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [mounted, isDark]);

  // Mouse wheel zoom (without Ctrl/Cmd needed)
  useEffect(() => {
    if (!mounted || !wrapperRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      // Allow zoom with or without Ctrl/Cmd
      if (e.ctrlKey || e.metaKey || true) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setZoom((prev) => {
          const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta));
          return newZoom;
        });
      }
    };

    const wrapper = wrapperRef.current;
    wrapper.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      wrapper.removeEventListener("wheel", handleWheel);
    };
  }, [mounted]);

  // Drag to pan functionality
  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const container = containerRef.current;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left mouse button
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
      container.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      container.style.cursor = zoom > 1 ? "grab" : "default";
    };

    const handleMouseLeave = () => {
      setIsDragging(false);
      container.style.cursor = zoom > 1 ? "grab" : "default";
    };

    container.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mouseleave", handleMouseLeave);

    // Update cursor style based on zoom
    if (zoom > 1) {
      container.style.cursor = isDragging ? "grabbing" : "grab";
    } else {
      container.style.cursor = "default";
    }

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mounted, isDragging, dragStart, position, zoom]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(MIN_ZOOM, prev - ZOOM_STEP));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="h-8 w-8 p-0"
            title="Zoom Out (Scroll)"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="h-8 w-8 p-0"
            title="Zoom In (Scroll)"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetZoom}
            disabled={zoom === 1 && position.x === 0 && position.y === 0}
            className="h-8 w-8 p-0"
            title="Reset Zoom & Position"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="rounded-lg border bg-card p-6 overflow-hidden relative">
        <div
          ref={wrapperRef}
          className="overflow-auto"
          style={{
            maxHeight: "600px",
          }}
        >
          <div
            ref={containerRef}
            className="min-h-[500px] flex items-center justify-center transition-transform duration-200 select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            {!mounted && (
              <div className="text-muted-foreground">Loading diagram...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
