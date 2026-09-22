import { getBezierPath, BaseEdge, EdgeLabelRenderer, EdgeProps } from '@xyflow/react';

export function UmlEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  markerStart,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} markerStart={markerStart} style={{...style, strokeWidth: 1.5, stroke: 'hsl(var(--foreground))'}} />
      {!!data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-background px-1 text-xs font-semibold"
          >
            {data.label as string}
          </div>
        </EdgeLabelRenderer>
      )}
      {!!data?.multiplicitySource && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceX + (targetX > sourceX ? 15 : -15)}px,${sourceY + (targetY > sourceY ? 15 : -15)}px)`,
            }}
            className="text-[10px] font-mono bg-background/50"
          >
            {data.multiplicitySource as string}
          </div>
        </EdgeLabelRenderer>
      )}
      {!!data?.multiplicityTarget && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${targetX + (sourceX > targetX ? 15 : -15)}px,${targetY + (sourceY > targetY ? 15 : -15)}px)`,
            }}
            className="text-[10px] font-mono bg-background/50"
          >
            {data.multiplicityTarget as string}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const edgeTypes = {
  umlEdge: UmlEdge,
};

// Definitions for react-flow markers
export const UmlMarkers = () => (
  <svg>
    <defs>
      <marker id="inheritance" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <polygon points="0,0 10,5 0,10" fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
      </marker>
      <marker id="composition" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <polygon points="5,0 10,5 5,10 0,5" fill="hsl(var(--foreground))" stroke="hsl(var(--foreground))" strokeWidth="1" />
      </marker>
      <marker id="aggregation" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <polygon points="5,0 10,5 5,10 0,5" fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
      </marker>
      <marker id="dependency" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <polyline points="0,0 10,5 0,10" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
      </marker>
    </defs>
  </svg>
);
