# FocusFlow PWA
The FocusFlow app is accessible from any browser and installable on mobile as a progressive web app. It manages tasks projects and kanban boards with full cloud sync across devices.

## Tech Stack Summary
```
Framework:    Next.js 16 (Pages Router)
Language:     TypeScript (frontend) + JavaScript (API routes)
Styling:      Tailwind CSS v4
State:        Zustand
Database:     Neon PostgreSQL (serverless)
Auth:         bcrypt + JWT HTTP-only cookies
Hosting:      Vercel (free hobby plan)
PWA:          Web App Manifest + meta tags
Mobile:       Responsive sidebar + installable PWA
```

## Folder Structure
```
focusflow-web/
├── public/                           PWA icons and favicons for the browser tab
│   ├── manifest.json                 PWA config (makes it installable)
│   ├── android-chrome-192x192.png    app icon (phone home screen)
│   └── android-chrome-512x512.png    app icon (large)
│
├── src/
│   ├── components/                   reusable UI pieces used across multiple pages
│   │   ├── Sidebar.tsx               desktop sidebar + mobile drawer
│   │   ├── TopBar.tsx                search bar + page title
│   │   ├── TaskRow.tsx               single task in list view
│   │   ├── TaskDetailModal.tsx       edit task drawer
│   │   ├── AddTaskBar.tsx            quick add task input
│   │   ├── KanbanBoard.tsx           drag and drop board
│   │   ├── KanbanCard.tsx            single kanban card
│   │   ├── NewProjectModal.tsx       create project dialog
│   │   └── EditProjectModal.tsx      edit project dialog
│   │
│   ├── pages/                        one file per screen in the app
│   │   ├── index.tsx                 entry point (login vs dashboard)
│   │   ├── _app.tsx                  loads global CSS
│   │   ├── _document.tsx             PWA manifest + meta tags
│   │   ├── LoginPage.tsx             login and registration screen
│   │   ├── DashboardPage.tsx         main app shell with sidebar
│   │   ├── ProjectPage.tsx           list and board view for a project
│   │   ├── InboxPage.tsx             quick task capture
│   │   ├── MyDayPage.tsx             tasks due today across all projects
│   │   ├── SearchPage.tsx            live search with filters
│   │   ├── SettingsPage.tsx          theme account and data export
│   │   └── api/                      serverless API endpoints
│   │       ├── auth/                 register login logout me update-username update-password
│   │       ├── projects/             get create update delete inbox
│   │       ├── lists/                get
│   │       └── tasks/                get create update toggle delete move search today export
│   │
│   ├── store/                        global state (Zustand)
│   │   ├── authStore.ts              login/logout/session
│   │   ├── appStore.ts               active view and projects list
│   │   ├── searchStore.ts            search query
│   │   └── themeStore.ts             dark/light mode
│   │
│   ├── lib/
│   │   ├── api.ts                    all fetch() calls to API routes
│   │   ├── db.js                     Neon database connection
│   │   └── auth.js                   JWT token helpers
│   │
│   ├── styles/
│   │   └── globals.css               Tailwind + global styles
│   │
│   └── types.ts                      shared TypeScript types
│
├── .env.local                        secret keys 
├── next.config.ts                    Next.js config
├── tailwind.config.ts                design system - colors fonts animations
└── package.json                      dependencies and build scripts
```

## Database Structure
Hosted on **Neon** 
```
users         → accounts (username + hashed password)
projects      → projects/workspaces
lists         → kanban columns (To Do In Progress Done)
tasks         → individual tasks
tags          → labels for tasks
task_tags     → connects tasks to tags (many-to-many)
notes         → comments on tasks
```

The **Inbox** is a special project auto-created on registration.

---
## How Auth Works
1. Register → password hashed with bcrypt (never stored plain)
2. Login → bcrypt compares password to stored hash
3. On success → JWT token created and stored in a secure HTTP-only cookie
4. Every API request → server reads the cookie and verifies the JWT
5. Logout → cookie is cleared
6. Session lasts 30 days automatically
---

## Commands

### Run in development mode
```powershell
npm run dev
```
Opens at http://localhost:3000

### Build for production (test before deploying)
```powershell
npm run build
```

### Run the database migration (creates tables)
```powershell
npm run migrate
```
Only needed once or for added tables.

### Deploy to production
```powershell
git add .
git commit -m ""
git push
```
Vercel auto-deploys when pushed to `main` branch.

---

## How to Install on Phone

### iPhone (Safari only - Chrome won't work for PWA on iOS)
1. Open **Safari**
2. Go to the Vercel URL
3. Tap **Share** and **"Add to Home Screen"**
4. Opens full screen like a native app

### Android (Chrome)
1. Open **Chrome**
2. Go to the Vercel URL
3. Tap the **three dots menu** (top right)
4. Tap **"Add to Home Screen"** or **"Install App"**
5. FocusFlow icon appears on home screen

---
##  Environment Variables
| `POSTGRES_URL` | Neon database connection string |
| `JWT_SECRET` | secret key for signing login tokens |

To get a new `POSTGRES_URL`:
1. Go to **neon.tech** → database → Dashboard
2. Copy the connection string
3. Make sure it ends with `?sslmode=require`
---