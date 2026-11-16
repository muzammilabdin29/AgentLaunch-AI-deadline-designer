import { daysRemaining, localISO, prettyDate } from './dates.js';

export const DIMENSIONS = {
  phone: { width: 1080, height: 1920, label: '1080 × 1920' },
  desktop: { width: 1920, height: 1080, label: '1920 × 1080' }
};

const THEMES = {
  mission: {
    bg: '#070c1b', deep: '#162948', surface: '#17233a',
    primary: '#c5fff0', secondary: '#8c93ff', text: '#f6f9ff', muted: '#a0acc5', line: '#32405a'
  },
  aurora: {
    bg: '#0c1224', deep: '#0b4555', surface: '#153642',
    primary: '#a2ffe0', secondary: '#f7c4fa', text: '#fffdfb', muted: '#b9d6da', line: '#3d5a68'
  },
  minimal: {
    bg: '#181a1e', deep: '#2b2c30', surface: '#292d33',
    primary: '#ffdf9f', secondary: '#ffb1a0', text: '#f8f4eb', muted: '#bcb5ad', line: '#4a4847'
  }
};

function roundRect(ctx, x, y, w, h, radius) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fillRound(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width = 2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function fitText(ctx, text, maxWidth, max = 48, min = 21, weight = 700) {
  const value = String(text || '').trim();
  for (let size = max; size >= min; size--) {
    ctx.font = `${weight} ${size}px Arial, sans-serif`;
    if (ctx.measureText(value).width <= maxWidth) return { text: value, size };
  }
  ctx.font = `${weight} ${min}px Arial, sans-serif`;
  let clipped = value;
  while (clipped.length > 1 && ctx.measureText(clipped + '…').width > maxWidth) clipped = clipped.slice(0, -1);
  return { text: clipped + '…', size: min };
}

function label(ctx, text, x, y, color, size = 24, weight = 600, tracking = 0) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Arial, sans-serif`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${tracking}px`;
  ctx.fillText(String(text), x, y);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}

function seeded(i) {
  const v = Math.sin(i * 127.1 + 89.3) * 43758.5453;
  return v - Math.floor(v);
}

