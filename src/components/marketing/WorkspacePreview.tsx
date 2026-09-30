import { ArrowUpRight, Check, Circle, Code2, Compass, LayoutDashboard, Mic, Network, Sparkles } from 'lucide-react'

/** A responsive, explicitly illustrative preview; no account data or live metrics. */
export default function WorkspacePreview() {
  return (
    <figure className="lp-workspace-preview" aria-label="Example daily preparation plan">
      <div className="lp-preview-toolbar">
        <span className="lp-preview-brand"><span className="lp-preview-dot" /> Your workspace</span>
        <span className="lp-preview-label">Sample plan</span>
      </div>
      <div className="lp-preview-body">
        <div className="lp-preview-rail" aria-hidden="true">
          <LayoutDashboard size={19} /><Compass size={19} /><Code2 size={19} /><Mic size={19} />
        </div>
        <div className="lp-preview-content">
          <div className="lp-preview-kicker"><Sparkles size={14} /> A little progress, every day</div>
          <h2>Your next chapter<br />starts today.</h2>
          <p>A focused plan. A clear path forward.</p>
          <div className="lp-preview-goal">
            <div><span>YOUR CAREER GOAL</span><strong>Become a backend engineer</strong></div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </div>
          <div className="lp-preview-section"><strong>Today’s focus</strong><span>3 activities · 75 min</span></div>
          <div className="lp-preview-task is-complete">
            <span className="lp-preview-task-icon"><Code2 size={18} /></span>
            <div><strong>Build your foundations</strong><span>Arrays & hash maps · 25 min</span></div>
            <Check size={17} aria-label="Completed" />
          </div>
          <div className="lp-preview-task">
            <span className="lp-preview-task-icon"><Network size={18} /></span>
            <div><strong>Think in systems</strong><span>Design a rate limiter · 30 min</span></div>
            <Circle size={17} aria-label="Pending" />
          </div>
          <div className="lp-preview-task">
            <span className="lp-preview-task-icon"><Mic size={18} /></span>
            <div><strong>Practice your delivery</strong><span>Behavioral interview · 20 min</span></div>
            <Circle size={17} aria-label="Pending" />
          </div>
          <div className="lp-preview-progress"><span /><span /><span /></div>
          <div className="lp-preview-footer"><span>One step closer to your goal</span><strong>1 / 3 complete</strong></div>
        </div>
      </div>
    </figure>
  )
}
