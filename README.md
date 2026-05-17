# FocusFlow Web — My Personal Task Manager (Web + Mobile PWA)
> Next.js + React + PostgreSQL + Vercel

This is my notes file for the web version of FocusFlow — accessible from any browser and installable on my phone as a PWA (Progressive Web App).

---

## 📍 Where Everything Lives

```
Project folder (local):
C:\Users\colin\OneDrive\Desktop\focusflow-web\

Live URL:
https://focusflow-web.vercel.app  (or whatever your Vercel URL is)

GitHub repo:
https://github.com/Cwhitey6/focusflow-web

Database:
Neon PostgreSQL (cloud) — managed at neon.tech

Environment variables:
C:\Users\colin\OneDrive\Desktop\focusflow-web\.env.local
```

---

## 🧠 How The App Is Built

```
FRONTEND                        BACKEND (API Routes)
────────────────────────        ────────────────────────────
React + TypeScript              Next.js Serverless Functions
Tailwind CSS                    Neon PostgreSQL database
Zustand (state)                 bcrypt (password hashing)
Lives in: src/                  JWT cookies (session auth)
                                Lives in: src/pages/api/
```

Everything is hosted on **Vercel** — pushing to GitHub auto-deploys.

---

## 🗂️ Folder Structure

```
focusflow-web/
├── src/
│   ├── pages/                    ← Next.js pages + API routes
│   │   ├── index.tsx             ← Entry point (login vs dashboard)
│   │   ├── _app.tsx              ← Loads global CSS
│   │   ├── _document.tsx         ← PWA manifest + meta tags
│   │   └── api/                  ← Serverless API endpoints
│   │       ├── auth/
│   │       │   ├── register.js
│   │       │   ├── login.js
│   │       │   ├── logout.js
│   │       │   ├── me.js
│   │       │   ├── update-username.js
│   │       │   └── update-password.js
│   │       ├── projects/
│   │       │   ├── get.js
│   │       │   ├── create.js
│   │       │   ├── update.js
│   │       │   ├── delete.js
│   │       │   └── inbox.js
│   │       ├── lists/
│   │       │   └── get.js
│   │       └── tasks/
│   │           ├── get.js
│   │           ├── create.js
│   │           ├── update.js
│   │           ├── toggle.js
│   │           ├── delete.js
│   │           ├── move.js
│   │           ├── search.js
│   │           ├── today.js
│   │           └── export.js
│   │
│   ├── components/               ← Reusable UI components
│   │   ├── Sidebar.tsx           ← Desktop sidebar + mobile drawer
│   │   ├── TopBar.tsx            ← Search bar + page title
│   │   ├── TaskRow.tsx           ← Single task in list view
│   │   ├── TaskDetailModal.tsx   ← Edit task drawer
│   │   ├── AddTaskBar.tsx        ← Quick add task input
│   │   ├── KanbanBoard.tsx       ← Drag and drop board
│   │   ├── KanbanCard.tsx        ← Single kanban card
│   │   ├── NewProjectModal.tsx   ← Create project dialog
│   │   └── EditProjectModal.tsx  ← Edit project dialog
│   │
│   ├── pages/ (React pages)      ← Full page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ProjectPage.tsx
│   │   ├── InboxPage.tsx
│   │   ├── MyDayPage.tsx
│   │   ├── SearchPage.tsx
│   │   └── SettingsPage.tsx
│   │
│   ├── store/                    ← Global state (Zustand)
│   │   ├── authStore.ts          ← Login/logout/session
│   │   ├── appStore.ts           ← Active view, projects list
│   │   ├── searchStore.ts        ← Search query
│   │   └── themeStore.ts         ← Dark/light mode
│   │
│   ├── lib/
│   │   ├── api.ts                ← All fetch() calls to API routes
│   │   ├── db.js                 ← Neon database connection
│   │   └── auth.js               ← JWT token helpers
│   │
│   ├── styles/
│   │   └── globals.css           ← Tailwind + global styles
│   │
│   └── types.ts                  ← Shared TypeScript types
│
├── public/
│   ├── manifest.json             ← PWA config (makes it installable)
│   ├── android-chrome-192x192.png ← App icon (phone home screen)
│   └── android-chrome-512x512.png ← App icon (large)
│
├── lib/                          ← (empty, moved to src/lib)
├── .env.local                    ← Secret keys (never commit this)
├── next.config.ts                ← Next.js config
├── tailwind.config.ts            ← Tailwind colors + animations
└── package.json                  ← Dependencies + scripts
```

