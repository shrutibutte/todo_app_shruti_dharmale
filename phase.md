# TaskFlow — Implementation Phases

## Timeline: 90 Minutes (Solo Developer + AI Agent)

### Phase 1: Setup (0–10 min)

- [x] Create TaskFlow folder and 5 documentation files.
- [x] Create backend/ and frontend/ folders.
- [x] Initialize backend: package.json, server.js, config, .env.
- [x] Initialize frontend: Vite + React, Tailwind CSS, routing.
- [x] Install all dependencies.

**Exit criteria**: Both projects initialized, dependencies installed, dev servers start without errors.

### Phase 2: Backend Core (10–30 min)

- [x] MongoDB connection (config/db.js).
- [x] User model with bcrypt pre-save hook.
- [x] Todo model with all fields.
- [x] Auth middleware (JWT verification).
- [x] Auth controller: register, login, getMe.
- [x] Auth routes.
- [x] Todo controller: CRUD + complete toggle + stats.
- [x] Todo routes with auth middleware.
- [x] Error handler middleware.
- [x] Test: register, login, create todo via API.

**Exit criteria**: All API endpoints respond correctly. MongoDB persists data.

### Phase 3: Frontend Core (10–35 min)

- [x] Axios instance with JWT interceptor.
- [x] Auth store (Zustand): login, register, logout, token management.
- [x] Todo store (Zustand): CRUD operations, filters, stats.
- [x] Login and Register pages (polished UI).
- [x] Layout: Sidebar + TopNav + ProtectedRoute.
- [x] Dashboard page: stat cards + today's tasks.
- [x] Todos page: list + filters + search.
- [x] Todo card component with priority badge, due date, actions.
- [x] Add/Edit Todo modal with form.
- [x] Delete confirmation dialog.

**Exit criteria**: User can register, log in, see dashboard, create/edit/delete todos.

### Phase 4: Attachments (35–50 min)

- [x] Multer middleware configuration.
- [x] Upload endpoint (multipart/form-data on create/update todo).
- [x] Download endpoint with ownership check.
- [x] Frontend: file input in todo modal.
- [x] Frontend: attachment indicator on todo card.
- [x] Frontend: preview images, download PDFs.

**Exit criteria**: User can attach images/PDFs to todos, view and download them.

### Phase 5: Reminders & Polish (50–70 min)

- [x] Reminder fields on Todo model (reminderAt, reminderSent).
- [x] node-cron scheduler in backend (every 60 seconds).
- [x] Frontend: reminder toggle + datetime picker in modal.
- [x] Frontend: notification permission request.
- [x] Frontend: check for triggered reminders, show browser notification.
- [x] Loading skeletons, empty states, error states.
- [x] Toast notifications for all actions.

**Exit criteria**: Reminders trigger browser notifications. UI states are polished.

### Phase 6: Final Integration & QA (70–90 min)

- [x] End-to-end test: register → login → create todo → edit → complete → delete.
- [x] Test: file upload and download.
- [x] Test: reminders and notifications.
- [x] Test: search and filters.
- [x] Test: responsive design (mobile/desktop).
- [x] Fix console errors, broken imports, API issues.
- [x] Verify frontend production build.
- [x] Write README.md with setup instructions.

**Exit criteria**: Application is fully functional, polished, and documented.

---

## Priority Rules

| Priority | Features | Rule |
|----------|----------|------|
| P0 | Auth + CRUD + Dashboard + Filters | Must complete |
| P1 | Attachments + Due dates | Must complete |
| P2 | Reminders + UI polish | Should complete |

**If time runs out**: Ship P0 fully working. Never sacrifice a working app for incomplete features.

---

## Testing Checklist

- [ ] Register new user
- [ ] Login with credentials
- [ ] Dashboard shows correct stats
- [ ] Create todo with all fields
- [ ] Edit todo
- [ ] Delete todo (with confirmation)
- [ ] Mark todo as completed
- [ ] Search by title
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Upload image attachment
- [ ] Upload PDF attachment
- [ ] Preview/download attachment
- [ ] Set due date, verify overdue indicator
- [ ] Enable reminder, verify notification
- [ ] Responsive layout on mobile
- [ ] Logout and verify redirect

---

## Future Improvements (Post-MVP)

- Subtasks and nested todos
- Recurring tasks (daily/weekly/monthly)
- Calendar view and Kanban board
- Category/tag management
- Web Push notifications (service worker + VAPID)
- Drag-and-drop reordering
- Dark mode
- Export/import todos
- Bulk actions (delete, complete multiple)
- Real-time sync with WebSockets
- Cloud file storage (S3/Cloudinary)
- Email reminders
- Two-factor authentication
