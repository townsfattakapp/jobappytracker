import { useState } from 'react';
import { umlTutorials } from '../../data/umlLearning';
import MermaidEditor from '../MermaidEditor';

export default function UmlLearningMode() {
  const [selectedTutorial, setSelectedTutorial] = useState(umlTutorials[0]);

  return (
    <div className="flex h-full border border-border rounded-xl overflow-hidden surface">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-muted/20 flex flex-col">
        <div className="p-4 border-b border-border font-semibold text-sm tracking-wider uppercase">
          Learning Paths
        </div>
        <div className="flex-1 overflow-y-auto">
          {umlTutorials.map((tut) => (
            <button
              key={tut.id}
              onClick={() => setSelectedTutorial(tut)}
              className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                selectedTutorial.id === tut.id
                  ? 'bg-primary/10 text-primary border-l-4 border-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-4 border-transparent'
              }`}
            >
              {tut.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 animate-fade">
        <div>
          <h2 className="text-2xl font-bold">{selectedTutorial.title}</h2>
          <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium">
            Diagram Type: {selectedTutorial.diagramType}
          </span>
        </div>

        <div className="space-y-12">
          {selectedTutorial.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h3 className="text-xl font-semibold border-b border-border/50 pb-2">{section.title}</h3>
              <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {section.content}
              </div>
              {section.mermaidExample && (
                <div className="mt-4 p-4 rounded-xl border border-border bg-background shadow-sm">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Example Rendering</h4>
                  <MermaidEditor value={section.mermaidExample} readOnly />
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
