/* =========================================================
   Study Planner (Static) - MVP v1
   - Demo plan: read-only constant
   - User plan: LocalStorage
   - Screens: Dashboard, Subjects, Exams, Tasks, Today
   - Export/Import JSON for user plan
========================================================= */

// ---------- LocalStorage keys ----------
const LS_USER_PLAN = "studyPlanner.userPlan";
const LS_ACTIVE_PLAN = "studyPlanner.activePlan"; // "demo" | "user"
const LS_ACTIVE_SCREEN = "studyPlanner.activeScreen"; // "dashboard" | ...

const SCREENS = ["dashboard", "subjects", "exams", "tasks", "today"];

// ---------- Demo Plan (read-only) ----------
const DEMO_PLAN = {
  meta: { name: "Roy’s Demo Plan", createdAt: "2025-12-17" },
  subjects: [
    { id: "sub-math", name: "Discrete Math", teacher: "Dr. Koval", notes: "Graphs, induction, sets.", color: "#7c5cff" },
    { id: "sub-it", name: "IT Fundamentals", teacher: "Mr. Petrov", notes: "OSI model, IP basics, hardware.", color: "#22c55e" },
    { id: "sub-db", name: "Databases", teacher: "Ms. Ivanova", notes: "SQL SELECT/JOIN, normalization.", color: "#38bdf8" },
    { id: "sub-net", name: "Networking", teacher: "Dr. Smirnov", notes: "Subnets, routing, VLANs.", color: "#f59e0b" },
    { id: "sub-sec", name: "Cybersecurity Basics", teacher: "Mr. Karim", notes: "Threat models, passwords, phishing.", color: "#ef4444" },
    { id: "sub-eng", name: "English (Academic)", teacher: "Ms. Sarah", notes: "Presentations + technical writing.", color: "#a78bfa" }
  ],
  exams: [
    { id: "ex-1", subjectId: "sub-math", title: "Discrete Math Exam", datetime: "2025-12-27T10:00:00", location: "Room 101", notes: "Bring student ID." },
    { id: "ex-2", subjectId: "sub-db", title: "Databases Midterm", datetime: "2025-12-22T13:30:00", location: "Lab 3", notes: "SQL + ER diagrams." },
    { id: "ex-3", subjectId: "sub-net", title: "Networking Quiz", datetime: "2025-12-19T09:00:00", location: "Room 204", notes: "Subnetting + ports." }
  ],
  tasks: [
    { id: "t-1", subjectId: "sub-it", title: "Summarize OSI layers (1 page)", dueDate: "2025-12-18", status: "todo", priority: "medium", notes: "" },
    { id: "t-2", subjectId: "sub-math", title: "Practice induction problems (10)", dueDate: "2025-12-18", status: "doing", priority: "high", notes: "Focus on base case clarity." },
    { id: "t-3", subjectId: "sub-db", title: "Write 5 JOIN queries from examples", dueDate: "2025-12-20", status: "todo", priority: "high", notes: "" },
    { id: "t-4", subjectId: "sub-net", title: "Subnetting worksheet", dueDate: "2025-12-19", status: "todo", priority: "high", notes: "" },
    { id: "t-5", subjectId: "sub-sec", title: "Create password policy notes", dueDate: "2025-12-21", status: "todo", priority: "medium", notes: "" },
    { id: "t-6", subjectId: "", title: "Plan study schedule for weekend", dueDate: "2025-12-17", status: "doing", priority: "low", notes: "2 blocks per day." }
  ]
};

