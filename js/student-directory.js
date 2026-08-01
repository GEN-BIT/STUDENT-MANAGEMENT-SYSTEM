/* student-directory.js — read-only browse view for the Student role */

Auth.guard(['admin', 'student']);
Auth.mountBadge();

const name = Auth.userName();
if(name){
  document.getElementById('pageHeading').textContent = 'Welcome, ' + name;
}

/* If the entered name matches an existing student record, surface a
   quick shortcut to their own profile and highlight their row below. */
const meRecord = name
  ? Store.all().find(s => s.name.toLowerCase() === name.toLowerCase())
  : null;

if(meRecord){
  document.getElementById('meCard').innerHTML = `
    <div class="view-only-note" style="background:var(--parchment); border-color:var(--brass); color:var(--brass-dark);">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>
      That's you, ${escapeHtml(meRecord.name)} —
      <a href="student-details.html?id=${meRecord.id}" style="color:var(--brass-dark); font-weight:700; text-decoration:underline; margin-left:4px;">view your profile</a>
    </div>
  `;
}

const searchInput  = document.getElementById('searchInput');
const courseFilter = document.getElementById('courseFilter');
const yearFilter    = document.getElementById('yearFilter');
const tableBody     = document.getElementById('tableBody');
const emptyState    = document.getElementById('emptyState');
const countPill     = document.getElementById('countPill');

function renderStats(){
  const list = Store.all();
  const cards = [
    { label: 'Total Students', value: list.length, accent: 'var(--brass)' },
    { label: 'Courses Offered', value: Store.courses().length, accent: 'var(--forest)' },
    { label: 'Year Groups', value: Store.years().length, accent: '#3B5578' },
  ];
  document.getElementById('statGrid').innerHTML = cards.map(c => `
    <div class="stat-card" style="--stat-accent:${c.accent}">
      <div class="stat-label">${c.label}</div>
      <div class="stat-value">${c.value}</div>
    </div>
  `).join('');
}

function populateFilterOptions(){
  courseFilter.innerHTML = '<option value="">All courses</option>' +
    Store.courses().map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  yearFilter.innerHTML = '<option value="">All years</option>' +
    Store.years().map(y => `<option value="${escapeHtml(y)}">Year ${escapeHtml(y)}</option>`).join('');
}

function getFiltered(){
  const q = searchInput.value.trim().toLowerCase();
  const course = courseFilter.value;
  const year = yearFilter.value;

  return Store.all().filter(s => {
    const matchesSearch = !q || s.name.toLowerCase().includes(q);
    const matchesCourse = !course || s.course === course;
    const matchesYear = !year || s.year === year;
    return matchesSearch && matchesCourse && matchesYear;
  }).sort((a,b) => a.name.localeCompare(b.name));
}

function renderTable(){
  const list = getFiltered();
  countPill.textContent = list.length + (list.length === 1 ? ' student' : ' students');

  if(!list.length){
    tableBody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  tableBody.innerHTML = list.map(s => {
    const isMe = meRecord && s.id === meRecord.id;
    return `
    <tr style="${isMe ? 'background:var(--forest-bg);' : ''}">
      <td>
        <div class="stu-name">
          <div class="avatar-chip">${initials(s.name)}</div>
          <div style="font-weight:600">${escapeHtml(s.name)} ${isMe ? '<span class="pill pill-o" style="margin-left:6px;">You</span>' : ''}</div>
        </div>
      </td>
      <td>${escapeHtml(s.course)}</td>
      <td>Year ${escapeHtml(s.year)}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" title="View details" data-view="${s.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `;
  }).join('');
}

[searchInput].forEach(el => el.addEventListener('input', renderTable));
[courseFilter, yearFilter].forEach(el => el.addEventListener('change', renderTable));

document.getElementById('clearFilters').addEventListener('click', () => {
  searchInput.value = '';
  courseFilter.value = '';
  yearFilter.value = '';
  renderTable();
});

tableBody.addEventListener('click', (e) => {
  const viewBtn = e.target.closest('[data-view]');
  if(viewBtn) window.location.href = 'student-details.html?id=' + encodeURIComponent(viewBtn.dataset.view);
});

renderStats();
populateFilterOptions();
renderTable();

