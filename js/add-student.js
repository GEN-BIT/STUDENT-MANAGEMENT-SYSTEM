/* add-student.js — handles both "Add" and "Edit" (via ?id=) modes */

Auth.guard(['admin']);
Auth.mountBadge();

const editId = getParam('id');
const isEdit = !!editId;

const form = document.getElementById('studentForm');
const fields = {
  name:    document.getElementById('name'),
  email:   document.getElementById('email'),
  phone:   document.getElementById('phone'),
  gender:  document.getElementById('gender'),
  course:  document.getElementById('course'),
  year:    document.getElementById('year'),
  regDate: document.getElementById('regDate'),
};

/* populate course suggestions from existing data */
document.getElementById('courseSuggestions').innerHTML =
  Store.courses().map(c => `<option value="${escapeHtml(c)}"></option>`).join('');

/* ---------- Edit mode setup ---------- */
let editingStudent = null;

if(isEdit){
  editingStudent = Store.find(editId);
  if(!editingStudent){
    showToast('That student record could not be found.', true);
    window.location.href = 'students.html';
  }else{
    document.getElementById('formEyebrow').textContent = 'Edit Entry · ' + editingStudent.id;
    document.getElementById('formTitle').textContent = 'Edit Student';
    document.getElementById('formDesc').innerHTML = 'Update the details for <strong>' + escapeHtml(editingStudent.name) + '</strong>.';
    document.getElementById('submitBtn').textContent = 'Update Student';
    document.getElementById('idNote').textContent = 'Registration ID ' + editingStudent.id + ' stays the same.';

    fields.name.value = editingStudent.name;
    fields.email.value = editingStudent.email;
    fields.phone.value = editingStudent.phone;
    fields.gender.value = editingStudent.gender;
    fields.course.value = editingStudent.course;
    fields.year.value = editingStudent.year;
    fields.regDate.value = editingStudent.regDate;
  }
}else{
  // default registration date to today for convenience
  fields.regDate.value = new Date().toISOString().slice(0,10);
}

document.getElementById('cancelBtn').addEventListener('click', () => {
  window.location.href = 'students.html';
});

/* ---------- Validation ---------- */
const PHONE_RE = /^[0-9+()\s-]{7,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setInvalid(key, invalid){
  document.getElementById('field-' + key).classList.toggle('invalid', invalid);
}

function validate(){
  let valid = true;

  const name = fields.name.value.trim();
  if(name.length < 2){ setInvalid('name', true); valid = false; } else setInvalid('name', false);

  const email = fields.email.value.trim();
  const emailTaken = Store.emailExists(email, isEdit ? editingStudent.id : null);
  if(!EMAIL_RE.test(email) || emailTaken){ setInvalid('email', true); valid = false; } else setInvalid('email', false);

  const phone = fields.phone.value.trim();
  if(!PHONE_RE.test(phone)){ setInvalid('phone', true); valid = false; } else setInvalid('phone', false);

  if(!fields.gender.value){ setInvalid('gender', true); valid = false; } else setInvalid('gender', false);

  if(!fields.course.value.trim()){ setInvalid('course', true); valid = false; } else setInvalid('course', false);

  if(!fields.year.value){ setInvalid('year', true); valid = false; } else setInvalid('year', false);

  if(!fields.regDate.value){ setInvalid('regDate', true); valid = false; } else setInvalid('regDate', false);

  return valid;
}

/* clear the red state as the person fixes a field */
Object.entries(fields).forEach(([key, el]) => {
  el.addEventListener('input', () => document.getElementById('field-' + key).classList.remove('invalid'));
  el.addEventListener('change', () => document.getElementById('field-' + key).classList.remove('invalid'));
});

/* ---------- Submit ---------- */
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if(!validate()){
    showToast('Please fix the highlighted fields.', true);
    return;
  }

  const payload = {
    name: fields.name.value.trim(),
    email: fields.email.value.trim(),
    phone: fields.phone.value.trim(),
    gender: fields.gender.value,
    course: fields.course.value.trim(),
    year: fields.year.value,
    regDate: fields.regDate.value,
  };

  if(isEdit){
    Store.update(editingStudent.id, payload);
    sessionStorage.setItem('sms_flash', 'Student updated successfully.');
  }else{
    Store.add(payload);
    sessionStorage.setItem('sms_flash', 'Student saved successfully.');
  }

  window.location.href = 'students.html';
});