// ---------- Utilities ----------
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUUID() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function parseISODate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function parseISODateTime(dtStr) {
  if (!dtStr) return null;
  const d = new Date(dtStr);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function toDateInputValue(isoOrDate) {
  const d = parseISODateTime(isoOrDate) || parseISODate(isoOrDate);
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toDateTimeLocalValue(iso) {
  const d = parseISODateTime(iso);
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateTime(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

// ---------- Storage ----------
function loadUserPlan() {
  const raw = localStorage.getItem(LS_USER_PLAN);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function saveUserPlan(plan) {
  localStorage.setItem(LS_USER_PLAN, JSON.stringify(plan));
}

function getActivePlanMode() {
  const stored = localStorage.getItem(LS_ACTIVE_PLAN);
  if (stored === "demo" || stored === "user") return stored;
  return loadUserPlan() ? "user" : "demo";
}

function setActivePlanMode(mode) {
  localStorage.setItem(LS_ACTIVE_PLAN, mode);
}

function getActivePlanData() {
  if (getActivePlanMode() === "user") {
    return loadUserPlan() || DEMO_PLAN;
  }
  return DEMO_PLAN;
}

function isDemo() {
  return getActivePlanMode() === "demo";
}

// ---------- Screen routing ----------
function getActiveScreen() {
  const s = localStorage.getItem(LS_ACTIVE_SCREEN);
  return SCREENS.includes(s) ? s : "dashboard";
}

function setActiveScreen(screen) {
  if (!SCREENS.includes(screen)) return;
  localStorage.setItem(LS_ACTIVE_SCREEN, screen);
}

// ---------- Modal helpers ----------
const modal = {
  backdrop: () => document.getElementById("modalBackdrop"),
  title: () => document.getElementById("modalTitle"),
  body: () => document.getElementById("modalBody"),
  hint: () => document.getElementById("modalHint"),
  primary: () => document.getElementById("modalPrimary"),
  cancel: () => document.getElementById("modalCancel"),
  close: () => document.getElementById("modalClose"),
};

function openModal({ title, bodyHtml, primaryText = "Save", hint = "", onPrimary }) {
  modal.title().textContent = title;
  modal.body().innerHTML = bodyHtml;
  modal.hint().textContent = hint;
  modal.primary().textContent = primaryText;

  modal.backdrop().style.display = "flex";

  const closeAll = () => closeModal();
  modal.cancel().onclick = closeAll;
  modal.close().onclick = closeAll;

  modal.primary().onclick = () => {
    try { onPrimary?.(); }
    catch (e) { alert("Error: " + (e?.message || e)); }
  };

  modal.backdrop().onclick = (ev) => {
    if (ev.target === modal.backdrop()) closeAll();
  };
}

function closeModal() {
  modal.backdrop().style.display = "none";
  modal.body().innerHTML = "";
  modal.primary().onclick = null;
  modal.cancel().onclick = null;
  modal.close().onclick = null;
  modal.backdrop().onclick = null;
}

// ---------- Validation ----------
function validateSubject(input) {
  const name = input.name.trim();
  if (!name) return { ok: false, msg: "Subject name is required." };
  return { ok: true };
}

function validateExam(input) {
  if (!input.title.trim()) return { ok: false, msg: "Exam title is required." };
  const d = parseISODateTime(input.datetime);
  if (!d) return { ok: false, msg: "Valid exam date/time is required." };
  if (!input.subjectId) return { ok: false, msg: "Select a subject for the exam." };
  return { ok: true };
}

function validateTask(input) {
  if (!input.title.trim()) return { ok: false, msg: "Task title is required." };
  const d = parseISODate(input.dueDate);
  if (!d) return { ok: false, msg: "Valid due date is required." };
  const statuses = ["todo", "doing", "done"];
  const priorities = ["low", "medium", "high"];
  if (!statuses.includes(input.status)) return { ok: false, msg: "Invalid status." };
  if (!priorities.includes(input.priority)) return { ok: false, msg: "Invalid priority." };
  return { ok: true };
}

// ---------- Import/Export ----------
function exportUserPlan() {
  const plan = loadUserPlan();
  if (!plan) {
    alert("No User Plan found. Click Create New Plan first.");
    return;
  }

  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "study-planner-user-plan.json";
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function basicPlanShapeValid(plan) {
  if (!plan || typeof plan !== "object") return false;
  if (!plan.meta || typeof plan.meta !== "object") return false;
  if (!Array.isArray(plan.subjects)) return false;
  if (!Array.isArray(plan.exams)) return false;
  if (!Array.isArray(plan.tasks)) return false;
  return true;
}

function importUserPlanFromFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result || "");
      const parsed = JSON.parse(text);

      if (!basicPlanShapeValid(parsed)) {
        alert("Import failed: JSON does not look like a Study Planner plan.");
        return;
      }

      const ok = confirm("Import will REPLACE your current User Plan. Continue?");
      if (!ok) return;

      saveUserPlan(parsed);
      setActivePlanMode("user");
      render();
      alert("Import successful.");
    } catch (e) {
      alert("Import failed: " + (e?.message || e));
    }
  };
  reader.readAsText(file);
}

// ---------- CRUD helpers ----------
function getSubjectById(plan, id) {
  return (plan.subjects || []).find(s => s.id === id) || null;
}

function subjectNameById(plan, id) {
  if (!id) return "(No subject)";
  const s = getSubjectById(plan, id);
  return s ? s.name : "(Unknown Subject)";
}

function deleteSubjectAndUnlink(plan, subjectId) {
  plan.subjects = plan.subjects.filter(s => s.id !== subjectId);
  plan.exams = plan.exams.map(ex => ex.subjectId === subjectId ? { ...ex, subjectId: "" } : ex);
  plan.tasks = plan.tasks.map(t => t.subjectId === subjectId ? { ...t, subjectId: "" } : t);
}

function ensureUserPlanOrWarn() {
  const plan = loadUserPlan();
  if (!plan) {
    alert("No User Plan found. Click Create New Plan first.");
    return null;
  }
  return plan;
}

// ---------- Screen renderers ----------
function showBannerIfDemo() {
  const banner = document.getElementById("banner");
  if (isDemo()) {
    banner.style.display = "block";
    banner.textContent = "You are viewing the Demo Plan. Create your own plan to start.";
  } else {
    banner.style.display = "none";
    banner.textContent = "";
  }
}

function countUpcomingTasks(plan, now, in7days) {
  const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDay = new Date(in7days.getFullYear(), in7days.getMonth(), in7days.getDate());
  return (plan.tasks || [])
    .filter(t => t.status !== "done")
    .map(t => ({ ...t, _d: parseISODate(t.dueDate) }))
    .filter(t => t._d && t._d >= startDay && t._d <= endDay)
    .length;
}

function renderDashboard() {
  const plan = getActivePlanData();
  const now = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const examsUpcoming = (plan.exams || [])
    .map(ex => ({ ...ex, _d: parseISODateTime(ex.datetime) }))
    .filter(ex => ex._d && ex._d >= now && ex._d <= in7days)
    .sort((a, b) => a._d - b._d);

  const overdueTasks = (plan.tasks || [])
    .filter(t => t.status !== "done")
    .map(t => ({ ...t, _d: parseISODate(t.dueDate) }))
    .filter(t => t._d && t._d < new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    .sort((a, b) => a._d - b._d);

  const html = `
    <h2>Dashboard</h2>

    <div class="grid-2">
      <div class="kpi">
        <h4>Next 7 days</h4>
        <p>${examsUpcoming.length} exam(s), ${countUpcomingTasks(plan, now, in7days)} task(s)</p>
        <div class="small">Due between now and 7 days from now.</div>
      </div>
      <div class="kpi">
        <h4>Overdue tasks</h4>
        <p>${overdueTasks.length} task(s)</p>
        <div class="small">Past due date and not done.</div>
      </div>
    </div>

    <div style="margin-top:16px;">
      <h3>Upcoming exams (next 7 days)</h3>
      ${examsUpcoming.length ? examsUpcoming.map(ex => `
        <div class="row">
          <div class="left">
            <span class="badge">Exam</span>
            <div>
              <div><strong>${escapeHtml(ex.title)}</strong></div>
              <div class="small">${escapeHtml(subjectNameById(plan, ex.subjectId))} • ${formatDateTime(ex._d)}</div>
            </div>
          </div>
          <div class="small">${escapeHtml(ex.location || "")}</div>
        </div>
      `).join("") : `<p class="small">No exams in the next 7 days.</p>`}
    </div>

    <div style="margin-top:16px;">
      <h3>Overdue tasks</h3>
      ${overdueTasks.length ? overdueTasks.map(t => `
        <div class="row">
          <div class="left">
            <span class="badge">Task</span>
            <div>
              <div><strong>${escapeHtml(t.title)}</strong></div>
              <div class="small">${escapeHtml(subjectNameById(plan, t.subjectId))} • due ${escapeHtml(t.dueDate)}</div>
            </div>
          </div>
          <div class="small">${escapeHtml(t.priority)} • ${escapeHtml(t.status)}</div>
        </div>
      `).join("") : `<p class="small">No overdue tasks.</p>`}
    </div>
  `;

  document.getElementById("screenContainer").innerHTML = html;
}

function renderSubjects() {
  const plan = getActivePlanData();
  const container = document.getElementById("screenContainer");

  let html = `
    <div class="list-header">
      <h2>Subjects</h2>
      <div>
        ${isDemo() ? `<span class="badge">Demo read-only</span>` : `<button id="btnAddSubject" type="button">Add Subject</button>`}
      </div>
    </div>
  `;

  if (isDemo()) {
    html += `<div class="notice"><strong>Demo plan is read-only.</strong> Switch to My Plan to edit.</div>`;
  }

  if (!plan.subjects?.length) {
    html += `<p class="small">No subjects yet.</p>`;
    container.innerHTML = html;
    wireSubjectsHandlers();
    return;
  }

  html += plan.subjects.map(s => `
    <div class="row">
      <div class="left">
        <div class="color-dot" style="background:${escapeHtml(s.color || "#999")}"></div>
        <div>
          <div><strong>${escapeHtml(s.name)}</strong></div>
          <div class="small">${escapeHtml(s.teacher || "")}</div>
        </div>
      </div>
      <div class="actions">
        ${isDemo() ? "" : `
          <button class="btnEditSubject" data-id="${escapeHtml(s.id)}" type="button">Edit</button>
          <button class="btnDeleteSubject" data-id="${escapeHtml(s.id)}" type="button">Delete</button>
        `}
      </div>
    </div>
  `).join("");

  container.innerHTML = html;
  wireSubjectsHandlers();
}

function wireSubjectsHandlers() {
  if (isDemo()) return;

  const btnAdd = document.getElementById("btnAddSubject");
  if (btnAdd) btnAdd.onclick = () => openSubjectModal({ mode: "create" });

  document.querySelectorAll(".btnEditSubject").forEach(btn => {
    btn.onclick = () => openSubjectModal({ mode: "edit", id: btn.dataset.id });
  });

  document.querySelectorAll(".btnDeleteSubject").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const userPlan = ensureUserPlanOrWarn();
      if (!userPlan) return;

      const sub = getSubjectById(userPlan, id);
      const ok = confirm(`Delete "${sub?.name || "this subject"}"? This will unlink related exams/tasks.`);
      if (!ok) return;

      deleteSubjectAndUnlink(userPlan, id);
      saveUserPlan(userPlan);
      render();
    };
  });
}

