/* =========================================================
   storage.js
   Central data layer for the Student Management System.
   All pages read/write students through this module so the
   localStorage schema only lives in one place.
   ========================================================= */

const STORAGE_KEY = 'sms_students';
const SEEDED_KEY  = 'sms_seeded';

/* ---------- Seed data (first run only) ---------- */
const SEED_STUDENTS = [
  { id: 'STU-1001', name: 'Amara Uwase',      email: 'amara.uwase@mail.com',   phone: '0788 123 456', gender: 'Female', course: 'Computer Science', year: '2', regDate: '2025-09-02' },
  { id: 'STU-1002', name: 'Jean Paul Habimana',email: 'jp.habimana@mail.com',   phone: '0722 456 789', gender: 'Male',   course: 'Business IT',      year: '1', regDate: '2025-09-04' },
  { id: 'STU-1003', name: 'Grace Mukamana',    email: 'grace.mukamana@mail.com',phone: '0733 987 654', gender: 'Female', course: 'Software Engineering', year: '3', regDate: '2024-09-10' },
  { id: 'STU-1004', name: 'Eric Niyonsenga',   email: 'eric.niy@mail.com',      phone: '0790 555 222', gender: 'Male',   course: 'Computer Science', year: '2', regDate: '2025-01-14' },
  { id: 'STU-1005', name: 'Diane Ingabire',    email: 'diane.ingabire@mail.com',phone: '0788 321 000', gender: 'Female', course: 'Information Systems', year: '4', regDate: '2023-09-01' },
];

function seedIfEmpty(){
  if(!localStorage.getItem(SEEDED_KEY)){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_STUDENTS));
    localStorage.setItem(SEEDED_KEY, '1');
  }
}
seedIfEmpty();

/* ---------- Core CRUD ---------- */
const Store = {
  all(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){
      console.error('Could not read students from storage', e);
      return [];
    }
  },

  save(list){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  },

  find(id){
    return Store.all().find(s => s.id === id) || null;
  },

  add(student){
    const list = Store.all();
    student.id = Store.nextId(list);
    list.push(student);
    Store.save(list);
    return student;
  },

  update(id, changes){
    const list = Store.all();
    const idx = list.findIndex(s => s.id === id);
    if(idx === -1) return null;
    list[idx] = { ...list[idx], ...changes };
    Store.save(list);
    return list[idx];
  },

  remove(id){
    const list = Store.all().filter(s => s.id !== id);
    Store.save(list);
  },

  nextId(list){
    const nums = list
      .map(s => parseInt(String(s.id).replace('STU-', ''), 10))
      .filter(n => !isNaN(n));
    const max = nums.length ? Math.max(...nums) : 1000;
    return 'STU-' + (max + 1);
  },

  /* ---- derived helpers used by dashboard / list filters ---- */
  emailExists(email, excludeId){
    return Store.all().some(s => s.email.toLowerCase() === email.toLowerCase() && s.id !== excludeId);
  },

  courses(){
    return [...new Set(Store.all().map(s => s.course))].sort();
  },

  years(){
    return [...new Set(Store.all().map(s => s.year))].sort();
  },

  stats(){
    const list = Store.all();
    const male = list.filter(s => s.gender === 'Male').length;
    const female = list.filter(s => s.gender === 'Female').length;
    const other = list.length - male - female;
    return { total: list.length, male, female, other, courses: Store.courses().length };
  }
};

/* ---------- Small shared UI helpers ---------- */

function initials(name){
  return name.trim().split(/\s+/).slice(0,2).map(p => p[0].toUpperCase()).join('');
}

function formatDate(iso){
  if(!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if(isNaN(d)) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function genderPillClass(gender){
  if(gender === 'Male') return 'pill-m';
  if(gender === 'Female') return 'pill-f';
  return 'pill-o';
}

function showToast(message, isDanger){
  let toast = document.querySelector('.toast');
  if(!toast){
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<span class="dot"></span><span class="toast-msg"></span>';
    document.body.appendChild(toast);
  }
  toast.classList.toggle('danger', !!isDanger);
  toast.querySelector('.toast-msg').textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str == null ? '' : str;
  return div.innerHTML;
}

function getParam(name){
  return new URLSearchParams(window.location.search).get(name);
}
