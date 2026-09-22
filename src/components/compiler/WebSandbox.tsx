import { Sandpack } from "@codesandbox/sandpack-react";
import { useIsDark } from "../../lib/useTheme";

interface WebSandboxProps {
  template?: "react" | "react-ts" | "vanilla" | "vanilla-ts" | "node" | "nextjs" | "vite-react" | "vite-react-ts";
  files?: Record<string, string | { code: string; active?: boolean; hidden?: boolean }>;
  readOnly?: boolean;
}

export default function WebSandbox({ template = "react", files = {}, readOnly = false }: WebSandboxProps) {
  const isDark = useIsDark();
  return (
    <div className="w-full rounded-xl overflow-hidden shadow-sm border border-border">
      <Sandpack
        template={template}
        files={files}
        theme={isDark ? "dark" : "light"}
        options={{
          showConsoleButton: true,
          showConsole: true,
          showTabs: true,
          showLineNumbers: true,
          editorHeight: 600,
          readOnly: readOnly,
          classes: {
            "sp-wrapper": "custom-wrapper",
            "sp-layout": "custom-layout",
          },
        }}
      />
    </div>
  );
}