function background(ctx, w, h, theme, variant) {
  const g = ctx.createLinearGradient(0, 0, w * 0.88, h);
  g.addColorStop(0, theme.bg);
  g.addColorStop(0.55, theme.deep);
  g.addColorStop(1, theme.bg);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Atmospheric glow, no external image assets or unreliable cross-origin dependencies.
  const glow = ctx.createRadialGradient(w * .85, h * .14, 12, w * .85, h * .14, w * .76);
  glow.addColorStop(0, `${theme.secondary}45`);
  glow.addColorStop(.4, `${theme.primary}10`);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  if (variant !== 'minimal') {
    for (let i = 0; i < 135; i++) {
      const x = seeded(i * 2 + 1) * w;
      const y = seeded(i * 2 + 2) * h;
      ctx.globalAlpha = .06 + seeded(i + 515) * .22;
      ctx.fillStyle = theme.text;
      ctx.beginPath();
      ctx.arc(x, y, 0.7 + seeded(i + 100) * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.ellipse(w * .76, h * .24, w * .33, w * .33, -.28, 0, Math.PI * 2);
    ctx.strokeStyle = `${theme.primary}19`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(w * .76, h * .24, w * .26, w * .26, -.28, 0, Math.PI * 2);
    ctx.strokeStyle = `${theme.secondary}16`;
    ctx.stroke();
  }
}

function drawMark(ctx, x, y, size, theme) {
  fillRound(ctx, x, y, size, size, size * .27, `${theme.primary}1d`);
  label(ctx, 'A', x + size * .23, y + size * .75, theme.primary, size * .64, 800);
  ctx.fillStyle = theme.secondary;
  ctx.beginPath();
  ctx.arc(x + size * .79, y + size * .22, size * .11, 0, Math.PI * 2);
  ctx.fill();
}

function drawMilestone(ctx, item, index, x, y, w, h, theme, nowISO) {
  fillRound(ctx, x, y, w, h, 24, `${theme.surface}e8`);
  roundRect(ctx, x, y, w, h, 24);
  ctx.strokeStyle = `${theme.line}99`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const done = item.date < nowISO;
  fillRound(ctx, x + 20, y + 19, h - 38, h - 38, 16, done ? `${theme.primary}36` : `${theme.secondary}26`);
  label(ctx, done ? '✓' : String(index + 1).padStart(2, '0'), x + 45, y + h * .64, done ? theme.primary : theme.secondary, h * .23, 700);
  const fitted = fitText(ctx, item.title, w - 215, 32, 24, 700);
  label(ctx, fitted.text, x + h + 14, y + h * .44, theme.text, fitted.size, 700);
  label(ctx, prettyDate(item.date, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(), x + h + 14, y + h * .74, theme.muted, 22, 600, 1.5);
}

function phone(ctx, project, theme, now) {
  const today = localISO(now);
  drawMark(ctx, 76, 470, 72, theme);
  label(ctx, 'A G E N T L A U N C H', 170, 519, theme.primary, 26, 700);
  line(ctx, 76, 562, 1004, 562, `${theme.line}bb`);
  label(ctx, 'THE NEXT BIG MOVE', 76, 639, theme.muted, 25, 700, 3);
  const title = fitText(ctx, project.goal || 'Your next big move', 934, 72, 38, 800);
  label(ctx, title.text, 76, 721, theme.text, title.size, 800);
  label(ctx, 'THE CLOCK IS TICKING. MAKE IT COUNT.', 77, 778, theme.muted, 23, 500, 1.3);

  const remain = daysRemaining(project.deadline, now);
  const digitSize = String(remain).length > 2 ? 208 : 240;
  label(ctx, remain, 64, 1028, theme.primary, digitSize, 800);
  const digitsWidth = ctx.measureText(String(remain)).width;
  label(ctx, remain === 1 ? 'DAY LEFT' : 'DAYS LEFT', Math.min(650, 88 + digitsWidth), 972, theme.text, 43, 800);
  label(ctx, `DEADLINE  ${prettyDate(project.deadline, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}`, Math.min(650, 88 + digitsWidth), 1016, theme.muted, 23, 600);
  line(ctx, 76, 1061, 1004, 1061, `${theme.line}bb`);
  label(ctx, 'YOUR FLIGHT PLAN', 76, 1110, theme.primary, 25, 700, 2.5);
  const list = (project.milestones || []).slice(0, 5).sort((a, b) => a.date.localeCompare(b.date));
  const startY = 1137;
  list.forEach((item, i) => drawMilestone(ctx, item, i, 76, startY + i * 131, 928, 118, theme, today));
  label(ctx, 'DESIGNED FOR YOUR DEADLINE', 77, 1870, theme.muted, 21, 600, 2);
  label(ctx, '✦', 967, 1874, theme.primary, 34, 700);
}

function desktop(ctx, project, theme, now) {
  const today = localISO(now);
  drawMark(ctx, 98, 94, 76, theme);
  label(ctx, 'A G E N T L A U N C H', 196, 149, theme.primary, 27, 700);
  line(ctx, 99, 210, 1818, 210, `${theme.line}bf`);
  label(ctx, 'MAKE THE DEADLINE BEAUTIFUL', 100, 286, theme.muted, 30, 700, 2);
  const title = fitText(ctx, project.goal || 'Your next big move', 930, 72, 36, 800);
  label(ctx, title.text, 99, 390, theme.text, title.size, 800);
  const remain = daysRemaining(project.deadline, now);
  label(ctx, remain, 86, 730, theme.primary, 290, 800);
  label(ctx, remain === 1 ? 'DAY TO GO' : 'DAYS TO GO', 105, 811, theme.text, 43, 800, 2);
  label(ctx, `DEADLINE  ${prettyDate(project.deadline, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}`, 105, 880, theme.muted, 29, 600);
  line(ctx, 1000, 266, 1000, 925, `${theme.line}cc`);
  label(ctx, 'YOUR FLIGHT PLAN', 1065, 287, theme.primary, 28, 700, 2);
  const list = (project.milestones || []).slice(0, 5).sort((a, b) => a.date.localeCompare(b.date));
  list.forEach((item, i) => drawMilestone(ctx, item, i, 1060, 325 + i * 125, 764, 110, theme, today));
  line(ctx, 100, 957, 1820, 957, `${theme.line}bb`);
  label(ctx, 'BUILD SOMETHING THAT MATTERS', 105, 1013, theme.muted, 22, 700, 3);
  label(ctx, 'YOUR GOAL. YOUR TIMELINE.', 1450, 1013, theme.muted, 20, 600, 1);
}

export function drawWallpaper(canvas, project, now = new Date()) {
  const d = DIMENSIONS[project.format] || DIMENSIONS.phone;
  canvas.width = d.width;
  canvas.height = d.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const theme = THEMES[project.theme] || THEMES.mission;
  background(ctx, d.width, d.height, theme, project.theme);
  if (project.format === 'desktop') desktop(ctx, project, theme, now);
  else phone(ctx, project, theme, now);
}

export function drawCover(canvas, project, now = new Date()) {
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  const theme = THEMES[project.theme] || THEMES.mission;
  background(ctx, 1200, 630, theme, project.theme);
  drawMark(ctx, 74, 84, 78, theme);
  label(ctx, 'AGENTLAUNCH', 74, 227, theme.text, 76, 800);
  label(ctx, 'MAKE THE DEADLINE', 77, 291, theme.primary, 37, 700, 1.3);
  label(ctx, 'BEAUTIFUL.', 77, 337, theme.primary, 37, 700, 1.3);
  label(ctx, 'AI milestone planning', 80, 419, theme.muted, 28, 500);
  label(ctx, 'Countdown lock screens', 80, 454, theme.muted, 28, 500);
  fillRound(ctx, 75, 525, 408, 54, 16, `${theme.primary}21`);
  label(ctx, 'POWERED BY GOOGLE GEMINI', 99, 559, theme.primary, 20, 700, 1);
  const offscreen = document.createElement('canvas');
  drawWallpaper(offscreen, { ...project, format: 'phone' }, now);
  ctx.save();
  ctx.shadowColor = '#000000cc';
  ctx.shadowBlur = 44;
  fillRound(ctx, 752, 20, 372, 664, 48, '#080b15');
  ctx.restore();
  ctx.save();
  roundRect(ctx, 763, 28, 350, 654, 38);
  ctx.clip();
  ctx.drawImage(offscreen, 763, 28, 350, 654);
  ctx.restore();
}
