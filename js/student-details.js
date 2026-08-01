/* student-details.js */

Auth.guard(['admin', 'student']);
Auth.mountBadge();

const role = Auth.role();

if(role === 'student'){
  document.getElementById('sidebarNav').innerHTML =
    '<a href="student-directory.html" class="active"><span class="tab-num">01</span> Browse Students</a>';
  document.getElementById('backLink').setAttribute('href', 'student-directory.html');
  document.getElementById('backLinkText').textContent = 'Back to Student Directory';
}

const id = getParam('id');
const student = id ? Store.find(id) : null;
const deleteModal = document.getElementById('deleteModal');

if(!student){
  const backHref = role === 'student' ? 'student-directory.html' : 'students.html';
  document.getElementById('detailsWrap').innerHTML = `
    <div class="table-empty" style="background:var(--card); border:1px solid var(--line); border-radius:6px;">
      <div class="big">Student not found</div>
      <div>This record may have been deleted. <a href="${backHref}" style="color:var(--brass-dark); font-weight:600;">Return to the list</a>.</div>
    </div>
  `;
} else {
  if(role === 'admin'){
    document.getElementById('actionBtns').innerHTML = `
      <button class="btn btn-ghost" id="editBtn">Edit</button>
      <button class="btn" id="deleteBtn" style="border:1px solid rgba(168,67,74,.35); color:var(--rose); background:transparent;">Delete</button>
    `;
  }

  document.getElementById('detailsWrap').innerHTML = `
    <div class="details-grid">
      <div class="card id-card">
        <div class="big-avatar">${initials(student.name)}</div>
        <h2>${escapeHtml(student.name)}</h2>
        <div class="id-meta">${student.id}</div>
        <div class="id-pill"><span class="pill ${genderPillClass(student.gender)}">${escapeHtml(student.gender)}</span></div>
        <hr>
        <div class="stamp-note">REGISTERED&nbsp;&nbsp;${formatDate(student.regDate)}</div>
      </div>

      <div class="card detail-list">
        <dl>
          <dt>Email Address</dt><dd>${escapeHtml(student.email)}</dd>
          <dt>Phone Number</dt><dd>${escapeHtml(student.phone)}</dd>
          <dt>Course</dt><dd>${escapeHtml(student.course)}</dd>
          <dt>Year of Study</dt><dd>Year ${escapeHtml(student.year)}</dd>
          <dt>Gender</dt><dd>${escapeHtml(student.gender)}</dd>
          <dt>Registration Date</dt><dd>${formatDate(student.regDate)}</dd>
          <dt>Student ID</dt><dd>${student.id}</dd>
        </dl>
      </div>
    </div>
  `;

  if(role === 'admin'){
    document.getElementById('editBtn').addEventListener('click', () => {
      window.location.href = 'add-student.html?id=' + encodeURIComponent(student.id);
    });

    document.getElementById('deleteBtn').addEventListener('click', () => {
      document.getElementById('deleteName').textContent = student.name;
      deleteModal.classList.add('show');
    });

    document.getElementById('cancelDelete').addEventListener('click', () => deleteModal.classList.remove('show'));
    deleteModal.addEventListener('click', (e) => { if(e.target === deleteModal) deleteModal.classList.remove('show'); });

    document.getElementById('confirmDelete').addEventListener('click', () => {
      Store.remove(student.id);
      sessionStorage.setItem('sms_flash', student.name + ' was deleted.');
      window.location.href = 'students.html';
    });
  }
}
