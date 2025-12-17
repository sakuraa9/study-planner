# Study Planner — Project Plan (MVP)

## Non-negotiables
- Static only: HTML/CSS/JS
- Hosted on GitHub Pages
- No accounts, no backend, no DB
- User data stored in LocalStorage
- Demo plan is always available and never modified

## Plans/modes
- Demo Plan: constant JSON in code, read-only
- User Plan: stored in LocalStorage under `studyPlanner.userPlan`
- Active mode stored under `studyPlanner.activePlan` ("demo" | "user")

## Entities
### Subject
- id (string)
- name (string, required)
- teacher (optional)
- notes (optional)
- color (optional)

### Exam
- id
- subjectId (required)
- title (required)
- datetime (ISO string, required)
- location (optional)
- notes (optional)

### Task
- id
- subjectId (optional)
- title (required)
- dueDate (ISO date string, required)
- status ("todo" | "doing" | "done")
- priority ("low" | "medium" | "high")
- notes (optional)

## MVP Screens
- Dashboard (next 7 days exams/tasks, overdue tasks)
- Subjects (CRUD)
- Exams (CRUD, sorted)
- Tasks (CRUD, filters)
- Today (due today, next 24h)

## Backup
- Export User Plan to JSON file
- Import JSON replaces User Plan (with confirmation)
