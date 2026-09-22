import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import mermaid from 'mermaid'
import { useIsDark } from '../lib/useTheme'

export interface MermaidEditorProps {
  value: string
  onChange?: (val: string) => void
  readOnly?: boolean
  className?: string
}

export default function MermaidEditor({ value, onChange, readOnly = false, className = '' }: MermaidEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const isDark = useIsDark()
  
  // Need a stable ID to avoid conflicts when rendering multiple diagrams
  const idRef = useRef(`mermaid-${uuidv4().slice(0, 8)}`)

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: isDark ? 'dark' : 'default', fontFamily: 'var(--font-sans), Inter, sans-serif' })
  }, [isDark])

  useEffect(() => {
    let active = true
    if (!value.trim()) {
      if (containerRef.current) containerRef.current.innerHTML = ''
      setError(null)
      return
    }

    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(idRef.current, value)
        if (active && containerRef.current) {
          containerRef.current.innerHTML = svg
          setError(null)
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Syntax Error')
        }
      }
    }
    
    renderDiagram()

    return () => {
      active = false
    }
  }, [value, isDark])

  return (
    <div className={`mermaid-editor flex flex-col gap-2 ${className}`}>
      {!readOnly && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground flex justify-between">
            Mermaid Source
            <a href="https://mermaid.js.org/syntax/flowchart.html" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Syntax Help</a>
          </label>
          <textarea 
            className="input-field font-mono text-xs min-h-[120px]"
            value={value}
            onChange={e => onChange?.(e.target.value)}
            placeholder="graph TD;\n  A-->B;"
          />
        </div>
      )}
      
      <div className={`mt-2 p-4 bg-[hsl(var(--card))] rounded-xl border border-border overflow-auto min-h-[150px] flex justify-center items-center ${error ? 'border-destructive/50' : ''}`} ref={containerRef}>
        {!value.trim() && <span className="text-muted-foreground opacity-50">Empty Diagram</span>}
      </div>
      
      {error && (
        <div className="text-destructive text-xs bg-destructive/10 p-2 rounded border border-destructive/20 whitespace-pre-wrap">
          Syntax Error: {error}
        </div>
      )}
    </div>
  )
}
