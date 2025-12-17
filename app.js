// ======= Storage keys =======
const LS_USER_PLAN = "studyPlanner.userPlan";
const LS_ACTIVE_PLAN = "studyPlanner.activePlan";
const LS_ACTIVE_SCREEN = "studyPlanner.activeScreen";

const SCREENS = ["dashboard", "subjects", "exams", "tasks", "today"];

// ======= Demo plan (read-only) =======
const DEMO_PLAN = {
  meta: { name: "Roy's Demo Plan", createdAt: "2025-12-17" },
  subjects: [
    { id: "sub-math", name: "Discrete Math", teacher: "TBD", notes: "", color: "#4f46e5" },
    { id: "sub-it", name: "IT Fundamentals", teacher: "TBD", notes: "", color: "#16a34a" }
  ],
  exams: [],
  tasks: []
};

// ======= Helpers: plan storage =======
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
  return getActivePlanMode() === "user"
    ? (loadUserPlan() || DEMO_PLAN)
    : DEMO_PLAN;
}

// ======= Helpers: screen routing =======
function getActiveScreen() {
  const s = localStorage.getItem(LS_ACTIVE_SCREEN);
  return SCREENS.includes(s) ? s : "dashboard";
}

function setActiveScreen(s) {
  if (!SCREENS.includes(s)) return;
  localStorage.setItem(LS_ACTIVE_SCREEN, s);
}

function showBannerIfDemo() {
  const banner = document.getElementById("banner");
  if (getActivePlanMode() === "demo") {
    banner.style.display = "block";
    banner.textContent = "You are viewing the Demo Plan. Create your own plan to start.";
  } else {
    banner.style.display = "none";
    banner.textContent = "";
  }
}

// ======= Subjects CRUD state (in-memory only) =======
let editingSubjectId = null;

// ======= Subjects screen =======
function renderSubjects() {
  const plan = getActivePlanData();
  const isDemo = getActivePlanMode() === "demo";

  const container = document.getElementById("screenContainer");

  let html = `<h2>Subjects</h2>`;

  if (isDemo) {
    html += `<div class="notice"><strong>Demo plan is read-only.</strong> Switch to My Plan to add/edit/delete.</div>`;
  } else {
    html += `
      <div id="subjectError" class="error" style="display:none;"></div>

      <div class="notice">
        <strong>${editingSubjectId ? "Editing subject" : "Add a new subject"}</strong>
        <div class="form-grid">
          <div>
            <label for="subName">Name (required)</label>
            <input id="subName" type="text" placeholder="e.g. Discrete Math" />
          </div>
          <div>
            <label for="subTeacher">Teacher (optional)</label>
            <input id="subTeacher" type="text" placeholder="e.g. Dr. Smith" />
          </div>
          <div>
            <label for="subColor">Color (optional)</label>
            <input id="subColor" type="color" />
          </div>
          <div class="full">
            <label for="subNotes">Notes (optional)</label>
            <textarea id="subNotes" placeholder="Any notes..."></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button id="btnSaveSubject" type="button">${editingSubjectId ? "Save Changes" : "Add Subject"}</button>
          <button id="btnCancelEdit" type="button" style="display:${editingSubjectId ? "inline-block" : "none"};">Cancel</button>
        </div>
      </div>
    `;
  }

  html += `<h3 style="margin-top:16px;">Subject List</h3>`;

  if (!plan.subjects || plan.subjects.length === 0) {
    html += `<p>No subjects yet.</p>`;
  } else {
    plan.subjects.forEach(sub => {
      html += `
        <div class="subject-row">
          <div class="subject-left">
            <div class="subject-color" style="background:${sub.color || "#999"}"></div>
            <div>
              <div><strong>${escapeHtml(sub.name)}</strong></div>
              <div style="font-size:12px;color:#6b7280;">${escapeHtml(sub.teacher || "")}</div>
            </div>
          </div>

          <div class="subject-actions">
            ${isDemo ? "" : `
              <button type="button" class="editSubject" data-id="${sub.id}">Edit</button>
              <button type="button" class="deleteSubject" data-id="${sub.id}">Delete</button>
            `}
          </div>
        </div>
      `;
    });
  }

  container.innerHTML = html;

  if (isDemo) return;

  // Fill form defaults
  const nameEl = document.getElementById("subName");
  const teacherEl = document.getElementById("subTeacher");
  const colorEl = document.getElementById("subColor");
  const notesEl = document.getElementById("subNotes");

  if (editingSubjectId) {
    const userPlan = loadUserPlan();
    const sub = userPlan?.subjects?.find(s => s.id === editingSubjectId);
    if (sub) {
      nameEl.value = sub.name || "";
      teacherEl.value = sub.teacher || "";
      colorEl.value = sub.color || "#999999";
      notesEl.value = sub.notes || "";
    } else {
      // If missing, reset edit mode
      editingSubjectId = null;
    }
  } else {
    nameEl.value = "";
    teacherEl.value = "";
    colorEl.value = "#999999";
    notesEl.value = "";
  }

  // Save/Add
  document.getElementById("btnSaveSubject").onclick = () => {
    const name = nameEl.value.trim();
    const teacher = teacherEl.value.trim();
    const color = colorEl.value;
    const notes = notesEl.value.trim();

    if (!name) {
      showSubjectError("Subject name is required.");
      return;
    }

    const userPlan = loadUserPlan();
    if (!userPlan) {
      showSubjectError("No user plan found. Click Create New Plan first.");
      return;
    }

    if (!userPlan.subjects) userPlan.subjects = [];

    if (editingSubjectId) {
      const idx = userPlan.subjects.findIndex(s => s.id === editingSubjectId);
      if (idx === -1) {
        showSubjectError("Could not find the subject you were editing.");
        editingSubjectId = null;
        render();
        return;
      }

      userPlan.subjects[idx] = {
        ...userPlan.subjects[idx],
        name,
        teacher,
        color,
        notes
      };
    } else {
      userPlan.subjects.push({
        id: crypto.randomUUID(),
        name,
        teacher,
        notes,
        color
      });
    }

    saveUserPlan(userPlan);
    editingSubjectId = null;
    render();
  };

  // Cancel edit
  document.getElementById("btnCancelEdit").onclick = () => {
    editingSubjectId = null;
    render();
  };

  // Edit buttons
  container.querySelectorAll(".editSubject").forEach(btn => {
    btn.onclick = () => {
      editingSubjectId = btn.dataset.id;
      render();
    };
  });

  // Delete buttons (with confirmation)
  container.querySelectorAll(".deleteSubject").forEach(btn => {
    btn.onclick = () => {
      const userPlan = loadUserPlan();
      const sub = userPlan?.subjects?.find(s => s.id === btn.dataset.id);
      const name = sub?.name || "this subject";

      const ok = confirm(`Delete "${name}"? This cannot be undone.`);
      if (!ok) return;

      userPlan.subjects = userPlan.subjects.filter(s => s.id !== btn.dataset.id);

      // If deleting the one being edited, exit edit mode
      if (editingSubjectId === btn.dataset.id) editingSubjectId = null;

      saveUserPlan(userPlan);
      render();
    };
  });
}