function openSubjectModal({ mode, id }) {
  const userPlan = ensureUserPlanOrWarn();
  if (!userPlan) return;

  const existing = mode === "edit" ? getSubjectById(userPlan, id) : null;

  openModal({
    title: mode === "edit" ? "Edit Subject" : "Add Subject",
    primaryText: mode === "edit" ? "Save Changes" : "Add",
    hint: "Name is required.",
    bodyHtml: `
      <div id="modalError" class="error" style="display:none;"></div>

      <div class="form-grid">
        <div>
          <label for="subName">Name (required)</label>
          <input id="subName" type="text" value="${escapeHtml(existing?.name || "")}" />
        </div>
        <div>
          <label for="subTeacher">Teacher (optional)</label>
          <input id="subTeacher" type="text" value="${escapeHtml(existing?.teacher || "")}" />
        </div>
        <div>
          <label for="subColor">Color (optional)</label>
          <input id="subColor" type="color" value="${escapeHtml(existing?.color || "#999999")}" />
        </div>
        <div class="full">
          <label for="subNotes">Notes (optional)</label>
          <textarea id="subNotes">${escapeHtml(existing?.notes || "")}</textarea>
        </div>
      </div>
    `,
    onPrimary: () => {
      const name = document.getElementById("subName").value;
      const teacher = document.getElementById("subTeacher").value;
      const color = document.getElementById("subColor").value;
      const notes = document.getElementById("subNotes").value;

      const input = { name, teacher, color, notes };
      const v = validateSubject(input);
      if (!v.ok) return showModalError(v.msg);

      if (mode === "edit") {
        const idx = userPlan.subjects.findIndex(s => s.id === id);
        if (idx === -1) return showModalError("Subject not found.");
        userPlan.subjects[idx] = {
          ...userPlan.subjects[idx],
          name: name.trim(),
          teacher: teacher.trim(),
          notes: notes.trim(),
          color
        };
      } else {
        userPlan.subjects.push({
          id: safeUUID(),
          name: name.trim(),
          teacher: teacher.trim(),
          notes: notes.trim(),
          color
        });
      }

      saveUserPlan(userPlan);
      closeModal();
      render();
    }
  });
}

