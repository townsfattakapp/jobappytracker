import { Handle, Position } from '@xyflow/react';

export function UmlClassNode({ data }: { data: any }) {
  return (
    <div className="bg-[hsl(var(--card))] border-2 border-primary/50 shadow-md min-w-[150px] font-mono text-sm overflow-hidden">
      <div className="bg-primary/10 border-b-2 border-primary/50 p-2 text-center font-bold">
        {data.isInterface && <div className="text-xs text-muted-foreground">&lt;&lt;interface&gt;&gt;</div>}
        {data.isAbstract && <div className="text-xs text-muted-foreground">&lt;&lt;abstract&gt;&gt;</div>}
        {data.label}
      </div>
      {data.attributes && data.attributes.length > 0 && (
        <div className="border-b-2 border-primary/50 p-2 text-xs whitespace-pre-wrap">
          {data.attributes.join('\n')}
        </div>
      )}
      {(!data.attributes || data.attributes.length === 0) && data.methods && data.methods.length > 0 && (
        <div className="border-b-2 border-primary/50" />
      )}
      {data.methods && data.methods.length > 0 && (
        <div className="p-2 text-xs whitespace-pre-wrap">
          {data.methods.join('\n')}
        </div>
      )}
      
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
      <Handle type="target" position={Position.Left} id="left" className="w-2 h-2 !bg-primary" />
      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 !bg-primary" />
    </div>
  );
}

export function UmlUseCaseNode({ data }: { data: any }) {
  return (
    <div className="bg-[hsl(var(--card))] border-2 border-primary/50 shadow-md rounded-[100%] flex items-center justify-center p-4 min-w-[120px] min-h-[60px] text-center font-semibold text-sm">
      {data.label}
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-primary" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-primary" />
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
    </div>
  );
}

export function UmlActorNode({ data }: { data: any }) {
  return (
    <div className="flex flex-col items-center justify-center font-semibold text-sm">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
        <circle cx="12" cy="7" r="4"></circle>
        <line x1="12" y1="11" x2="12" y2="17"></line>
        <line x1="12" y1="17" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="8" y2="21"></line>
        <line x1="8" y1="13" x2="16" y2="13"></line>
      </svg>
      <span className="mt-1">{data.label}</span>
      <Handle type="source" position={Position.Right} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
    </div>
  );
}

export const nodeTypes = {
  umlClass: UmlClassNode,
  umlUseCase: UmlUseCaseNode,
  umlActor: UmlActorNode,
};
