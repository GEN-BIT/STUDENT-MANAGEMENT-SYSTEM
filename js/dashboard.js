/* dashboard.js — renders stats, course distribution, recent list */

Auth.guard(['admin']);
Auth.mountBadge();

function renderStats(){
  const s = Store.stats();
  const cards = [
    { label: 'Total Students', value: s.total, sub: 'currently registered', accent: 'var(--brass)' },
    { label: 'Male Students',  value: s.male,  sub: s.total ? Math.round(s.male / s.total * 100) + '% of total' : '—', accent: '#3B5578' },
    { label: 'Female Students',value: s.female,sub: s.total ? Math.round(s.female / s.total * 100) + '% of total' : '—', accent: 'var(--rose)' },
    { label: 'Courses Offered',value: s.courses,sub: 'distinct courses on file', accent: 'var(--forest)' },
  ];

  document.getElementById('statGrid').innerHTML = cards.map(c => `
    <div class="stat-card" style="--stat-accent:${c.accent}">
      <div class="stat-label">${c.label}</div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-sub">${c.sub}</div>
    </div>
  `).join('');
}

function renderCourseBars(){
  const list = Store.all();
  const courses = Store.courses();
  const wrap = document.getElementById('courseBars');

  if(!courses.length){
    wrap.innerHTML = '<p class="empty-note">No students on file yet.</p>';
    return;
  }

  const max = Math.max(...courses.map(c => list.filter(s => s.course === c).length));

  wrap.innerHTML = courses.map(course => {
    const count = list.filter(s => s.course === course).length;
    const pct = max ? Math.round((count / max) * 100) : 0;
    return `
      <div class="bar-row">
        <div class="bar-label">${escapeHtml(course)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        <div class="bar-count">${count}</div>
      </div>
    `;
  }).join('');
}

function renderRecent(){
  const list = [...Store.all()].sort((a,b) => new Date(b.regDate) - new Date(a.regDate)).slice(0,5);
  const wrap = document.getElementById('recentList');

  if(!list.length){
    wrap.innerHTML = '<p class="empty-note">No registrations yet — add your first student.</p>';
    return;
  }

  wrap.innerHTML = list.map(s => `
    <div class="recent-row">
      <div class="avatar-chip">${initials(s.name)}</div>
      <div>
        <div class="r-name">${escapeHtml(s.name)}</div>
        <div class="r-meta">${escapeHtml(s.course)} · Year ${escapeHtml(s.year)}</div>
      </div>
      <div class="r-date">${formatDate(s.regDate)}</div>
    </div>
  `).join('');
}

renderStats();
renderCourseBars();
renderRecent();