/* ===== Exams / Tasks / Today (unchanged logic from MVP) =====
   Keeping the rest exactly the same as your working MVP
   (only Demo Plan + visuals + footer changed in this request).
*/
function renderExams() {
  const plan = getActivePlanData();
  const container = document.getElementById("screenContainer");

  const exams = (plan.exams || [])
    .map(ex => ({ ...ex, _d: parseISODateTime(ex.datetime) }))
    .sort((a, b) => (a._d?.getTime() || 0) - (b._d?.getTime() || 0));

  let html = `
    <div class="list-header">
      <h2>Exams</h2>
      <div>
        ${isDemo() ? `<span class="badge">Demo read-only</span>` : `<button id="btnAddExam" type="button">Add Exam</button>`}
      </div>
    </div>
  `;

  if (isDemo()) {
    html += `<div class="notice"><strong>Demo plan is read-only.</strong> Switch to My Plan to edit.</div>`;
  }

  if (!exams.length) {
    html += `<p class="small">No exams yet.</p>`;
    container.innerHTML = html;
    wireExamsHandlers();
    return;
  }

  html += exams.map(ex => `
    <div class="row">
      <div class="left">
        <span class="badge">Exam</span>
        <div>
          <div><strong>${escapeHtml(ex.title)}</strong></div>
          <div class="small">${escapeHtml(subjectNameById(plan, ex.subjectId))} • ${ex._d ? formatDateTime(ex._d) : escapeHtml(ex.datetime)}</div>
        </div>
      </div>
      <div class="actions">
        <span class="small">${escapeHtml(ex.location || "")}</span>
        ${isDemo() ? "" : `
          <button class="btnEditExam" data-id="${escapeHtml(ex.id)}" type="button">Edit</button>
          <button class="btnDeleteExam" data-id="${escapeHtml(ex.id)}" type="button">Delete</button>
        `}
      </div>
    </div>
  `).join("");

  container.innerHTML = html;
  wireExamsHandlers();
}

