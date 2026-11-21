// Vice City Trophy Atlas — checklist, tracker, filters, spoiler mode,
// export/import and the roadmap view. All data comes from
// data/trophies.json; progress lives only in localStorage.
import { trophyMatchesFilters, spoilerSafeName, spoilerSafeDescription, countEarnedByGrade } from './filters.js';
import { buildRoadmap, buildMissableList } from './roadmap.js';

const STORAGE_KEY = 'vice-city-trophy-atlas-progress-v1';
const SPOILER_KEY = 'vice-city-trophy-atlas-spoiler-v1';

const trophyList = document.getElementById('trophyList');
const missableList = document.getElementById('missableList');
const listCount = document.getElementById('listCount');
const emptyNote = document.getElementById('emptyNote');
const statusLine = document.getElementById('statusLine');
const searchInput = document.getElementById('search');
const kindFilter = document.getElementById('kindFilter');
const gradeFilter = document.getElementById('gradeFilter');
const hideEarned = document.getElementById('hideEarned');
const spoilerToggle = document.getElementById('spoilerToggle');
const detailCard = document.getElementById('detailCard');
const detailEmpty = document.getElementById('detailEmpty');

const response = await fetch('data/trophies.json');
const doc = await response.json();
const trophies = doc.trophies;
const sourceUrls = new Map((doc.sources ?? []).map((s) => [s.name, s.url]));

let earned = loadEarned();
let selectedName = null;
let currentView = 'checklist';

function loadEarned() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return new Set(Array.isArray(saved) ? saved.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

function currentFilters() {
  return {
    kind: kindFilter.value,
    grade: gradeFilter.value,
    hideEarned: hideEarned.checked,
    search: searchInput.value.trim(),
  };
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  return kind === 'platinum' ? 'Platinum' : kind.charAt(0).toUpperCase() + kind.slice(1);
}

function makeTrophyItem(trophy) {
  const isEarned = earned.has(trophy.name);
  const spoilerOn = spoilerToggle.checked;
  const item = document.createElement('li');
  item.className = 'trophy-item' + (isEarned ? ' earned' : '') + (selectedName === trophy.name ? ' selected' : '');
  item.dataset.name = trophy.name;

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned;
  box.setAttribute('aria-label', `Mark ${trophy.name} earned`);
  box.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleEarned(trophy.name);
  });

  const body = document.createElement('div');
  const name = document.createElement('p');
  name.className = 'trophy-name';
  name.textContent = spoilerSafeName(trophy, spoilerOn, isEarned);
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = spoilerSafeDescription(trophy, spoilerOn, isEarned);
  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  const gradeTag = document.createElement('span');
  gradeTag.className = `tag grade-${trophy.grade}`;
  gradeTag.textContent = gradeLabel(trophy.grade);
  tags.append(gradeTag);
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = kindLabel(trophy.kind);
  tags.append(kindTag);
  if (trophy.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag missable';
    missTag.textContent = 'Missable';
    tags.append(missTag);
  }
  if (spoilerOn && trophy.kind === 'story' && !isEarned) {
    const spoilTag = document.createElement('span');
    spoilTag.className = 'tag spoiler-hidden';
    spoilTag.textContent = 'Spoiler hidden';
    tags.append(spoilTag);
  }
  body.append(name, desc, tags);

  const count = document.createElement('span');
  count.className = 'tag';
  count.textContent = isEarned ? 'Earned' : 'Not earned';

  item.append(box, body, count);
  item.addEventListener('click', () => selectTrophy(trophy.name));
  return item;
}

function renderList() {
  const filters = currentFilters();
  const visible = trophies.filter((t) => trophyMatchesFilters(t, filters, earned));
  trophyList.replaceChildren(...visible.map(makeTrophyItem));
  listCount.textContent = `Showing ${visible.length} of ${trophies.length} trophies` +
    (filters.kind === 'online' ? ' — the official list holds no online trophies.' : '');
  emptyNote.hidden = visible.length > 0;
  renderProgress();
}

function renderProgress() {
  const byGrade = countEarnedByGrade(trophies, earned);
  const total = trophies.length;
  document.getElementById('progressCount').textContent = `${earned.size} / ${total}`;
  document.getElementById('progressPercent').textContent = `${Math.round((earned.size / total) * 100)}%`;
  document.getElementById('progressFill').style.width = `${(earned.size / total) * 100}%`;
  document.getElementById('progressGrades').textContent =
    `Platinum ${byGrade.platinum}/1 · Gold ${byGrade.gold}/2 · Silver ${byGrade.silver}/6 · Bronze ${byGrade.bronze}/46`;
}

