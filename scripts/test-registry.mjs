// The tool registry, checked: every tool is complete and unique, the families
// agree with the order, and every trainer can be reached from a goal on the
// brochure's "Where do you want to start?".
//
//   node scripts/test-registry.mjs
import { TOOLS, TOOL_GROUPS, START_PATHS, toolByKey } from '../src/tools.js';

let failures = 0, assertions = 0;
const check = (name, fn) => { try { fn(); console.log(`  ✓ ${name}`); } catch (e) { failures++; console.log(`  ✗ ${name}\n      ${e.message}`); } };
const ok = (cond, msg) => { assertions++; if (!cond) throw new Error(msg); };
const unique = (list, what) => { const seen = new Set(); for (const v of list) { ok(!seen.has(v), `duplicate ${what}: ${v}`); seen.add(v); } };

console.log('\nTools');
check('every tool has every field', () => {
  for (const t of TOOLS) {
    for (const f of ['key', 'storage', 'group', 'name', 'emoji', 'accent', 'path', 'skill', 'blurb']) ok(typeof t[f] === 'string' && t[f].length > 0, `${t.key || '?'}: missing ${f}`);
    ok(/ Trainer$/.test(t.name), `${t.key}: "${t.name}" — names are "… Trainer"`);
    ok(/^#[0-9a-f]{6}$/i.test(t.accent), `${t.key}: accent ${t.accent}`);
    ok(/^\/[a-z-]+\/$/.test(t.path), `${t.key}: path ${t.path}`);
    ok(/^[a-z]+_$/.test(t.storage), `${t.key}: storage prefix ${t.storage}`);
    ok(Array.isArray(t.chips) && t.chips.length === 3, `${t.key}: ${t.chips?.length} chips — the cards show three`);
  }
});
check('keys, paths, names and storage prefixes are unique', () => {
  for (const f of ['key', 'path', 'name', 'storage']) unique(TOOLS.map(t => t[f]), f);
});

console.log('\nFamilies');
check('every tool is in a known family, and every family has a tool', () => {
  const keys = TOOL_GROUPS.map(g => g.key);
  unique(keys, 'family');
  for (const t of TOOLS) ok(keys.includes(t.group), `${t.key}: unknown family ${t.group}`);
  for (const g of TOOL_GROUPS) ok(TOOLS.some(t => t.group === g.key), `family ${g.key} is empty`);
});
check('TOOLS keeps each family together, in family order (the drawer is one flat list)', () => {
  const idx = TOOLS.map(t => TOOL_GROUPS.findIndex(g => g.key === t.group));
  for (let i = 1; i < idx.length; i++) ok(idx[i] >= idx[i - 1], `${TOOLS[i].key} (${TOOLS[i].group}) comes after ${TOOLS[i - 1].key} (${TOOLS[i - 1].group})`);
});

console.log('\nWhere to start');
check('every goal is well formed', () => {
  unique(START_PATHS.map(p => p.key), 'goal key');
  unique(START_PATHS.map(p => p.label), 'goal label');
  for (const p of START_PATHS) {
    ok(p.label && p.title, `${p.key}: needs a label and a title`);
    ok(p.steps.length >= 2 && p.steps.length <= 4, `${p.key}: ${p.steps.length} steps — a path is two to four trainers`);
    unique(p.steps.map(s => s.key), `step in ${p.key}`);
    for (const s of [...p.steps, ...(p.or ? [p.or] : [])]) {
      ok(toolByKey(s.key), `${p.key}: no tool ${s.key}`);
      ok(typeof s.why === 'string' && s.why.length > 10, `${p.key} → ${s.key}: needs a reason`);
    }
    if (p.or) ok(!p.steps.some(s => s.key === p.or.key), `${p.key}: ${p.or.key} is both a step and the alternative`);
  }
});
check('every trainer is on at least one path', () => {
  const reached = new Set(START_PATHS.flatMap(p => [...p.steps.map(s => s.key), ...(p.or ? [p.or.key] : [])]));
  for (const t of TOOLS) ok(reached.has(t.key), `${t.name} is on no path — no goal leads to it`);
});

console.log(failures ? `\n${failures} check(s) FAILED (${assertions} assertions)` : `\nAll registry checks passed. ${assertions} assertions.`);
process.exit(failures ? 1 : 0);
