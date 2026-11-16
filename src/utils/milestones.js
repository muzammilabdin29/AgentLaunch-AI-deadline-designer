import { addDaysISO, dateFromISO, localISO } from './dates.js';

export const MAX_MILESTONES = 5;

export function starterMilestones(deadline, today = localISO()) {
  const start = dateFromISO(today);
  const finish = dateFromISO(deadline);
  const total = start && finish ? Math.max(0, Math.round((Date.UTC(finish.getFullYear(), finish.getMonth(), finish.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86400000)) : 29;
  const steps = [
    'Define the goal & success criteria',
    'Plan the steps and resources',
    'Build the first working version',
    'Test, improve and polish',
    'Launch and celebrate'
  ];
  return steps.map((title, i) => ({
    id: `starter-${i}`,
    title,
    date: addDaysISO(today, Math.round(total * ([0.12, 0.33, 0.59, 0.82, 1][i])))
  }));
}

export function cleanMilestones(milestones) {
  return (Array.isArray(milestones) ? milestones : [])
    .slice(0, MAX_MILESTONES)
    .map((item, i) => ({
      id: typeof item.id === 'string' ? item.id : `item-${i}`,
      title: String(item.title ?? '').slice(0, 60),
      date: dateFromISO(item.date) ? item.date : localISO()
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
