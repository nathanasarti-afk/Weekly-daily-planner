// Render the planner page and print every block on the week grid as JSON,
// with real dates, so each one can be written to Google Calendar.
// Usage: node extract_blocks.js <planner.html> <monday YYYY-MM-DD>
const { chromium } = require('playwright');
const path = require('path');

// Map the short gym names used in block labels to calendar locations (edit for your gyms).
const LOCATIONS = { 'Gym 1': 'Gym 1', 'Gym 2': 'Gym 2' };
const TEAM_A_LOCATION = 'Team A home gym';

function pad(n) { return String(n).padStart(2, '0'); }
function stamp(date, mins) { return date + 'T' + pad(Math.floor(mins / 60)) + ':' + pad(mins % 60) + ':00'; }
function addDays(iso, n) {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

(async () => {
  const [file, monday] = process.argv.slice(2);
  if (!file || !/^\d{4}-\d{2}-\d{2}$/.test(monday || '')) {
    console.error('Usage: node extract_blocks.js <planner.html> <monday YYYY-MM-DD>');
    process.exit(2);
  }
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + path.resolve(file));
  const raw = await page.$$eval('.daycol .block', els => els.map(e => ({
    kind: e.dataset.kind, day: +e.dataset.day, start: +e.dataset.start, end: +e.dataset.end,
    label: e.querySelector('b').textContent
  })));
  await browser.close();
  if (errors.length) { console.error('Page errors:', errors); process.exit(1); }

  const out = raw.map(b => {
    const date = addDays(monday, b.day);
    const m = /\(([^)]+)\)\s*$/.exec(b.label);
    let location = '';
    if (b.kind === 'varsity') location = TEAM_A_LOCATION;
    else if (m && LOCATIONS[m[1]]) location = LOCATIONS[m[1]];
    let group = 'planned';
    if (b.kind === 'varsity') group = 'varsity';
    else if (b.kind === 'storm') group = 'storm';
    else if (b.kind === 'fixed' && /^Training/.test(b.label)) group = 'training';
    else if (b.kind === 'fixed') group = 'other-fixed';
    return { group, kind: b.kind, label: b.label, date, startTime: stamp(date, b.start), endTime: stamp(date, b.end), location };
  });
  for (let d = 0; d < 7; d++) {
    const date = addDays(monday, d);
    out.push({ group: 'lightsout', kind: 'lightsout', label: 'Lights out', date, startTime: date + 'T23:00:00', endTime: date + 'T23:15:00', location: '' });
  }
  out.sort((a, b) => a.startTime.localeCompare(b.startTime));
  console.log(JSON.stringify(out, null, 2));
})();
