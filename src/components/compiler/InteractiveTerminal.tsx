import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface TerminalStep {
  command: string;
  output: string;
  delay?: number; // ms to simulate typing/loading
}

interface InteractiveTerminalProps {
  scenarioName: string;
  steps: TerminalStep[];
  onComplete?: () => void;
}

export default function InteractiveTerminal({ scenarioName, steps, onComplete }: InteractiveTerminalProps) {
  const [history, setHistory] = useState<{ type: 'input' | 'output' | 'system', content: string }[]>([
    { type: 'system', content: `Starting Interactive Lab: ${scenarioName}` },
    { type: 'system', content: `Type the required commands to complete the scenario.` },
    { type: 'system', content: `Expected command: ${steps[0]?.command || 'None'}` }
  ]);
  const [input, setInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim() && !isProcessing) {
      const typedCommand = input.trim();
      setInput('');
      setHistory(prev => [...prev, { type: 'input', content: typedCommand }]);
      
      const expectedStep = steps[currentStep];
      if (!expectedStep) {
        setHistory(prev => [...prev, { type: 'system', content: 'Scenario already completed.' }]);
        return;
      }

      if (typedCommand === expectedStep.command) {
        setIsProcessing(true);
        if (expectedStep.delay) {
          await new Promise(r => setTimeout(r, expectedStep.delay));
        }
        
        setHistory(prev => [...prev, { type: 'output', content: expectedStep.output }]);
        
        const nextStepIdx = currentStep + 1;
        setCurrentStep(nextStepIdx);
        
        if (nextStepIdx >= steps.length) {
          setHistory(prev => [...prev, 
            { type: 'system', content: '✅ Scenario completed successfully!' }
          ]);
          if (onComplete) onComplete();
        } else {
          setHistory(prev => [...prev, 
            { type: 'system', content: `Next expected command: ${steps[nextStepIdx].command}` }
          ]);
        }
        setIsProcessing(false);
      } else {
        setHistory(prev => [...prev, 
          { type: 'output', content: `bash: ${typedCommand.split(' ')[0]}: command not found or incorrect for this scenario.` },
          { type: 'system', content: `Expected command: ${expectedStep.command}` }
        ]);
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-[600px] bg-black text-green-400 font-mono text-sm rounded-xl overflow-hidden border border-border shadow-md">
      <div className="bg-muted text-muted-foreground p-2 text-xs text-center border-b border-border font-sans uppercase tracking-widest flex justify-between items-center px-4">
        <span>Terminal</span>
        <span>{currentStep} / {steps.length} Steps</span>
      </div>
      <div className="flex-1 p-4 overflow-y-auto cursor-text" onClick={() => document.getElementById('terminal-input')?.focus()}>
        {history.map((entry, i) => (
          <div key={i} className="mb-1 whitespace-pre-wrap break-all">
            {entry.type === 'input' && <span className="text-blue-400">user@jobappy:~$ </span>}
            {entry.type === 'system' && <span className="text-amber-500 font-bold"># </span>}
            <span className={entry.type === 'output' ? 'text-gray-300' : entry.type === 'system' ? 'text-amber-500' : ''}>
              {entry.content}
            </span>
          </div>
        ))}
        {currentStep < steps.length && (
          <div className="flex items-center mt-1">
            <span className="text-blue-400 mr-2 whitespace-nowrap">user@jobappy:~$</span>
            <input 
              id="terminal-input"
              type="text" 
              className="flex-1 bg-transparent border-none outline-none text-green-400 w-full"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              autoComplete="off"
              spellCheck="false"
              autoFocus
            />
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
