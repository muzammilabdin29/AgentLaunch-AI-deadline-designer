import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine, ArrowRight, CalendarDays, Check, CheckCircle2,
  Clock3, Image, Laptop, LayoutGrid, MoonStar, Plus, RefreshCw,
  Rocket, ShieldCheck, Smartphone, Sparkles, Trash2, WandSparkles
} from 'lucide-react';
import { addDaysISO, daysRemaining, localISO, prettyDate, dateFromISO } from './utils/dates.js';
import { cleanMilestones, starterMilestones } from './utils/milestones.js';
import { DIMENSIONS, drawCover, drawWallpaper } from './utils/wallpaper.js';

const STORAGE_KEY = 'agentlaunch-project-v1';
const THEME_OPTIONS = [
  { id: 'mission', name: 'Mission control', desc: 'Cosmic midnight', swatches: ['#070c1b', '#c5fff0', '#8c93ff'] },
  { id: 'aurora', name: 'Aurora', desc: 'Colorful focus', swatches: ['#0b4555', '#a2ffe0', '#f7c4fa'] },
  { id: 'minimal', name: 'After hours', desc: 'Quiet elegance', swatches: ['#181a1e', '#ffdf9f', '#ffb1a0'] }
];

function freshProject() {
  const deadline = addDaysISO(localISO(), 29);
  return {
    goal: 'Launch my first AI agent',
    deadline,
    theme: 'mission',
    format: 'phone',
    milestones: starterMilestones(deadline)
  };
}

function storedProject() {
  const fallback = freshProject();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return fallback;
    return {
      goal: typeof saved.goal === 'string' ? saved.goal.slice(0, 95) : fallback.goal,
      deadline: dateFromISO(saved.deadline) ? saved.deadline : fallback.deadline,
      theme: THEME_OPTIONS.some(t => t.id === saved.theme) ? saved.theme : fallback.theme,
      format: DIMENSIONS[saved.format] ? saved.format : 'phone',
      milestones: Array.isArray(saved.milestones) ? cleanMilestones(saved.milestones) : fallback.milestones
    };
  } catch { return fallback; }
}

function saveCanvas(canvas, filename) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) return reject(new Error('Could not export the PNG'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      resolve();
    }, 'image/png');
  });
}

