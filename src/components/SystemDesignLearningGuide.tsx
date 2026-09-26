import type { SystemDesignExercise } from '../types'
import { systemDesignGuides, systemDesignSteps } from '../data/systemDesignGuides'

export default function SystemDesignLearningGuide({ exercise }: { exercise: SystemDesignExercise }) {
  const guide = systemDesignGuides[exercise.id]
  return (
    <section aria-label="Design practice guide" className="surface border border-border rounded-xl p-5 sm:p-6 flex flex-col gap-5">
      <div>
        <p className="text-xs text-primary font-semibold mb-2">{exercise.difficulty} · {exercise.type === 'HLD' ? '40' : '45'} minute suggested practice · Self-assessed</p>
        <h2 className="text-lg font-semibold">Problem brief</h2>
        <p className="text-sm text-muted-foreground mt-2">{guide?.brief ?? `Practice ${exercise.title.toLowerCase()}. Start by defining your scope and assumptions, then follow the steps below.`}</p>
      </div>
      {guide && <div>
        <h3 className="font-medium mb-2">Requirements to explore</h3>
        <p className="text-xs text-muted-foreground mb-2">Treat these as practice assumptions. Explain any changes you make.</p>
        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
          {guide.requirements.map(item => <li key={item}>{item}</li>)}
        </ul>
      </div>}
      <div>
        <h3 className="font-medium mb-3">Work through the design</h3>
        <ol className="grid sm:grid-cols-2 gap-3">
          {systemDesignSteps[exercise.type].map(([title, description], index) => (
            <li key={title} className="rounded-lg bg-muted/40 p-3">
              <p className="text-sm font-medium">{index + 1}. {title}</p>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </li>
          ))}
        </ol>
      </div>
      {guide && <div className="grid sm:grid-cols-2 gap-3">
        <details className="border border-border rounded-lg p-3">
          <summary className="cursor-pointer text-sm font-medium">Need a hint?</summary>
          <p className="text-sm text-muted-foreground mt-3">{guide.hint}</p>
        </details>
        <details className="border border-border rounded-lg p-3">
          <summary className="cursor-pointer text-sm font-medium">Self-review and stretch challenge</summary>
          <p className="text-sm text-muted-foreground mt-3">{guide.review}</p>
          <p className="text-sm text-muted-foreground mt-3"><strong className="text-foreground">Stretch: </strong>{guide.stretch}</p>
        </details>
      </div>}
      <p className="text-xs text-muted-foreground">Before marking solved: trace a happy path and a failure, justify one trade-off, and identify one improvement. There can be several valid designs.</p>
    </section>
  )
}
