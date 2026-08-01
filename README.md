# Student Management System — Prototype

A front-end prototype for managing student records in one dashboard, built with plain **HTML, CSS and JavaScript**. No build tools, frameworks, or backend — all data is kept in the browser's `localStorage`, so records survive a page refresh.

Visual direction: a "registrar's ledger" theme — navy sidebar, parchment background, brass accents, ruled-paper texture, and index-card style stat/detail panels.

---

## Getting started

No installation needed.

1. Download / clone this folder.
2. Open `login.html` in any modern browser (Chrome, Firefox, Edge, Safari). This is the app's entry point.
3. Sign in as **Admin** (username `admin`, password `admin`) or continue as **Student** by entering the exact name of one of the seeded students (e.g. `Amara Uwase` — start typing and the field will suggest matches). That's it — the app seeds itself with 5 sample students on first run so the UI isn't empty.

> Because everything runs client-side off the `file://` protocol, no local server is required. If you prefer one anyway: `npx serve .` or the VS Code "Live Server" extension both work fine.

---

## Roles

This is still a no-backend prototype, so there's no real server-side authentication — but it does simulate **two roles** to show how the same data could be presented differently depending on who's looking at it.

| Role | Sign-in | Can do | Landing page |
|---|---|---|---|
| **Admin** | Username `admin`, password `admin` | Everything: view the dashboard, add/edit/delete students, search & filter the full list | `index.html` (Dashboard) |
| **Student** | A name that already exists in the student records (required, no password) | Browse the student directory — search by name, filter by course or year, view any student's read-only details, with a "that's you" shortcut on their own record | `student-directory.html` |

The admin credentials are a hardcoded constant in `js/auth.js` (`ADMIN_CREDENTIALS = { username: 'admin', password: 'admin' }`), checked entirely in the browser — there's no server, no hashing, no real security. Anyone could open the file and read it, or edit the JavaScript to bypass the check. A production version would need real server-side authentication (sessions, tokens, hashed passwords, etc.) before this could be trusted.

The signed-in role is kept in **`localStorage`** (not `sessionStorage`), so — like the student records — it persists across page refreshes and even closing/reopening the browser, until "Log out" is used. This is enforced client-side by `js/auth.js`. Every admin page calls `Auth.guard(['admin'])` at the top, which redirects anyone without the admin role back to their own landing page.

Both roles land on the same `student-details.html` for a given student, but the Edit/Delete buttons only render for Admins.

---

## Pages

| Page | File | Who | Purpose |
|---|---|---|---|
| Login / role select | `login.html` | Everyone | Entry point — choose Admin or Student, optionally enter a name |
| Dashboard | `index.html` | Admin | Overview: total/male/female counts, course distribution bars, 5 most recent registrations |
| Student List | `students.html` | Admin | Search, filter (course / gender / year), view, edit, delete |
| Add Student | `add-student.html` | Admin | Validated form to create a new student |
| Edit Student | `add-student.html?id=STU-1001` | Admin | Same form, pre-filled — reused for editing |
| Student Directory | `student-directory.html` | Student | Read-only browse — search by name, filter by course or year |
| Student Details | `student-details.html?id=STU-1001` | Both | Read-only ID-card style record view. Admins additionally see Edit/Delete actions |

---

## Features

- **Add student** — name, email, phone, gender, course, year, registration date, with inline validation (required fields, email format, duplicate-email check, phone format). *Admin only.*
- **Student list** — all students rendered into a table, generated entirely from data (no hardcoded rows).
- **Search** — live filter by name, email, or course (Admin list) / by name (Student directory).
- **Filter** — by course, gender, and year (Admin), or course and year (Student), combinable with search.
- **Edit** — opens the same Add form pre-filled with the existing record; updates in place. *Admin only.*
- **Delete** — requires confirmation via a modal before removing a record. *Admin only.*
- **Statistics** — total students, male/female counts, courses on file, plus a per-course distribution chart on the dashboard. *Admin only.*
- **Role-based access** — Admin and Student roles see different navigation, pages, and actions, enforced by `js/auth.js`. Admin requires a username/password; Student just needs a name.
- **Student directory extras** — a small read-only stats strip (total students, courses, year groups), and a "that's you" shortcut + highlighted row if the entered name matches an existing student record.
- **Persistence** — every read/write, including the signed-in role, goes through `localStorage`, so both data and login state survive refreshes, new tabs, and browser restarts (same browser/profile) until "Log out" is used.

---

## Project structure