function wireExamsHandlers() {
  if (isDemo()) return;

  const btnAdd = document.getElementById("btnAddExam");
  if (btnAdd) btnAdd.onclick = () => openExamModal({ mode: "create" });

  document.querySelectorAll(".btnEditExam").forEach(btn => {
    btn.onclick = () => openExamModal({ mode: "edit", id: btn.dataset.id });
  });

  document.querySelectorAll(".btnDeleteExam").forEach(btn => {
    btn.onclick = () => {
      const userPlan = ensureUserPlanOrWarn();
      if (!userPlan) return;

      const id = btn.dataset.id;
      const ex = userPlan.exams.find(e => e.id === id);
      const ok = confirm(`Delete "${ex?.title || "this exam"}"?`);
      if (!ok) return;

      userPlan.exams = userPlan.exams.filter(e => e.id !== id);
      saveUserPlan(userPlan);
      render();
    };
  });
}

function openExamModal({ mode, id }) {
  const userPlan = ensureUserPlanOrWarn();
  if (!userPlan) return;

  if (!userPlan.subjects?.length) {
    alert("You must add at least 1 subject before creating an exam.");
    return;
  }

  const existing = mode === "edit" ? userPlan.exams.find(e => e.id === id) : null;

  const subjectOptions = userPlan.subjects.map(s =>
    `<option value="${escapeHtml(s.id)}" ${existing?.subjectId === s.id ? "selected" : ""}>${escapeHtml(s.name)}</option>`
  ).join("");

  openModal({
    title: mode === "edit" ? "Edit Exam" : "Add Exam",
    primaryText: mode === "edit" ? "Save Changes" : "Add",
    hint: "Exam must have title, subject, date/time.",
    bodyHtml: `
      <div id="modalError" class="error" style="display:none;"></div>

      <div class="form-grid">
        <div class="full">
          <label for="exTitle">Title (required)</label>
          <input id="exTitle" type="text" value="${escapeHtml(existing?.title || "")}" />
        </div>

        <div>
          <label for="exSubject">Subject (required)</label>
          <select id="exSubject">
            <option value="">-- Select --</option>
            ${subjectOptions}
          </select>
        </div>

        <div>
          <label for="exDateTime">Date & time (required)</label>
          <input id="exDateTime" type="datetime-local" value="${escapeHtml(toDateTimeLocalValue(existing?.datetime || ""))}" />
        </div>

        <div>
          <label for="exLocation">Location (optional)</label>
          <input id="exLocation" type="text" value="${escapeHtml(existing?.location || "")}" />
        </div>

        <div class="full">
          <label for="exNotes">Notes (optional)</label>
          <textarea id="exNotes">${escapeHtml(existing?.notes || "")}</textarea>
        </div>
      </div>
    `,
    onPrimary: () => {
      const title = document.getElementById("exTitle").value;
      const subjectId = document.getElementById("exSubject").value;
      const dtLocal = document.getElementById("exDateTime").value;
      const location = document.getElementById("exLocation").value;
      const notes = document.getElementById("exNotes").value;

      const datetime = dtLocal ? new Date(dtLocal).toISOString() : "";

      const input = {
        title: title.trim(),
        subjectId,
        datetime,
        location: location.trim(),
        notes: notes.trim()
      };

      const v = validateExam(input);
      if (!v.ok) return showModalError(v.msg);

      if (mode === "edit") {
        const idx = userPlan.exams.findIndex(e => e.id === id);
        if (idx === -1) return showModalError("Exam not found.");
        userPlan.exams[idx] = { ...userPlan.exams[idx], ...input };
      } else {
        userPlan.exams.push({ id: safeUUID(), ...input });
      }

      saveUserPlan(userPlan);
      closeModal();
      render();
    }
  });
}