export default function App() {
  const [project, setProject] = useState(storedProject);
  const [now, setNow] = useState(() => new Date());
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState({ type: 'neutral', text: 'Your design is saved automatically in this browser.' });
  const canvasRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  }, [project]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (canvasRef.current) drawWallpaper(canvasRef.current, project, now);
  }, [project, now]);

  const remaining = daysRemaining(project.deadline, now);
  const validDeadline = Boolean(dateFromISO(project.deadline)) && project.deadline >= localISO(now);
  const validProject = project.goal.trim().length >= 5 && validDeadline && project.milestones.length > 0 && project.milestones.every(m => m.title.trim() && dateFromISO(m.date) && m.date <= project.deadline);

  function patch(values) { setProject(old => ({ ...old, ...values })); }
  function updateMilestone(id, update) {
    patch({ milestones: project.milestones.map(m => m.id === id ? { ...m, ...update } : m) });
  }

  async function generateMilestones() {
    if (!validDeadline || project.goal.trim().length < 5) {
      setMessage({ type: 'error', text: 'Please enter a goal of at least five characters and a future deadline.' });
      return;
    }
    setGenerating(true);
    setMessage({ type: 'neutral', text: 'Gemini is mapping out your path to the deadline…' });
    try {
      const response = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: project.goal, deadline: project.deadline, today: localISO(now), vibe: project.theme })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to reach the AI planner');
      patch({ milestones: cleanMilestones(data.milestones) });
      setMessage({ type: 'success', text: 'Five milestones generated with Google Gemini. Edit them to make the plan your own.' });
    } catch (error) {
      setMessage({ type: 'error', text: `${error.message} Use “Starter plan” to continue without AI.` });
    } finally {
      setGenerating(false);
    }
  }

  function useStarterPlan() {
    if (!validDeadline) {
      setMessage({ type: 'error', text: 'Choose an upcoming deadline first.' });
      return;
    }
    patch({ milestones: starterMilestones(project.deadline, localISO(now)) });
    setMessage({ type: 'success', text: 'Starter milestones added. No API key required.' });
  }

  async function downloadWallpaper() {
    if (!validProject) {
      setMessage({ type: 'error', text: 'Complete your goal, deadline and milestone titles before exporting.' });
      return;
    }
    const canvas = document.createElement('canvas');
    drawWallpaper(canvas, project, new Date());
    await saveCanvas(canvas, `AgentLaunch-${project.format}-${project.deadline}.png`);
    setMessage({ type: 'success', text: 'Wallpaper exported! Set the PNG as your device background.' });
  }

  async function downloadCover() {
    if (!validProject) {
      setMessage({ type: 'error', text: 'Complete your goal, deadline and milestones before exporting.' });
      return;
    }
    const canvas = document.createElement('canvas');
    drawCover(canvas, project, new Date());
    await saveCanvas(canvas, `AgentLaunch-cover-${project.deadline}.png`);
    setMessage({ type: 'success', text: 'Handshake cover image exported at 1200 × 630.' });
  }

  function updateDeadline(value) {
    patch({ deadline: value, milestones: starterMilestones(value, localISO(now)) });
    setMessage({ type: 'neutral', text: 'Deadline updated. Starter milestone dates were adjusted; regenerate with Gemini for a tailored plan.' });
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <header className="header wrap">
        <div className="brand">
          <div className="brand-icon">A<span>✦</span></div>
          <div><strong>agentlaunch</strong><small>AI deadline designer</small></div>
        </div>
        <div className="header-right"><span className="challenge-dot" /><span>HANDSHAKE × GOOGLE CHALLENGE</span><span className="header-divider" /><span className="edition">2026 EDITION</span></div>
      </header>

      <main className="wrap main-content">
        <div className="intro">
          <div className="eyebrow"><Sparkles size={14} /> THE DEADLINE DESIGN STUDIO <span className="eyebrow-rule" /></div>
          <h1>Make the deadline <em>beautiful.</em></h1>
          <p>Turn your biggest goal into a daily reminder to keep moving. Let Gemini plan your milestones, then design a lock screen that's impossible to ignore.</p>
        </div>

        <div className="workspace">
          <section className="editor-panel" aria-label="Wallpaper editor">
            <div className="panel-title"><div><span className="step-chip">01</span><h2>Define your mission</h2></div><span className="section-aside">Every big thing starts somewhere.</span></div>
            <div className="form-grid">
              <label className="field field-full"><span className="label-title">WHAT ARE YOU WORKING TOWARD?</span><input aria-label="Goal" maxLength={95} value={project.goal} onChange={e => patch({ goal: e.target.value })} placeholder="Launch my first AI agent" /><span className="field-help">Keep it short. This becomes your wallpaper headline.</span></label>
              <label className="field field-full"><span className="label-title"><CalendarDays size={14} /> YOUR DEADLINE</span><input aria-label="Deadline" type="date" min={localISO(now)} value={project.deadline} onChange={e => updateDeadline(e.target.value)} /></label>
            </div>

            <div className="hairline" />
            <div className="panel-title subsection"><div><span className="step-chip">02</span><h2>Choose your canvas</h2></div></div>
            <div className="format-row" role="group" aria-label="Wallpaper format">
              <button className={`format-option ${project.format === 'phone' ? 'selected' : ''}`} type="button" onClick={() => patch({ format: 'phone' })}><Smartphone size={20} /><span><strong>Phone</strong><small>1080 × 1920</small></span>{project.format === 'phone' && <Check size={16} className="selected-check" />}</button>
              <button className={`format-option ${project.format === 'desktop' ? 'selected' : ''}`} type="button" onClick={() => patch({ format: 'desktop' })}><Laptop size={21} /><span><strong>Desktop</strong><small>1920 × 1080</small></span>{project.format === 'desktop' && <Check size={16} className="selected-check" />}</button>
            </div>
            <div className="theme-label"><span className="label-title">VISUAL MOOD</span><span className="subtle-text">Choose your atmosphere</span></div>
            <div className="themes" role="group" aria-label="Theme">
              {THEME_OPTIONS.map(theme => <button key={theme.id} type="button" className={`theme-card ${project.theme === theme.id ? 'selected' : ''}`} onClick={() => patch({ theme: theme.id })}>
                <div className="theme-sample" style={{ background: `linear-gradient(130deg, ${theme.swatches[0]}, ${theme.swatches[0]} 43%, ${theme.swatches[2]} 145%)` }}><span style={{ color: theme.swatches[1] }}>28<span className="sample-days"> DAYS</span></span><div className="sample-rings" style={{ borderColor: `${theme.swatches[1]}66` }} /></div>
                <strong>{theme.name}</strong><small>{theme.desc}</small>{project.theme === theme.id && <span className="theme-check"><Check size={12} /></span>}
              </button>)}
            </div>

            <div className="hairline" />
            <div className="panel-title subsection"><div><span className="step-chip">03</span><h2>Plan the journey</h2></div><span className="section-aside">Up to five milestones</span></div>
            <p className="section-description">Generate an action plan with Google Gemini or create one manually. You can edit every step.</p>
            <div className="action-row">
              <button className="button-ai" type="button" disabled={generating} onClick={generateMilestones}>{generating ? <RefreshCw size={18} className="spin" /> : <WandSparkles size={18} />}{generating ? 'Generating your plan…' : 'Generate with Gemini'}<ArrowRight size={17} /></button>
              <button type="button" className="button-muted" onClick={useStarterPlan}><RefreshCw size={16} /> Starter plan</button>
            </div>
            <div className="milestones">
              {project.milestones.map((milestone, i) => (
                <div className="milestone-edit" key={milestone.id}>
                  <span className="milestone-number">{String(i + 1).padStart(2, '0')}</span>
                  <input aria-label={`Milestone ${i + 1} title`} maxLength={60} value={milestone.title} onChange={e => updateMilestone(milestone.id, { title: e.target.value })} placeholder="A small, achievable step" />
                  <input aria-label={`Milestone ${i + 1} date`} type="date" min={localISO(now)} max={project.deadline} value={milestone.date} onChange={e => updateMilestone(milestone.id, { date: e.target.value })} />
                  <button type="button" className="icon-button" onClick={() => patch({ milestones: project.milestones.filter(m => m.id !== milestone.id) })} title="Remove milestone" aria-label={`Remove milestone ${i + 1}`}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            {project.milestones.length < 5 && <button type="button" className="add-step" onClick={() => patch({ milestones: [...project.milestones, { id: `manual-${Date.now()}`, title: 'My next milestone', date: project.deadline }] })}><Plus size={16} /> Add a milestone</button>}
            <div className={`status ${message.type}`} role="status">{message.type === 'success' ? <CheckCircle2 size={17} /> : message.type === 'error' ? <ShieldCheck size={17} /> : <ShieldCheck size={17} />}<span>{message.text}</span></div>
          </section>

          <section className="preview-area" aria-label="Wallpaper preview">
            <div className="preview-heading"><div><div className="eyebrow mini"><span className="live-dot" /> LIVE PREVIEW</div><h2>Your future, in focus.</h2></div><div className="size-pill"><LayoutGrid size={13} /> {DIMENSIONS[project.format].label}</div></div>
            <div className={`preview-stage ${project.format}`}>
              <div className={`preview-device ${project.format}`}><canvas ref={canvasRef} aria-label="Preview of your countdown wallpaper" /></div>
              <div className="stage-footnote"><MoonStar size={14} /> Clock-safe layout · High resolution</div>
            </div>
            <div className="countdown-summary"><div className="summary-icon"><Clock3 size={19} /></div><div><strong>{remaining} {remaining === 1 ? 'day' : 'days'} until launch</strong><span>Target: {prettyDate(project.deadline, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span></div><div className="summary-glow"><Rocket size={22} /></div></div>
            <div className="download-actions"><button type="button" className="download-primary" onClick={downloadWallpaper}><ArrowDownToLine size={19} /> Download wallpaper <ArrowRight size={17} /></button><button type="button" className="download-secondary" onClick={downloadCover}><Image size={18} /> Export cover</button></div>
            <div className="export-note"><ShieldCheck size={15} /><span>Exports as a real PNG file. Re-export to refresh the countdown on a future day.</span></div>
          </section>
        </div>
      </main>
      <footer className="footer wrap"><span>✦ AGENTLAUNCH</span><span>Built for meaningful deadlines · Powered by Gemini when configured</span><span>2026</span></footer>
    </div>
  );
}
