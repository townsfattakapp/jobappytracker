import Editor from "@monaco-editor/react";
import { useIsDark } from "../lib/useTheme";
import { useState, useEffect } from "react";

interface CodeEditorProps {
  value: string;
  language?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  minHeight?: string;
}

export default function CodeEditor({ value, language = "javascript", onChange, readOnly = false, minHeight = "200px" }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);
  const isDark = useIsDark();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ minHeight }} className="w-full bg-muted/20 animate-pulse rounded-md border border-border" />;

  return (
    <div className="border border-border rounded-md overflow-hidden relative" style={{ height: minHeight, resize: 'vertical' }}>
      <Editor
        height="100%"
        language={language.toLowerCase()}
        value={value}
        theme={isDark ? "vs-dark" : "light"}
        onChange={(val) => onChange && onChange(val || "")}
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          fontFamily: "var(--font-mono), 'JetBrains Mono', Consolas, monospace",
          wordWrap: "on",
          lineNumbersMinChars: 3,
          padding: { top: 12, bottom: 12 },
          automaticLayout: true,
        }}
        loading={<div className="p-4 text-sm text-muted-foreground">Loading editor...</div>}
      />
    </div>
  );
}