function renderTasks() {
  const plan = getActivePlanData();
  const container = document.getElementById("screenContainer");

  let html = `
    <div class="list-header">
      <h2>Tasks</h2>
      <div>
        ${isDemo() ? `<span class="badge">Demo read-only</span>` : `<button id="btnAddTask" type="button">Add Task</button>`}
      </div>
    </div>
  `;

  if (isDemo()) {
    html += `<div class="notice"><strong>Demo plan is read-only.</strong> Switch to My Plan to edit.</div>`;
  }

  const statuses = ["todo", "doing", "done"];
  const subjectOptions = [`<option value="">All subjects</option>`]
    .concat((plan.subjects || []).map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)}</option>`))
    .join("");

  html += `
    <div class="notice">
      <div class="form-grid">
        <div>
          <label for="taskFilterStatus">Filter status</label>
          <select id="taskFilterStatus">
            <option value="">All</option>
            ${statuses.map(s => `<option value="${s}">${s}</option>`).join("")}
          </select>
        </div>
        <div>
          <label for="taskFilterSubject">Filter subject</label>
          <select id="taskFilterSubject">
            ${subjectOptions}
          </select>
        </div>
      </div>
      <div class="small">Filters are client-side only.</div>
    </div>
  `;

  const tasks = (plan.tasks || []).slice();

  html += `<div id="tasksList"></div>`;
  container.innerHTML = html;

  function renderTaskList() {
    const status = document.getElementById("taskFilterStatus").value;
    const subjectId = document.getElementById("taskFilterSubject").value;

    const filtered = tasks
      .filter(t => !status || t.status === status)
      .filter(t => !subjectId || t.subjectId === subjectId)
      .map(t => ({ ...t, _d: parseISODate(t.dueDate) }))
      .sort((a, b) => (a._d?.getTime() || 0) - (b._d?.getTime() || 0));

    const listEl = document.getElementById("tasksList");
    if (!filtered.length) {
      listEl.innerHTML = `<p class="small">No tasks match filters.</p>`;
      wireTasksHandlers();
      return;
    }

    listEl.innerHTML = filtered.map(t => `
      <div class="row">
        <div class="left">
          <span class="badge">Task</span>
          <div>
            <div><strong>${escapeHtml(t.title)}</strong></div>
            <div class="small">${escapeHtml(subjectNameById(plan, t.subjectId))} • due ${escapeHtml(t.dueDate)}</div>
          </div>
        </div>
        <div class="actions">
          <span class="small">${escapeHtml(t.priority)} • ${escapeHtml(t.status)}</span>
          ${isDemo() ? "" : `
            <button class="btnEditTask" data-id="${escapeHtml(t.id)}" type="button">Edit</button>
            <button class="btnDeleteTask" data-id="${escapeHtml(t.id)}" type="button">Delete</button>
          `}
        </div>
      </div>
    `).join("");

    wireTasksHandlers();
  }

  document.getElementById("taskFilterStatus").onchange = renderTaskList;
  document.getElementById("taskFilterSubject").onchange = renderTaskList;

  renderTaskList();

  if (!isDemo()) {
    document.getElementById("btnAddTask").onclick = () => openTaskModal({ mode: "create" });
  }
}

function wireTasksHandlers() {
  if (isDemo()) return;

  document.querySelectorAll(".btnEditTask").forEach(btn => {
    btn.onclick = () => openTaskModal({ mode: "edit", id: btn.dataset.id });
  });

  document.querySelectorAll(".btnDeleteTask").forEach(btn => {
    btn.onclick = () => {
      const userPlan = ensureUserPlanOrWarn();
      if (!userPlan) return;

      const id = btn.dataset.id;
      const t = userPlan.tasks.find(x => x.id === id);
      const ok = confirm(`Delete "${t?.title || "this task"}"?`);
      if (!ok) return;

      userPlan.tasks = userPlan.tasks.filter(x => x.id !== id);
      saveUserPlan(userPlan);
      render();
    };
  });
}

function openTaskModal({ mode, id }) {
  const userPlan = ensureUserPlanOrWarn();
  if (!userPlan) return;

  const existing = mode === "edit" ? userPlan.tasks.find(t => t.id === id) : null;

  const subjectOptions = [`<option value="">(No subject)</option>`]
    .concat((userPlan.subjects || []).map(s =>
      `<option value="${escapeHtml(s.id)}" ${existing?.subjectId === s.id ? "selected" : ""}>${escapeHtml(s.name)}</option>`
    ))
    .join("");

  openModal({
    title: mode === "edit" ? "Edit Task" : "Add Task",
    primaryText: mode === "edit" ? "Save Changes" : "Add",
    hint: "Task must have title, due date, status, priority.",
    bodyHtml: `
      <div id="modalError" class="error" style="display:none;"></div>

      <div class="form-grid">
        <div class="full">
          <label for="tTitle">Title (required)</label>
          <input id="tTitle" type="text" value="${escapeHtml(existing?.title || "")}" />
        </div>

        <div>
          <label for="tDue">Due date (required)</label>
          <input id="tDue" type="date" value="${escapeHtml(toDateInputValue(existing?.dueDate || ""))}" />
        </div>

        <div>
          <label for="tSubject">Subject (optional)</label>
          <select id="tSubject">
            ${subjectOptions}
          </select>
        </div>

        <div>
          <label for="tStatus">Status</label>
          <select id="tStatus">
            ${["todo","doing","done"].map(s => `<option value="${s}" ${existing?.status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </div>

        <div>
          <label for="tPriority">Priority</label>
          <select id="tPriority">
            ${["low","medium","high"].map(p => `<option value="${p}" ${existing?.priority === p ? "selected" : ""}>${p}</option>`).join("")}
          </select>
        </div>

        <div class="full">
          <label for="tNotes">Notes (optional)</label>
          <textarea id="tNotes">${escapeHtml(existing?.notes || "")}</textarea>
        </div>
      </div>
    `,
    onPrimary: () => {
      const title = document.getElementById("tTitle").value;
      const dueDate = document.getElementById("tDue").value;
      const subjectId = document.getElementById("tSubject").value;
      const status = document.getElementById("tStatus").value;
      const priority = document.getElementById("tPriority").value;
      const notes = document.getElementById("tNotes").value;

      const input = {
        title: title.trim(),
        dueDate,
        subjectId,
        status,
        priority,
        notes: notes.trim()
      };

      const v = validateTask(input);
      if (!v.ok) return showModalError(v.msg);

      if (mode === "edit") {
        const idx = userPlan.tasks.findIndex(t => t.id === id);
        if (idx === -1) return showModalError("Task not found.");
        userPlan.tasks[idx] = { ...userPlan.tasks[idx], ...input };
      } else {
        userPlan.tasks.push({ id: safeUUID(), ...input });
      }

      saveUserPlan(userPlan);
      closeModal();
      render();
    }
  });
}

