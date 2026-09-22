import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

/**
 * Drag, resize and expand behaviour for a floating panel on desktop.
 *
 * - Position and size are kept in `layout` (viewport pixels, top-left anchored).
 * - `headerProps` go on the drag handle; `handleProps(dir)` on resize handles.
 * - The layout is persisted under `storageKey` and clamped to the viewport.
 * - `padVar` (a CSS custom property on <html>) receives the width the page
 *   should reserve while the panel is docked to the right edge, so content can
 *   shift out from under it.
 */

export interface PanelLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type ResizeDir = "l" | "r" | "t" | "b" | "tl" | "tr" | "bl" | "br";

interface Options {
  storageKey: string;
  enabled: boolean;
  defaultWidth?: number;
  minWidth?: number;
  minHeight?: number;
  margin?: number;
  padVar?: string;
}

const DESKTOP = "(min-width: 1024px)";

export function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

function clampLayout(
  l: PanelLayout,
  minW: number,
  minH: number,
  margin: number,
): PanelLayout {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(Math.max(l.w, minW), Math.max(minW, vw - margin * 2));
  const h = Math.min(Math.max(l.h, minH), Math.max(minH, vh - margin * 2));
  const x = Math.min(Math.max(l.x, margin), Math.max(margin, vw - margin - w));
  const y = Math.min(Math.max(l.y, margin), Math.max(margin, vh - margin - h));
  return { x, y, w, h };
}

