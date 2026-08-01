/* login.js */

const adminUsername = document.getElementById('adminUsername');
const adminPassword = document.getElementById('adminPassword');
const adminError    = document.getElementById('adminError');
const studentName    = document.getElementById('studentName');
const studentError   = document.getElementById('studentError');

// Suggest registered names as the student types (nice-to-have, doesn't relax the check below)
document.getElementById('registeredNames').innerHTML =
  Store.all().map(s => `<option value="${escapeHtml(s.name)}"></option>`).join('');

function attemptAdminLogin(){
  const ok = Auth.verifyAdmin(adminUsername.value, adminPassword.value);
  if(!ok){
    adminError.classList.add('show');
    adminPassword.value = '';
    adminPassword.focus();
    return;
  }
  adminError.classList.remove('show');
  Auth.login('admin');
  window.location.href = 'index.html';
}

document.getElementById('adminBtn').addEventListener('click', attemptAdminLogin);

[adminUsername, adminPassword].forEach(el => {
  el.addEventListener('keydown', (e) => { if(e.key === 'Enter') attemptAdminLogin(); });
  el.addEventListener('input', () => adminError.classList.remove('show'));
});

function attemptStudentLogin(){
  const typed = studentName.value.trim();
  const match = typed
    ? Store.all().find(s => s.name.toLowerCase() === typed.toLowerCase())
    : null;

  if(!match){
    studentError.classList.add('show');
    studentName.focus();
    return;
  }

  studentError.classList.remove('show');
  // Use the name exactly as it's stored on record, so it matches consistently elsewhere in the app.
  Auth.login('student', match.name);
  window.location.href = 'student-directory.html';
}

studentName.addEventListener('input', () => studentError.classList.remove('show'));

document.getElementById('studentBtn').addEventListener('click', attemptStudentLogin);

// Allow pressing Enter in the name field to continue as student
document.getElementById('studentName').addEventListener('keydown', (e) => {
  if(e.key === 'Enter') attemptStudentLogin();
});

