import test from 'node:test';
import assert from 'node:assert/strict';
import { addDaysISO, dateFromISO, daysRemaining } from '../src/utils/dates.js';
import { cleanMilestones, starterMilestones } from '../src/utils/milestones.js';

test('invalid dates are rejected', () => {
  assert.equal(dateFromISO('2026-02-30'), null);
  assert.equal(dateFromISO('not a date'), null);
});

test('calendar countdown is zero on deadline day', () => {
  assert.equal(daysRemaining('2026-11-23', new Date(2026, 10, 23, 8, 0)), 0);
  assert.equal(daysRemaining('2026-11-23', new Date(2026, 10, 20)), 3);
});

test('milestones are valid, ordered, and capped', () => {
  const milestones = starterMilestones('2026-12-15', '2026-11-16');
  assert.equal(milestones.length, 5);
  assert.equal(milestones.at(-1).date, '2026-12-15');
  assert.deepEqual(cleanMilestones(milestones).map(x => x.date), milestones.map(x => x.date));
  assert.equal(cleanMilestones([...milestones, ...milestones]).length, 5);
});

test('date addition spans month boundaries', () => {
  assert.equal(addDaysISO('2026-11-30', 1), '2026-12-01');
});
