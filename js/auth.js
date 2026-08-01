/* =========================================================
   auth.js — lightweight, client-side-only role handling.

   There is no real backend here — this only simulates two
   roles so the prototype can demonstrate an Admin view vs a
   Student (read-only) view. The "credentials" below are a
   hardcoded constant checked in the browser, not a real
   authentication system — anyone can read them in this file.
   A production version would need real server-side auth.

   Everything (role, name, credential check) is stored and
   evaluated locally: the signed-in state lives in localStorage,
   so — like the student records — it persists across page
   refreshes and browser restarts, until "Log out" is used.
   ========================================================= */

const ROLE_KEY = 'sms_role';
const NAME_KEY = 'sms_user_name';

// Demo-only local admin credentials. No server, no encryption —
// this exists purely so the prototype has an admin "sign-in" step.
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin' };

const Auth = {
  role(){
    return localStorage.getItem(ROLE_KEY);
  },

  userName(){
    return localStorage.getItem(NAME_KEY) || '';
  },

  /* Checks a username/password against the local admin credentials. */
  verifyAdmin(username, password){
    return username.trim().toLowerCase() === ADMIN_CREDENTIALS.username &&
           password === ADMIN_CREDENTIALS.password;
  },

  login(role, name){
    localStorage.setItem(ROLE_KEY, role);
    if(name){
      localStorage.setItem(NAME_KEY, name);
    }else{
      localStorage.removeItem(NAME_KEY);
    }
  },

  logout(){
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(NAME_KEY);
    window.location.href = 'login.html';
  },

  /* Call at the top of any protected page.
     Redirects to login if no role is set, or to that role's
     home page if the current page isn't allowed for them. */
  guard(allowedRoles){
    const role = Auth.role();
    if(!role){
      window.location.href = 'login.html';
      return;
    }
    if(!allowedRoles.includes(role)){
      window.location.href = role === 'admin' ? 'index.html' : 'student-directory.html';
    }
  },

  /* Injects a small role badge + "switch role" link into the
     sidebar footer. Call once per page, after the sidebar exists. */
  mountBadge(){
    const foot = document.querySelector('.sidebar-foot');
    if(!foot) return;

    const role = Auth.role();
    const name = Auth.userName();

    const badge = document.createElement('div');
    badge.className = 'role-badge';
    badge.innerHTML = `
      <div class="role-pill role-${role}">${role === 'admin' ? 'ADMIN' : 'STUDENT'}</div>
      ${name ? `<div class="role-name">${escapeHtml(name)}</div>` : ''}
      <button class="role-logout" id="roleLogoutBtn" type="button">Switch role / Log out</button>
    `;
    foot.parentNode.insertBefore(badge, foot);

    document.getElementById('roleLogoutBtn').addEventListener('click', Auth.logout);
  }
};

