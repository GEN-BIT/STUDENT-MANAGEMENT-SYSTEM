/* students.js — search, filter, render table, edit/delete flows */

Auth.guard(['admin']);
Auth.mountBadge();

const searchInput   = document.getElementById('searchInput');
const courseFilter  = document.getElementById('courseFilter');
const genderFilter  = document.getElementById('genderFilter');
const yearFilter    = document.getElementById('yearFilter');
const tableBody     = document.getElementById('tableBody');
const emptyState    = document.getElementById('emptyState');
const countPill     = document.getElementById('countPill');
const deleteModal   = document.getElementById('deleteModal');
const deleteNameEl  = document.getElementById('deleteName');

let pendingDeleteId = null;

/* ---------- show a flash message left by add/edit page ---------- */
(function flashFromRedirect(){
  const msg = sessionStorage.getItem('sms_flash');
  if(msg){
    showToast(msg);
    sessionStorage.removeItem('sms_flash');
  }
})();

/* ---------- populate filter dropdowns from data ---------- */
function populateFilterOptions(){
  const courses = Store.courses();
  const years = Store.years();

  courseFilter.innerHTML = '<option value="">All courses</option>' +
    courses.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');

  yearFilter.innerHTML = '<option value="">All years</option>' +
    years.map(y => `<option value="${escapeHtml(y)}">Year ${escapeHtml(y)}</option>`).join('');
}

/* ---------- filtering ---------- */
function getFiltered(){
  const q = searchInput.value.trim().toLowerCase();
  const course = courseFilter.value;
  const gender = genderFilter.value;
  const year = yearFilter.value;

  return Store.all().filter(s => {
    const matchesSearch = !q ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.course.toLowerCase().includes(q);
    const matchesCourse = !course || s.course === course;
    const matchesGender = !gender || s.gender === gender;
    const matchesYear = !year || s.year === year;
    return matchesSearch && matchesCourse && matchesGender && matchesYear;
  }).sort((a,b) => a.name.localeCompare(b.name));
}

/* ---------- render ---------- */
function renderTable(){
  const list = getFiltered();
  countPill.textContent = list.length + (list.length === 1 ? ' student' : ' students');

  if(!list.length){
    tableBody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  tableBody.innerHTML = list.map(s => `
    <tr>
      <td>
        <div class="stu-name">
          <div class="avatar-chip">${initials(s.name)}</div>
          <div>
            <div style="font-weight:600">${escapeHtml(s.name)}</div>
            <div class="r-id">${s.id}</div>
          </div>
        </div>
      </td>
      <td>
        <div>${escapeHtml(s.email)}</div>
        <div style="color:var(--slate); font-size:12px">${escapeHtml(s.phone)}</div>
      </td>
      <td>${escapeHtml(s.course)}</td>
      <td>Year ${escapeHtml(s.year)}</td>
      <td><span class="pill ${genderPillClass(s.gender)}">${escapeHtml(s.gender)}</span></td>
      <td>${formatDate(s.regDate)}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" title="View details" data-view="${s.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="icon-btn" title="Edit student" data-edit="${s.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
          </button>
          <button class="icon-btn danger" title="Delete student" data-delete="${s.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ---------- events ---------- */
[searchInput].forEach(el => el.addEventListener('input', renderTable));
[courseFilter, genderFilter, yearFilter].forEach(el => el.addEventListener('change', renderTable));

document.getElementById('clearFilters').addEventListener('click', () => {
  searchInput.value = '';
  courseFilter.value = '';
  genderFilter.value = '';
  yearFilter.value = '';
  renderTable();
});

tableBody.addEventListener('click', (e) => {
  const viewBtn = e.target.closest('[data-view]');
  const editBtn = e.target.closest('[data-edit]');
  const delBtn  = e.target.closest('[data-delete]');

  if(viewBtn) window.location.href = 'student-details.html?id=' + encodeURIComponent(viewBtn.dataset.view);
  if(editBtn) window.location.href = 'add-student.html?id=' + encodeURIComponent(editBtn.dataset.edit);
  if(delBtn) openDeleteModal(delBtn.dataset.delete);
});

/* ---------- delete modal ---------- */
function openDeleteModal(id){
  const s = Store.find(id);
  if(!s) return;
  pendingDeleteId = id;
  deleteNameEl.textContent = s.name;
  deleteModal.classList.add('show');
}

function closeDeleteModal(){
  deleteModal.classList.remove('show');
  pendingDeleteId = null;
}

document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
deleteModal.addEventListener('click', (e) => { if(e.target === deleteModal) closeDeleteModal(); });

document.getElementById('confirmDelete').addEventListener('click', () => {
  if(!pendingDeleteId) return;
  const s = Store.find(pendingDeleteId);
  Store.remove(pendingDeleteId);
  closeDeleteModal();
  populateFilterOptions();
  renderTable();
  showToast((s ? s.name : 'Student') + ' was deleted.', true);
});

/* ---------- init ---------- */
populateFilterOptions();
renderTable();
