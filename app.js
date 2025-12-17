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
  exams: [
    { id: "ex-1", subjectId: "sub-math", title: "Discrete Math Exam", datetime: "2025-12-27T10:00:00", location: "Room 101", notes: "" }
  ],
  tasks: [
    { id: "t-1", subjectId: "sub-it", title: "Read chapter 3", dueDate: "2025-12-20", status: "todo", priority: "medium", notes: "" }
  ]
};

// ======= Helpers: plan storage =======
function loadUserPlan() {
  const raw = localStorage.getItem(LS_USER_PLAN);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveUserPlan(plan) {
  localStorage.setItem(LS_USER_PLAN, JSON.stringify(plan));
}

function getActivePlanMode() {
  const stored = localStorage.getItem(LS_ACTIVE_PLAN);
  if (stored === "demo" || stored === "user") return stored;

  // Default: if no user plan exists -> demo, else user
  return loadUserPlan() ? "user" : "demo";
}

function setActivePlanMode(mode) {
  localStorage.setItem(LS_ACTIVE_PLAN, mode);
}

function getActivePlanData() {
  const mode = getActivePlanMode();
  if (mode === "user") {
    const userPlan = loadUserPlan();
    return userPlan || DEMO_PLAN; // fallback
  }
  return DEMO_PLAN;
}

// ======= Helpers: screen routing =======
function getActiveScreen() {
  const stored = localStorage.getItem(LS_ACTIVE_SCREEN);
  if (SCREENS.includes(stored)) return stored;
  return "dashboard";
}

function setActiveScreen(screen) {
  if (!SCREENS.includes(screen)) return;
  localStorage.setItem(LS_ACTIVE_SCREEN, screen);
}

function showBannerIfDemo() {
  const banner = document.getElementById("banner");
  const mode = getActivePlanMode();

  if (mode === "demo") {
    banner.style.display = "block";
    banner.textContent = "You are viewing the Demo Plan. Create your own plan to start.";
  } else {
    banner.style.display = "none";
    banner.textContent = "";
  }
}

function renderScreen() {
  const screen = getActiveScreen();
  const mode = getActivePlanMode();
  const plan = getActivePlanData();

  // Labels
  document.getElementById("activeScreenLabel").textContent = screen;

  // Tabs highlight
  document.querySelectorAll(".tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.screen === screen);
  });

  // Content
  const container = document.getElementById("screenContainer");

  if (screen === "dashboard") {
    container.innerHTML = `
      <h2>Dashboard</h2>
      <p>Next 7 days + overdue will be built in a later chapter.</p>
      <p><strong>Plan name:</strong> ${plan.meta?.name || "-"}</p>
      <p><strong>Mode:</strong> ${mode.toUpperCase()}</p>
    `;
    return;
  }

  if (screen === "subjects") {
    container.innerHTML = `
      <h2>Subjects</h2>
      <p>CRUD will be built in later chapters.</p>
      <p>Subjects in this plan: <strong>${plan.subjects?.length ?? 0}</strong></p>
    `;
    return;
  }

  if (screen === "exams") {
    container.innerHTML = `
      <h2>Exams</h2>
      <p>CRUD + sort by date will be built later.</p>
      <p>Exams in this plan: <strong>${plan.exams?.length ?? 0}</strong></p>
    `;
    return;
  }

  if (screen === "tasks") {
    container.innerHTML = `
      <h2>Tasks</h2>
      <p>CRUD + filters will be built later.</p>
      <p>Tasks in this plan: <strong>${plan.tasks?.length ?? 0}</strong></p>
    `;
    return;
  }

  if (screen === "today") {
    container.innerHTML = `
      <h2>Today</h2>
      <p>Due today + next 24h will be built later.</p>
      <p>This is a placeholder screen.</p>
    `;
    return;
  }

  container.innerHTML = `<h2>Unknown screen</h2>`;
}

function render() {
  showBannerIfDemo();
  document.getElementById("activePlanLabel").textContent = getActivePlanMode().toUpperCase();
  renderScreen();
}

// ======= UI actions: top buttons =======
document.getElementById("btnViewDemo").addEventListener("click", () => {
  setActivePlanMode("demo");
  render();
});

document.getElementById("btnMyPlan").addEventListener("click", () => {
  setActivePlanMode(loadUserPlan() ? "user" : "demo");
  render();
});

document.getElementById("btnCreateNew").addEventListener("click", () => {
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
});

document.getElementById("btnExport").addEventListener("click", () => {
  alert("Export is coming in a later chapter.");
});

document.getElementById("btnImport").addEventListener("click", () => {
  alert("Import is coming in a later chapter.");
});

// ======= UI actions: screen tabs (IMPORTANT: only once) =======
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    setActiveScreen(btn.dataset.screen);
    render();
  });
});

// ======= Boot =======
render();