---

## 💾 Database Structure

Hosted on **Neon** (free tier PostgreSQL in the cloud).

```
users         → accounts (username + hashed password)
projects      → projects/workspaces
lists         → kanban columns (To Do, In Progress, Done)
tasks         → individual tasks
tags          → labels for tasks
task_tags     → connects tasks to tags (many-to-many)
notes         → comments on tasks
```

The **Inbox** is a special project auto-created on registration.

---

## 🔐 How Auth Works

1. Register → password hashed with **bcrypt** (never stored plain)
2. Login → bcrypt compares password to stored hash
3. On success → **JWT token** created and stored in a secure **HTTP-only cookie**
4. Every API request → server reads the cookie and verifies the JWT
5. Logout → cookie is cleared
6. Session lasts **30 days** automatically

This is more secure than the desktop version's localStorage approach because the token is in an HTTP-only cookie — JavaScript can't read it, protecting against XSS attacks.

---

## 🖥️ Commands

### Navigate to project
```powershell
cd "C:\Users\colin\OneDrive\Desktop\focusflow-web"
```

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
Only needed once, or if you add new tables.

### Deploy to production
```powershell
git add .
git commit -m "Your message here"
git push
```
Vercel auto-deploys when you push to the `main` branch.

---

## 🚀 How to Deploy a New Version

1. Make your changes in VS Code
2. Test locally:
```powershell
npm run dev
```
3. Build check:
```powershell
npm run build
```
4. Push to GitHub:
```powershell
git add .
git commit -m "What I changed"
git push
```
5. Vercel deploys automatically — watch at **vercel.com/dashboard**
6. Usually takes 1-2 minutes

---

## 📱 How to Install on Phone

### iPhone (Safari only — Chrome won't work for PWA on iOS)
1. Open **Safari** on your iPhone
2. Go to your Vercel URL
3. Tap the **Share button** (square with arrow pointing up)
4. Scroll down and tap **"Add to Home Screen"**
5. Tap **"Add"**
6. FocusFlow icon appears on home screen
7. Opens full screen like a native app

### Android (Chrome)
1. Open **Chrome** on your Android
2. Go to your Vercel URL
3. Tap the **three dots menu** (top right)
4. Tap **"Add to Home Screen"** or **"Install App"**
5. Tap **"Install"**
6. FocusFlow icon appears on home screen

---

## 🎨 How to Change the App Icon

1. Go to **https://favicon.io/favicon-generator/**
2. Click **"Text"** tab
3. Enter your desired letter/text
4. Set background to `#7c6af7` (purple) or any color
5. Set font color to white
6. Click **"Generate"** → **"Download"**
7. Extract the zip
8. Copy `android-chrome-192x192.png` and `android-chrome-512x512.png` to `public/`
9. Push to GitHub — icon updates automatically

To uninstall and reinstall the PWA on your phone after changing the icon:
- iPhone: long press the icon → Remove App → reinstall from Safari
- Android: long press → Uninstall → reinstall from Chrome

---

## 🌗 Dark / Light Mode

Toggle in **Settings → Appearance**.
Preference is saved to localStorage on the device.
Default is dark mode.

---

## 🔧 Environment Variables

These live in `.env.local` locally and in **Vercel → Settings → Environment Variables** for production.

