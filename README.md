# Study Planner (Static Web App)

A static study planning web app hosted on GitHub Pages.

- No backend, no database, no accounts
- Demo plan is built-in and read-only
- User plan is editable and stored in LocalStorage
- Export/Import JSON backups

## Live Demo
After enabling GitHub Pages:
https://sakuraa9.github.io/study-planner/

## How to run locally
1. Clone/download the repo
2. Open `index.html` in a browser

## Features (MVP)
- Two plans: Demo (read-only) and My Plan (editable)
- Subjects CRUD (name required)
- Exams CRUD (title, subject, datetime required; sorted by date)
- Tasks CRUD (title, due date required; status/priority; optional subject)
- Dashboard: upcoming (next 7 days) + overdue tasks
- Today: due today + exams next 24 hours
- Export/Import user plan JSON