export function useFloatingPanel({
  storageKey,
  enabled,
  defaultWidth = 400,
  minWidth = 320,
  minHeight = 360,
  margin = 16,
  padVar = "--tutor-pad",
}: Options) {
  const defaults = useCallback((): PanelLayout => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(defaultWidth, vw - margin * 2);
    return { x: vw - margin - w, y: margin, w, h: vh - margin * 2 };
  }, [defaultWidth, margin]);

  const [layout, setLayout] = useState<PanelLayout | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState<"drag" | "resize" | null>(null);
  const beforeExpand = useRef<PanelLayout | null>(null);
  const gesture = useRef<{
    kind: "drag" | "resize";
    dir?: ResizeDir;
    startX: number;
    startY: number;
    start: PanelLayout;
  } | null>(null);

  // Load once on desktop.
  useEffect(() => {
    if (!enabled) return;
    let saved: { layout?: PanelLayout; expanded?: boolean } | null;
    try {
      const raw = localStorage.getItem(storageKey);
      saved = raw
        ? (JSON.parse(raw) as { layout?: PanelLayout; expanded?: boolean })
        : null;
    } catch {
      saved = null;
    }
    const base =
      saved?.layout && Number.isFinite(saved.layout.w)
        ? saved.layout
        : defaults();
    setLayout(clampLayout(base, minWidth, minHeight, margin));
    setExpanded(Boolean(saved?.expanded));
  }, [enabled, storageKey, defaults, minWidth, minHeight, margin]);

  // Persist.
  useEffect(() => {
    if (!enabled || !layout) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ layout, expanded }));
    } catch {
      // ignore
    }
  }, [enabled, layout, expanded, storageKey]);

  // Keep inside the viewport when the window shrinks.
  useEffect(() => {
    if (!enabled) return;
    const onResize = () =>
      setLayout((l) => (l ? clampLayout(l, minWidth, minHeight, margin) : l));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [enabled, minWidth, minHeight, margin]);

  // Reserve page padding while docked to the right edge.
  useEffect(() => {
    const root = document.documentElement;
    if (!enabled || !layout) {
      root.style.setProperty(padVar, "0px");
      return;
    }
    const docked = layout.x + layout.w >= window.innerWidth - margin * 2.5;
    const reserve = layout.w + margin * 1.5;
    // Only push page content aside while it keeps a readable width; a very wide
    // panel (e.g. expanded) simply overlays the page instead.
    const contentWidth =
      document.querySelector("main")?.getBoundingClientRect().width ??
      window.innerWidth;
    const fits = contentWidth - reserve >= 560;
    root.style.setProperty(padVar, docked && fits ? `${reserve}px` : "0px");
    return () => root.style.setProperty(padVar, "0px");
  }, [enabled, layout, margin, padVar]);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const g = gesture.current;
      if (!g) return;
      const dx = e.clientX - g.startX;
      const dy = e.clientY - g.startY;
      const s = g.start;
      let next: PanelLayout;
      if (g.kind === "drag") {
        next = { ...s, x: s.x + dx, y: s.y + dy };
      } else {
        const d = g.dir ?? "br";
        let { x, y, w, h } = s;
        if (d.includes("r")) w = s.w + dx;
        if (d.includes("b")) h = s.h + dy;
        if (d.includes("l")) {
          w = Math.max(minWidth, s.w - dx);
          x = s.x + (s.w - w);
        }
        if (d.includes("t")) {
          h = Math.max(minHeight, s.h - dy);
          y = s.y + (s.h - h);
        }
        next = { x, y, w, h };
      }
      setLayout(clampLayout(next, minWidth, minHeight, margin));
    },
    [minWidth, minHeight, margin],
  );

  const endGesture = useCallback(() => {
    gesture.current = null;
    setActive(null);
    document.body.style.removeProperty("user-select");
    document.body.style.removeProperty("cursor");
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endGesture);
    window.removeEventListener("pointercancel", endGesture);
  }, [onPointerMove]);

  const begin = useCallback(
    (e: ReactPointerEvent, kind: "drag" | "resize", dir?: ResizeDir) => {
      if (!layout || e.button !== 0) return;
      e.preventDefault();
      gesture.current = {
        kind,
        dir,
        startX: e.clientX,
        startY: e.clientY,
        start: layout,
      };
      setActive(kind);
      setExpanded(false);
      document.body.style.userSelect = "none";
      document.body.style.cursor =
        kind === "drag"
          ? "grabbing"
          : getComputedStyle(e.currentTarget as Element).cursor || "default";
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", endGesture);
      window.addEventListener("pointercancel", endGesture);
    },
    [layout, onPointerMove, endGesture],
  );

  useEffect(() => endGesture, [endGesture]);

  const headerProps = {
    onPointerDown: (e: ReactPointerEvent) => {
      if (
        (e.target as HTMLElement).closest("button, a, input, select, textarea")
      )
        return;
      begin(e, "drag");
    },
    onDoubleClick: (e: ReactPointerEvent | React.MouseEvent) => {
      if (
        (e.target as HTMLElement).closest("button, a, input, select, textarea")
      )
        return;
      setExpanded(false);
      setLayout(clampLayout(defaults(), minWidth, minHeight, margin));
    },
  };

  const handleProps = (dir: ResizeDir) => ({
    onPointerDown: (e: ReactPointerEvent) => begin(e, "resize", dir),
  });

  const toggleExpanded = () => {
    if (!layout) return;
    if (expanded) {
      setExpanded(false);
      setLayout(
        clampLayout(
          beforeExpand.current ?? defaults(),
          minWidth,
          minHeight,
          margin,
        ),
      );
      return;
    }
    beforeExpand.current = layout;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(960, vw - margin * 2);
    setLayout({ x: vw - margin - w, y: margin, w, h: vh - margin * 2 });
    setExpanded(true);
  };

  const reset = () => {
    setExpanded(false);
    setLayout(clampLayout(defaults(), minWidth, minHeight, margin));
  };

  const style: CSSProperties | undefined =
    enabled && layout
      ? {
          left: layout.x,
          top: layout.y,
          width: layout.w,
          height: layout.h,
          right: "auto",
          bottom: "auto",
        }
      : undefined;

  return {
    layout,
    style,
    expanded,
    active,
    headerProps,
    handleProps,
    toggleExpanded,
    reset,
  };
}