```
student-management-system/
├── login.html                 Entry point — role selection (Admin / Student)
├── index.html                 Dashboard                          (Admin)
├── students.html               Student List — search/filter/edit/delete  (Admin)
├── add-student.html            Add & Edit form                   (Admin)
├── student-directory.html      Read-only browse                  (Student)
├── student-details.html        Single student detail view        (Both — Edit/Delete shown to Admin only)
├── css/
│   └── style.css               Shared styling for all pages, incl. login & role badge
└── js/
    ├── storage.js               Data layer — localStorage CRUD + shared helpers
    ├── auth.js                  Role handling — login/logout, guard(), sidebar role badge
    ├── login.js                 Login page logic
    ├── dashboard.js              Dashboard page logic
    ├── students.js               Student List page logic
    ├── add-student.js            Add/Edit form logic + validation
    ├── student-directory.js      Student Directory (read-only) logic
    └── student-details.js        Student Details page logic (role-aware)
```

`css/style.css`, `js/storage.js` and `js/auth.js` are shared across every page; the rest are page-specific.

---

## Data model

Each student is stored as a plain object:

```js
{
  id: "STU-1001",
  name: "Amara Uwase",
  email: "amara.uwase@mail.com",
  phone: "0788 123 456",
  gender: "Female",       // "Male" | "Female" | "Other"
  course: "Computer Science",
  year: "2",               // "1"–"5"
  regDate: "2025-09-02"    // ISO date, yyyy-mm-dd
}
```

The full list is stored under the `sms_students` key in `localStorage` as a JSON array. IDs are auto-generated (`STU-1001`, `STU-1002`, …) by `Store.nextId()`.

The active role is stored separately, also in `localStorage`:

```js
sms_role       // "admin" | "student"
sms_user_name  // student role only — a name matched against an existing student record
```

### Resetting the data

To clear all records and reseed the sample data, open the browser console on any page and run:

```js
localStorage.removeItem('sms_students');
localStorage.removeItem('sms_seeded');
location.reload();
```

To sign out / switch roles, use the "Switch role / Log out" link at the bottom of the sidebar, or run:

```js
localStorage.removeItem('sms_role');
localStorage.removeItem('sms_user_name');
location.href = 'login.html';
```

---

## `Store` API (`js/storage.js`)

| Method | Description |
|---|---|
| `Store.all()` | Returns the full array of students |
| `Store.find(id)` | Returns one student by id, or `null` |
| `Store.add(student)` | Adds a new student (auto-assigns id) |
| `Store.update(id, changes)` | Merges `changes` into an existing student |
| `Store.remove(id)` | Deletes a student by id |
| `Store.emailExists(email, excludeId)` | Used for duplicate-email validation |
| `Store.courses()` / `Store.years()` | Distinct values, used to populate filters |
| `Store.stats()` | `{ total, male, female, other, courses }` for the dashboard |

## `Auth` API (`js/auth.js`)

| Method | Description |
|---|---|
| `Auth.role()` | Returns `"admin"`, `"student"`, or `null` if not signed in |
| `Auth.userName()` | Returns the matched student name (student role only) |
| `Auth.verifyAdmin(username, password)` | Checks credentials against the hardcoded `ADMIN_CREDENTIALS` constant (`admin` / `admin`) |
| `Auth.login(role, name)` | Sets the role (and optional name) in `localStorage` |
| `Auth.logout()` | Clears the role/name and redirects to `login.html` |
| `Auth.guard(allowedRoles)` | Call at the top of a page; redirects away if the current role isn't allowed |
| `Auth.mountBadge()` | Injects the role pill + "Switch role / Log out" link into the sidebar |

Every page loads `storage.js` then `auth.js` before its own script, so all pages share one consistent data layer and role check.

---

## JavaScript concepts practiced

- **Forms and validation** — required fields, email/phone pattern checks, duplicate-email detection, inline error states (`add-student.js`)
- **DOM creation and rendering** — table rows, stat cards, and detail views are all built from data via template strings, not hardcoded in HTML
- **Arrays and objects** — `filter()` for search/filters, `find()` for single-record lookup, `map()` for rendering lists, `sort()` for ordering
- **Event listeners** — form submission, input/change events for live filtering, event delegation on the table for edit/view/delete buttons
- **localStorage** — both student records and the signed-in role/name persist via `localStorage`, using `JSON.stringify` / `JSON.parse`
- **Access control patterns** — a simple `guard()` function shows the idea of route protection, even without a real backend

---

## Notes / limitations (prototype scope)

- **No real authentication** — the Admin username/password (`admin` / `admin`) is a hardcoded constant checked in the browser; there's no server, no hashing, and no real security. It exists purely so the prototype has a sign-in step. A production version would need real server-side auth (sessions, tokens, hashed passwords) before the role guard could be trusted.
- **No backend/API** — swapping `storage.js` for real HTTP calls would be the natural next step toward a production version.
- Data is scoped to one browser profile; it won't sync across devices.
