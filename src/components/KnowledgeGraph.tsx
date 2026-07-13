"use client";

import { useMemo, useRef, useState } from "react";
import { Entry, MOODS, Mood } from "@/lib/types";

interface KnowledgeGraphProps {
  entries: Entry[];
  onClose: () => void;
  onSelectEntry: (id: string) => void;
}

interface GraphNode {
  id: string;
  title: string;
  mood: Mood;
  tags: string[];
  createdAt: string;
  x: number;
  y: number;
}

interface GraphEdge {
  a: number;
  b: number;
  weight: number;
  sharedTags: string[];
}

const WIDTH = 900;
const HEIGHT = 620;

function buildEdges(entries: Entry[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];
      const sharedTags = a.tags.filter((t) => b.tags.includes(t));
      const sameMood = a.mood === b.mood;
      const weight = sharedTags.length * 2 + (sameMood ? 1 : 0);
      if (weight > 0) {
        edges.push({ a: i, b: j, weight, sharedTags });
      }
    }
  }
  return edges;
}

function layoutNodes(entries: Entry[], edges: GraphEdge[]): GraphNode[] {
  const n = entries.length;
  const positions = entries.map((_, i) => {
    const angle = (i / Math.max(n, 1)) * Math.PI * 2;
    const r = Math.min(WIDTH, HEIGHT) * 0.32;
    return {
      x: WIDTH / 2 + Math.cos(angle) * r,
      y: HEIGHT / 2 + Math.sin(angle) * r,
      vx: 0,
      vy: 0,
    };
  });

  const REPULSION = 12000;
  const SPRING_LEN = 130;
  const SPRING_STRENGTH = 0.02;
  const CENTER_STRENGTH = 0.01;
  const DAMPING = 0.85;
  const ITERATIONS = n > 250 ? 60 : 140;

  for (let iter = 0; iter < ITERATIONS; iter++) {
    for (let i = 0; i < n; i++) {
      let fx = 0;
      let fy = 0;

      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const dx = positions[i].x - positions[j].x;
        const dy = positions[i].y - positions[j].y;
        const distSq = dx * dx + dy * dy + 0.01;
        const force = REPULSION / distSq;
        const dist = Math.sqrt(distSq);
        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      }

      fx += (WIDTH / 2 - positions[i].x) * CENTER_STRENGTH;
      fy += (HEIGHT / 2 - positions[i].y) * CENTER_STRENGTH;

      positions[i].vx = (positions[i].vx + fx) * DAMPING;
      positions[i].vy = (positions[i].vy + fy) * DAMPING;
    }

    for (const edge of edges) {
      const pa = positions[edge.a];
      const pb = positions[edge.b];
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
      const diff = (dist - SPRING_LEN) * SPRING_STRENGTH;
      const nx = dx / dist;
      const ny = dy / dist;
      pa.vx += nx * diff;
      pa.vy += ny * diff;
      pb.vx -= nx * diff;
      pb.vy -= ny * diff;
    }

    for (let i = 0; i < n; i++) {
      positions[i].x += positions[i].vx;
      positions[i].y += positions[i].vy;
      positions[i].x = Math.max(30, Math.min(WIDTH - 30, positions[i].x));
      positions[i].y = Math.max(30, Math.min(HEIGHT - 30, positions[i].y));
    }
  }

  return entries.map((e, i) => ({
    id: e.id,
    title: e.title || "Untitled",
    mood: e.mood,
    tags: e.tags,
    createdAt: e.createdAt,
    x: positions[i].x,
    y: positions[i].y,
  }));
}

const moodColor = (mood: Mood) => MOODS.find((m) => m.value === mood)?.color ?? "#a1a1aa";

export default function KnowledgeGraph({ entries, onClose, onSelectEntry }: KnowledgeGraphProps) {
  const edges = useMemo(() => buildEdges(entries), [entries]);
  const nodes = useMemo(() => layoutNodes(entries, edges), [entries, edges]);
  const maxWeight = useMemo(() => edges.reduce((m, e) => Math.max(m, e.weight), 1), [edges]);

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const connectedTo = useMemo(() => {
    if (hoverIdx === null) return null;
    const set = new Set<number>();
    edges.forEach((e) => {
      if (e.a === hoverIdx) set.add(e.b);
      if (e.b === hoverIdx) set.add(e.a);
    });
    return set;
  }, [hoverIdx, edges]);

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => ({ ...t, scale: Math.max(0.4, Math.min(2.5, t.scale * delta)) }));
  }

  function handleMouseDown(e: React.MouseEvent) {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: transform.x,
      origY: transform.y,
    };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setTransform((t) => ({ ...t, x: dragRef.current!.origX + dx, y: dragRef.current!.origY + dy }));
  }

  function handleMouseUp() {
    dragRef.current = null;
  }

  const hoveredNode = hoverIdx !== null ? nodes[hoverIdx] : null;

  return (
    <div className="yearly-overlay" onClick={onClose}>
      <div className="card relative w-full max-w-[960px] max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="yearly-header">
          <h2 className="yearly-title">Knowledge Graph</h2>
          <button onClick={onClose} className="yearly-close" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {entries.length < 2 ? (
          <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
            Write a few more entries with shared tags or moods to see connections here.
          </div>
        ) : (
          <>
            <p className="graph-hint">
              Entries connect when they share tags or mood. Scroll to zoom, drag to pan, click a node to open it.
            </p>

            <div
              className="graph-canvas"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                style={{
                  transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                  transformOrigin: "center center",
                  cursor: dragRef.current ? "grabbing" : "grab",
                }}
              >
                {edges.map((edge, i) => {
                  const na = nodes[edge.a];
                  const nb = nodes[edge.b];
                  const dimmed = connectedTo && !(edge.a === hoverIdx || edge.b === hoverIdx);
                  return (
                    <line
                      key={i}
                      x1={na.x}
                      y1={na.y}
                      x2={nb.x}
                      y2={nb.y}
                      className="graph-edge"
                      style={{
                        opacity: dimmed ? 0.08 : 0.15 + (edge.weight / maxWeight) * 0.45,
                        strokeWidth: 1 + (edge.weight / maxWeight) * 2,
                      }}
                    />
                  );
                })}

                {nodes.map((node, i) => {
                  const dimmed = connectedTo && hoverIdx !== i && !connectedTo.has(i);
                  const active = hoverIdx === i || (connectedTo?.has(i) ?? false);
                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onMouseEnter={() => setHoverIdx(i)}
                      onMouseLeave={() => setHoverIdx((cur) => (cur === i ? null : cur))}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEntry(node.id);
                        onClose();
                      }}
                      style={{ cursor: "pointer", opacity: dimmed ? 0.3 : 1 }}
                    >
                      <circle
                        r={active ? 11 : 8}
                        fill={moodColor(node.mood)}
                        stroke="var(--cal-bg)"
                        strokeWidth={2}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {hoveredNode && (
              <div className="graph-tooltip">
                <div className="graph-tooltip-title">{hoveredNode.title}</div>
                <div className="graph-tooltip-meta">
                  {new Date(hoveredNode.createdAt).toLocaleDateString()} · {hoveredNode.mood}
                  {hoveredNode.tags.length > 0 && <> · {hoveredNode.tags.map((t) => `#${t}`).join(" ")}</>}
                </div>
              </div>
            )}

            <div className="graph-legend">
              {MOODS.filter((m) => entries.some((e) => e.mood === m.value)).map((m) => (
                <div key={m.value} className="graph-legend-item">
                  <span className="graph-legend-dot" style={{ backgroundColor: m.color }} />
                  {m.label}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