function renderRoadmap() {
  const stages = buildRoadmap(trophies);
  const container = document.getElementById('roadmapStages');
  container.replaceChildren();
  for (const stage of stages) {
    const section = document.createElement('section');
    section.className = 'roadmap-stage';
    const heading = document.createElement('h3');
    heading.textContent = stage.title;
    const advice = document.createElement('p');
    advice.textContent = stage.advice;
    const list = document.createElement('ul');
    list.className = 'trophy-list';
    for (const trophy of stage.trophies) list.append(makeTrophyItem(trophy));
    const summary = document.createElement('p');
    const done = stage.trophies.filter((t) => earned.has(t.name)).length;
    summary.textContent = `${done} of ${stage.trophies.length} earned in this stage.`;
    section.append(heading, advice, list, summary);
    container.append(section);
  }
}

function renderMissable() {
  const flagged = buildMissableList(trophies);
  missableList.replaceChildren(...flagged.map(makeTrophyItem));
}

function selectTrophy(name) {
  selectedName = name;
  const trophy = trophies.find((t) => t.name === name);
  if (!trophy) return;
  const isEarned = earned.has(name);
  const spoilerOn = spoilerToggle.checked;
  detailEmpty.hidden = true;
  detailCard.hidden = false;
  const gradeEl = document.getElementById('detailGrade');
  gradeEl.textContent = `${gradeLabel(trophy.grade)} trophy`;
  gradeEl.className = `detail-grade grade-${trophy.grade}`;
  document.getElementById('detailName').textContent = spoilerSafeName(trophy, spoilerOn, isEarned);
  document.getElementById('detailDescription').textContent = spoilerSafeDescription(trophy, spoilerOn, isEarned);
  document.getElementById('detailMeta').textContent =
    `Kind: ${kindLabel(trophy.kind)} · ${trophy.missable ? 'Missable — do it on the first pass' : 'Not missable'} · Roadmap stage ${trophy.roadmapStage} · ${isEarned ? 'Earned' : 'Not earned yet'}`;
  document.getElementById('detailGuide').textContent = trophy.guide;
  const sourcesEl = document.getElementById('detailSources');
  sourcesEl.replaceChildren();
  for (const sourceName of trophy.sources ?? []) {
    const li = document.createElement('li');
    const url = sourceUrls.get(sourceName);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.textContent = sourceName;
      link.rel = 'noopener';
      li.append(link);
    } else {
      li.textContent = sourceName;
    }
    sourcesEl.append(li);
  }
  const toggle = document.getElementById('detailToggle');
  toggle.textContent = isEarned ? 'Mark not earned' : 'Mark earned';
  toggle.classList.toggle('earned', isEarned);
  toggle.onclick = () => toggleEarned(name);
  renderList();
}

function toggleEarned(name) {
  if (earned.has(name)) earned.delete(name);
  else earned.add(name);
  saveEarned();
  if (selectedName === name) selectTrophy(name);
  else {
    renderList();
    renderRoadmap();
    renderMissable();
  }
}

function setView(view) {
  currentView = view;
  document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.view === view));
  document.querySelector('.layout').hidden = view !== 'checklist';
  document.getElementById('toolbar').hidden = view !== 'checklist';
  document.getElementById('roadmapPane').hidden = view !== 'roadmap';
  document.getElementById('missablePane').hidden = view !== 'missable';
  if (view === 'roadmap') renderRoadmap();
  if (view === 'missable') renderMissable();
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => setView(tab.dataset.view));
});

searchInput.addEventListener('input', renderList);
kindFilter.addEventListener('change', renderList);
gradeFilter.addEventListener('change', renderList);
hideEarned.addEventListener('change', renderList);
spoilerToggle.addEventListener('change', () => {
  localStorage.setItem(SPOILER_KEY, JSON.stringify(spoilerToggle.checked));
  renderList();
  if (selectedName) selectTrophy(selectedName);
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = {
    app: 'Vice City Trophy Atlas',
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
  statusLine.textContent = `Exported ${earned.size} earned trophies to gta6-trophy-progress.json.`;
});

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    const names = Array.isArray(imported) ? imported : imported.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const known = new Set(trophies.map((t) => t.name));
    const valid = names.filter((n) => known.has(n));
    earned = new Set(valid);
    saveEarned();
    renderList();
    renderRoadmap();
    renderMissable();
    if (selectedName) selectTrophy(selectedName);
    statusLine.textContent = `Imported ${valid.length} earned trophies from ${file.name} (${names.length - valid.length} unknown names skipped).`;
  } catch {
    statusLine.textContent = 'Import failed: that file is not a valid trophy-progress export.';
  }
  event.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!window.confirm('Clear all earned trophies? This cannot be undone. Export first if you want a backup.')) return;
  earned = new Set();
  saveEarned();
  renderList();
  renderRoadmap();
  renderMissable();
  statusLine.textContent = 'Progress reset. 0 of 55 earned.';
});

try {
  spoilerToggle.checked = JSON.parse(localStorage.getItem(SPOILER_KEY) ?? 'false') === true;
} catch {
  spoilerToggle.checked = false;
}
renderList();
renderMissable();