function showSubjectError(msg) {
  const el = document.getElementById("subjectError");
  if (!el) return;
  el.style.display = "block";
  el.textContent = msg;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ======= Screen render =======
function renderScreen() {
  const screen = getActiveScreen();
  document.getElementById("activeScreenLabel").textContent = screen;

  document.querySelectorAll(".tab").forEach(b => {
    b.classList.toggle("active", b.dataset.screen === screen);
  });

  const c = document.getElementById("screenContainer");

  if (screen === "dashboard") {
    const plan = getActivePlanData();
    c.innerHTML = `
      <h2>Dashboard</h2>
      <p>This will show Next 7 days and Overdue later.</p>
      <p><strong>Plan name:</strong> ${escapeHtml(plan.meta?.name || "-")}</p>
    `;
    return;
  }

  if (screen === "subjects") {
    renderSubjects();
    return;
  }

  if (screen === "exams") {
    c.innerHTML = `<h2>Exams</h2><p>Coming next.</p>`;
    return;
  }

  if (screen === "tasks") {
    c.innerHTML = `<h2>Tasks</h2><p>Coming later.</p>`;
    return;
  }

  if (screen === "today") {
    c.innerHTML = `<h2>Today</h2><p>Coming later.</p>`;
    return;
  }

  c.innerHTML = `<h2>Unknown screen</h2>`;
}

function render() {
  showBannerIfDemo();
  document.getElementById("activePlanLabel").textContent = getActivePlanMode().toUpperCase();
  renderScreen();
}

// ======= Top buttons =======
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

document.getElementById("btnExport").onclick = () => {
  alert("Export is coming in a later chapter.");
};

document.getElementById("btnImport").onclick = () => {
  alert("Import is coming in a later chapter.");
};

// ======= Tabs =======
document.querySelectorAll(".tab").forEach(btn => {
  btn.onclick = () => {
    setActiveScreen(btn.dataset.screen);
    render();
  };
});

// ======= Boot =======
render();