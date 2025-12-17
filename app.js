const LS_USER_PLAN = "studyPlanner.userPlan";
const LS_ACTIVE_PLAN = "studyPlanner.activePlan";
const LS_ACTIVE_SCREEN = "studyPlanner.activeScreen";

const SCREENS = ["dashboard", "subjects", "exams", "tasks", "today"];

const DEMO_PLAN = {
  meta: { name: "Roy's Demo Plan", createdAt: "2025-12-17" },
  subjects: [
    { id: "sub-math", name: "Discrete Math", teacher: "TBD", notes: "", color: "#4f46e5" },
    { id: "sub-it", name: "IT Fundamentals", teacher: "TBD", notes: "", color: "#16a34a" }
  ],
  exams: [],
  tasks: []
};

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
  if (stored) return stored;
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

function getActiveScreen() {
  const s = localStorage.getItem(LS_ACTIVE_SCREEN);
  return SCREENS.includes(s) ? s : "dashboard";
}

function setActiveScreen(s) {
  localStorage.setItem(LS_ACTIVE_SCREEN, s);
}

function renderSubjects() {
  const plan = getActivePlanData();
  const isDemo = getActivePlanMode() === "demo";

  let html = `<h2>Subjects</h2>`;

  if (isDemo) {
    html += `<p><em>Demo plan is read-only.</em></p>`;
  } else {
    html += `<button id="addSubjectBtn">Add Subject</button>`;
  }

  plan.subjects.forEach(sub => {
    html += `
      <div class="subject-row">
        <div style="display:flex;align-items:center">
          <div class="subject-color" style="background:${sub.color || "#999"}"></div>
          <strong>${sub.name}</strong>
        </div>
        <div class="subject-actions">
          ${!isDemo ? `
            <button data-id="${sub.id}" class="editSubject">Edit</button>
            <button data-id="${sub.id}" class="deleteSubject">Delete</button>
          ` : ""}
        </div>
      </div>
    `;
  });

  const container = document.getElementById("screenContainer");
  container.innerHTML = html;

  if (!isDemo) {
    document.getElementById("addSubjectBtn").onclick = () => {
      const name = prompt("Subject name:");
      if (!name) return;

      const plan = loadUserPlan();
      plan.subjects.push({
        id: crypto.randomUUID(),
        name,
        teacher: "",
        notes: "",
        color: "#999"
      });

      saveUserPlan(plan);
      render();
    };

    container.querySelectorAll(".deleteSubject").forEach(btn => {
      btn.onclick = () => {
        const plan = loadUserPlan();
        plan.subjects = plan.subjects.filter(s => s.id !== btn.dataset.id);
        saveUserPlan(plan);
        render();
      };
    });
  }
}

function renderScreen() {
  const screen = getActiveScreen();
  document.getElementById("activeScreenLabel").textContent = screen;

  document.querySelectorAll(".tab").forEach(b =>
    b.classList.toggle("active", b.dataset.screen === screen)
  );

  const c = document.getElementById("screenContainer");

  if (screen === "dashboard") {
    c.innerHTML = `<h2>Dashboard</h2><p>Coming next.</p>`;
    return;
  }

  if (screen === "subjects") {
    renderSubjects();
    return;
  }

  c.innerHTML = `<h2>${screen}</h2><p>Not built yet.</p>`;
}

function showBannerIfDemo() {
  const banner = document.getElementById("banner");
  if (getActivePlanMode() === "demo") {
    banner.style.display = "block";
    banner.textContent = "You are viewing the Demo Plan. Create your own plan to start.";
  } else {
    banner.style.display = "none";
  }
}

function render() {
  showBannerIfDemo();
  document.getElementById("activePlanLabel").textContent = getActivePlanMode().toUpperCase();
  renderScreen();
}

document.getElementById("btnViewDemo").onclick = () => {
  setActivePlanMode("demo");
  render();
};

document.getElementById("btnMyPlan").onclick = () => {
  setActivePlanMode(loadUserPlan() ? "user" : "demo");
  render();
};

document.getElementById("btnCreateNew").onclick = () => {
  if (!confirm("Reset your User Plan?")) return;
  saveUserPlan({ meta: {}, subjects: [], exams: [], tasks: [] });
  setActivePlanMode("user");
  render();
};

document.querySelectorAll(".tab").forEach(btn => {
  btn.onclick = () => {
    setActiveScreen(btn.dataset.screen);
    render();
  };
});

render();
