// ======= Storage keys =======
const LS_USER_PLAN = "studyPlanner.userPlan";
const LS_ACTIVE_PLAN = "studyPlanner.activePlan";

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

// ======= Helpers =======
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

  // Default rule: if no user plan exists -> demo, else user
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

function render() {
  showBannerIfDemo();
  const label = document.getElementById("activePlanLabel");
  label.textContent = getActivePlanMode().toUpperCase();
}

// ======= UI actions =======
document.getElementById("btnViewDemo").addEventListener("click", () => {
  setActivePlanMode("demo");
  render();
});

document.getElementById("btnMyPlan").addEventListener("click", () => {
  // If no user plan exists, stay in demo until they create one
  if (!loadUserPlan()) {
    setActivePlanMode("demo");
  } else {
    setActivePlanMode("user");
  }
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

// ======= Boot =======
render();