| Variable | What it does |
|---|---|
| `POSTGRES_URL` | Neon database connection string |
| `JWT_SECRET` | Secret key for signing login tokens |

**Never commit `.env.local` to GitHub.** It's in `.gitignore` automatically.

To get a new `POSTGRES_URL`:
1. Go to **neon.tech** → your database → Dashboard
2. Copy the connection string
3. Make sure it ends with `?sslmode=require` (remove `&channel_binding=require` if present)

---

## ➕ How to Add a New Feature

Same pattern every time. Example: adding a "star task" feature.

### 1. Add column to database (if needed)
Run a migration SQL directly in Neon's SQL editor:
```sql
ALTER TABLE tasks ADD COLUMN starred BOOLEAN NOT NULL DEFAULT FALSE;
```

### 2. Create the API route
Create `src/pages/api/tasks/star.js`:
```javascript
const sql = require('../../lib/db.js');
const { getUserFromRequest } = require('../../lib/auth.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = getUserFromRequest(req);
  if (!user) return res.json({ success: false, error: 'Not authenticated' });

  const { id, starred } = req.body;
  await sql`UPDATE tasks SET starred=${starred} WHERE id=${id} AND user_id=${user.id}`;
  res.json({ success: true, data: true });
};
```

### 3. Add to the API client
In `src/lib/api.ts`, add to the tasks section:
```typescript
star: (id: string, starred: boolean) =>
  request('/api/tasks/star', {
    method: 'POST',
    body: JSON.stringify({ id, starred }),
  }),
```

### 4. Use it in a component
```typescript
await api.tasks.star(task.id, true);
```

---

## 🐛 Common Issues & Fixes

**Styles not showing (unstyled page)**
→ Check that `src/pages/_app.tsx` exists and imports `../styles/globals.css`

**"Something went wrong" on login**
→ Check Vercel environment variables — `POSTGRES_URL` and `JWT_SECRET` must be set
→ Check Vercel Function Logs for the actual error

**App shows default Next.js page**
→ Check that `src/pages/index.tsx` exists and imports from the right paths
→ Make sure there's no `app/` folder conflicting with `pages/`

**Database connection error**
→ Make sure `POSTGRES_URL` ends with `?sslmode=require`
→ Remove `&channel_binding=require` if present

**PWA icon not updating on phone**
→ Uninstall the app from home screen, clear browser cache, reinstall

**Session not persisting**
→ JWT cookie might not be set correctly in dev — try in production (Vercel URL)
→ Make sure `JWT_SECRET` env var is set on Vercel

**Build fails on Vercel but works locally**
→ Run `npm run build` locally first — if it fails locally, fix it before pushing
→ Check that all environment variables are set in Vercel dashboard

**Changes not showing after push**
→ Check Vercel dashboard → Deployments — is the latest one green?
→ Hard refresh the browser: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

---

## 📦 Dependencies

### Frontend
| Package | What it does |
|---|---|
| next | React framework with routing and API routes |
| react | UI framework |
| typescript | Type safety |
| tailwindcss | Utility CSS |
| zustand | Global state management |
| lucide-react | Icons |

### Backend (API Routes)
| Package | What it does |
|---|---|
| @neondatabase/serverless | Neon PostgreSQL driver |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT session tokens |
| cookie | Parse/set HTTP cookies |
| uuid | Generate unique IDs |
| dotenv | Load .env.local for migration script |

---

## 🔮 Future Ideas

- [ ] Push notifications for due tasks
- [ ] Offline support (service worker cache)
- [ ] Share projects with other users
- [ ] Calendar view
- [ ] Subtasks
- [ ] Recurring tasks
- [ ] File attachments on tasks
- [ ] Custom themes / accent colors
- [ ] Task comments/notes thread

---

## 📋 Tech Stack Summary

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

---

*Last updated: May 2026*
*Version: 0.1.0*