function renderToday() {
  const plan = getActivePlanData();
  const now = new Date();
  const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const tasksDueToday = (plan.tasks || [])
    .map(t => ({ ...t, _d: parseISODate(t.dueDate) }))
    .filter(t => t._d && t._d.getTime() === todayStart.getTime())
    .sort((a, b) => a.title.localeCompare(b.title));

  const examsNext24h = (plan.exams || [])
    .map(ex => ({ ...ex, _d: parseISODateTime(ex.datetime) }))
    .filter(ex => ex._d && ex._d >= now && ex._d <= end)
    .sort((a, b) => a._d - b._d);

  const html = `
    <h2>Today</h2>
    <div class="grid-2">
      <div class="kpi">
        <h4>Tasks due today (${formatDate(todayStart)})</h4>
        <p>${tasksDueToday.length} task(s)</p>
      </div>
      <div class="kpi">
        <h4>Exams in next 24h</h4>
        <p>${examsNext24h.length} exam(s)</p>
      </div>
    </div>

    <div style="margin-top:16px;">
      <h3>Tasks due today</h3>
      ${tasksDueToday.length ? tasksDueToday.map(t => `
        <div class="row">
          <div class="left">
            <span class="badge">Task</span>
            <div>
              <div><strong>${escapeHtml(t.title)}</strong></div>
              <div class="small">${escapeHtml(subjectNameById(plan, t.subjectId))} • ${escapeHtml(t.priority)} • ${escapeHtml(t.status)}</div>
            </div>
          </div>
          <div class="small">${escapeHtml(t.notes || "")}</div>
        </div>
      `).join("") : `<p class="small">No tasks due today.</p>`}
    </div>

    <div style="margin-top:16px;">
      <h3>Exams in next 24 hours</h3>
      ${examsNext24h.length ? examsNext24h.map(ex => `
        <div class="row">
          <div class="left">
            <span class="badge">Exam</span>
            <div>
              <div><strong>${escapeHtml(ex.title)}</strong></div>
              <div class="small">${escapeHtml(subjectNameById(plan, ex.subjectId))} • ${formatDateTime(ex._d)}</div>
            </div>
          </div>
          <div class="small">${escapeHtml(ex.location || "")}</div>
        </div>
      `).join("") : `<p class="small">No exams in the next 24 hours.</p>`}
    </div>
  `;

  document.getElementById("screenContainer").innerHTML = html;
}

