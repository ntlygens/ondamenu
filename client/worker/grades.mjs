// NYC restaurant health grades, refreshed every morning from the city's open data
// (NYC Health Dept inspection results, dataset 43nn-pn8j).
//
// Cron fires hourly 09:00-14:00 UTC, which covers 5am New York in both EDT and EST.
// The job only does work between 5am and 9am New York time, once per New York day:
//   - at 5am it reads the dataset's own "last refreshed" stamp; if the city has published
//     new data since our last run, it updates the grades and is done for the day;
//   - if not, it tries again the next hour, and at 9am it takes whatever is there.
// Only real published letters (A, B, C) are stored. Anything else leaves the grade empty,
// which the app shows as "not yet graded". A grade is never guessed.

const DATASET = '43nn-pn8j';
const RESOURCE = `https://data.cityofnewyork.us/resource/${DATASET}.json`;
const META = `https://data.cityofnewyork.us/api/views/${DATASET}.json`;
const LETTERS = new Set(['A', 'B', 'C']);

export function newYorkNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t).value;
  return { day: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) };
}

async function getState(db, key) {
  const r = await db.prepare('SELECT value FROM job_state WHERE key = ?').bind(key).first();
  return r ? r.value : null;
}
async function setState(db, key, value) {
  await db.prepare('INSERT INTO job_state (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .bind(key, String(value)).run();
}

// Pick the newest letter grade per CAMIS from dataset rows.
export function latestGrades(rows) {
  const best = new Map();
  for (const r of rows) {
    const grade = String(r.grade ?? '').toUpperCase();
    if (!r.camis || !LETTERS.has(grade) || !r.grade_date) continue;
    const cur = best.get(r.camis);
    if (!cur || r.grade_date > cur.date) best.set(r.camis, { grade, date: r.grade_date });
  }
  return best;
}

export async function updateGrades(env, { fetchFn = fetch, now = Date.now() } = {}) {
  const db = env.APP_DB;
  const { results } = await db.prepare(
    "SELECT id, camis FROM restaurants WHERE camis IS NOT NULL AND camis <> ''").all();
  if (!results.length) return { checked: 0, updated: 0 };
  const ids = results.map((r) => r.camis).filter((c) => /^\d{6,10}$/.test(c));
  const where = `camis in (${ids.map((c) => `'${c}'`).join(',')}) AND grade IS NOT NULL`;
  const url = `${RESOURCE}?$select=camis,grade,grade_date&$where=${encodeURIComponent(where)}&$order=grade_date DESC&$limit=50000`;
  const res = await fetchFn(url.replace(/ /g, '%20'), { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`NYC data answered ${res.status}`);
  const best = latestGrades(await res.json());
  const stamp = Math.floor(now / 1000);
  let updated = 0;
  for (const r of results) {
    const g = best.get(r.camis);
    await db.prepare('UPDATE restaurants SET grade = ?, grade_date = ?, grade_checked = ? WHERE id = ?')
      .bind(g ? g.grade : null, g ? g.date.slice(0, 10) : null, stamp, r.id).run();
    if (g) updated++;
  }
  return { checked: results.length, updated };
}

export async function runGradeJob(env, { fetchFn = fetch, date = new Date(), force = false } = {}) {
  const { day, hour } = newYorkNow(date);
  if (!force && (hour < 5 || hour > 9)) return { skipped: 'outside the 5am-9am window' };
  if (!force && (await getState(env.APP_DB, 'grades_done_day')) === day) return { skipped: 'already done today' };

  let refreshed = '';
  try {
    const meta = await (await fetchFn(META)).json();
    refreshed = String(meta.rowsUpdatedAt ?? '');
  } catch { /* fall through: treat as unknown */ }
  const last = await getState(env.APP_DB, 'grades_source_stamp');
  const fresh = refreshed && refreshed !== last;
  if (!force && !fresh && hour < 9) return { skipped: 'city data not refreshed yet, will retry' };

  const out = await updateGrades(env, { fetchFn, now: date.getTime() });
  if (refreshed) await setState(env.APP_DB, 'grades_source_stamp', refreshed);
  await setState(env.APP_DB, 'grades_done_day', day);
  return { ...out, refreshed: Boolean(fresh) };
}
