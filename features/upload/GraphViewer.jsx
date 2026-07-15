"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export default function GraphViewer({ graph }) {
  const [zoom, setZoom] = useState(100);

  function handleZoomIn() {
    setZoom(Math.min(zoom + 25, 200));
  }

  function handleZoomOut() {
    setZoom(Math.max(zoom - 25, 50));
  }

  function handleReset() {
    setZoom(100);
  }

  return (
    <div className="graph-viewer">
      <h3>그래프</h3>
      <div className="graph-container">
        {typeof graph === "string" ? (
          <img src={graph} alt="그래프" style={{ width: `${zoom}%` }} />
        ) : (
          <div style={{ transform: `scale(${zoom / 100})` }}>{graph}</div>
        )}
      </div>
      <div className="graph-controls">
        <button onClick={handleZoomOut} aria-label="축소">
          <ZoomOut size={18} />
        </button>
        <span>{zoom}%</span>
        <button onClick={handleZoomIn} aria-label="확대">
          <ZoomIn size={18} />
        </button>
        <button onClick={handleReset} aria-label="원본 크기">
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}