function showModalError(msg) {
  const el = document.getElementById("modalError");
  if (!el) return alert(msg);
  el.style.display = "block";
  el.textContent = msg;
}

// ---------- Render ----------
function renderScreen() {
  const screen = getActiveScreen();
  document.getElementById("activeScreenLabel").textContent = screen;

  document.querySelectorAll(".tab").forEach(b => {
    b.classList.toggle("active", b.dataset.screen === screen);
  });

  if (screen === "dashboard") return renderDashboard();
  if (screen === "subjects") return renderSubjects();
  if (screen === "exams") return renderExams();
  if (screen === "tasks") return renderTasks();
  if (screen === "today") return renderToday();

  document.getElementById("screenContainer").innerHTML = `<h2>Unknown screen</h2>`;
}

function renderMeta() {
  const plan = getActivePlanData();
  document.getElementById("activePlanLabel").textContent = getActivePlanMode().toUpperCase();
  document.getElementById("planNameLabel").textContent = plan?.meta?.name || "-";
}

function render() {
  showBannerIfDemo();
  renderMeta();
  renderScreen();
}

// ---------- Top nav buttons ----------
document.getElementById("btnViewDemo").onclick = () => {
  setActivePlanMode("demo");
  render();
};

document.getElementById("btnMyPlan").onclick = () => {
  setActivePlanMode(loadUserPlan() ? "user" : "demo");
  render();
};

document.getElementById("btnCreateNew").onclick = () => {
  const ok = confirm("This will reset your current User Plan. Continue?");
  if (!ok) return;

  const freshPlan = {
    meta: { name: "My Plan", createdAt: new Date().toISOString() },
    subjects: [],
    exams: [],
    tasks: []
  };

  saveUserPlan(freshPlan);
  setActivePlanMode("user");
  render();
};

document.getElementById("btnExport").onclick = () => exportUserPlan();

document.getElementById("btnImport").onclick = () => {
  document.getElementById("importFile").value = "";
  document.getElementById("importFile").click();
};

document.getElementById("importFile").addEventListener("change", (ev) => {
  const file = ev.target.files?.[0];
  if (!file) return;
  importUserPlanFromFile(file);
});

// ---------- Tabs ----------
document.querySelectorAll(".tab").forEach(btn => {
  btn.onclick = () => {
    setActiveScreen(btn.dataset.screen);
    render();
  };
});

// ---------- Boot ----------
render();
