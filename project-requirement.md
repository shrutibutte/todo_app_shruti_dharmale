# TaskFlow — Project Requirements

## Product Vision

TaskFlow is a modern, premium SaaS-style personal task management application. It enables individual users to create, organize, track, and complete tasks with priorities, due dates, file attachments, and reminders — all within an elegant, responsive interface.

## Target Users

- Professionals managing daily work tasks
- Students tracking assignments and deadlines
- Anyone who wants a clean, functional todo application

## Problem Statement

Existing todo apps are either too simple (lacking priorities, attachments, reminders) or too complex (team features, enterprise overhead). TaskFlow fills the gap with a focused, polished, single-user productivity tool.

---

## Functional Requirements

### FR-1: Authentication
- **FR-1.1**: Users can register with name, email, and password.
- **FR-1.2**: Users can log in with email and password.
- **FR-1.3**: Users can log out (clear token client-side).
- **FR-1.4**: All task routes are protected; unauthenticated users are redirected to login.
- **FR-1.5**: Passwords are hashed with bcrypt before storage.
- **FR-1.6**: Authentication uses JWT tokens with expiration.

### FR-2: Todo CRUD
- **FR-2.1**: Users can create a todo with title, description, priority, due date, and reminder.
- **FR-2.2**: Users can edit any field of their own todos.
- **FR-2.3**: Users can delete their own todos.
- **FR-2.4**: Users can mark a todo as completed (toggleable).
- **FR-2.5**: Todos belong to the authenticated user; users cannot access others' data.

### FR-3: Priority and Status
- **FR-3.1**: Priority levels: Low, Medium, High.
- **FR-3.2**: Status values: Pending, Completed.
- **FR-3.3**: Priority is displayed as colored badges on todo cards.

### FR-4: File Attachments
- **FR-4.1**: Users can attach images (JPG, JPEG, PNG, WEBP) and PDF files.
- **FR-4.2**: Maximum file size: 5 MB per file, up to 3 files per todo.
- **FR-4.3**: Files are stored with generated filenames (UUID-based).
- **FR-4.4**: Users can preview images and download attachments.
- **FR-4.5**: Only the todo owner can access attachments (ownership check).
- **FR-4.6**: File type and size validation on both frontend and backend.

### FR-5: Due Date and Reminders
- **FR-5.1**: Users can set a due date and time on a todo.
- **FR-5.2**: Users can enable a reminder for a todo (reminderAt timestamp).
- **FR-5.3**: Backend node-cron job checks reminders every minute.
- **FR-5.4**: Reminders are marked as sent to prevent duplicates.
- **FR-5.5**: Frontend shows browser notifications for triggered reminders.
- **FR-5.6**: Overdue tasks are visually indicated on the dashboard and task list.

### FR-6: Dashboard
- **FR-6.1**: Shows personalized greeting and today's date.
- **FR-6.2**: Displays stat cards: Total, Pending, Completed, Overdue tasks.
- **FR-6.3**: Shows today's tasks section.
- **FR-6.4**: Shows upcoming deadlines section.
- **FR-6.5**: Quick Add Todo button for fast task creation.

### FR-7: Search and Filters
- **FR-7.1**: Search todos by title.
- **FR-7.2**: Filter by status (Pending / Completed).
- **FR-7.3**: Filter by priority (Low / Medium / High).

---

## Non-Functional Requirements

| ID | Requirement | Target |
|----|------------|--------|
| NFR-1 | Response time | API responses < 500ms |
| NFR-2 | Security | JWT auth, bcrypt hashing, ownership checks |
| NFR-3 | Responsiveness | Works on desktop and mobile |
| NFR-4 | Usability | Professional SaaS-quality UI |
| NFR-5 | Maintainability | Modular code, clear separation of concerns |
| NFR-6 | Environment | Secrets in env vars, never hardcoded |

---

## MVP Feature List

| Priority | Feature | Status |
|----------|---------|--------|
| P0 | User registration and login | Required |
| P0 | JWT authentication + protected routes | Required |
| P0 | Todo CRUD (create, read, update, delete) | Required |
| P0 | Priority and status management | Required |
| P0 | Dashboard with statistics | Required |
| P0 | Search and filters | Required |
| P1 | File attachments (image + PDF) | Required |
| P1 | Due date with overdue indicators | Required |
| P2 | Browser reminders (in-app) | Required |
| P2 | UI polish, empty/loading/error states | Required |

---

## Acceptance Criteria

1. User can register, log in, and log out.
2. User can create a todo with all fields (title, description, priority, due date).
3. User can edit and delete their own todos.
4. User can mark a todo as completed and uncomplete it.
5. Dashboard shows correct statistics.
6. Search and filters work correctly.
7. File upload works for images and PDFs with size/type validation.
8. Due date is displayed; overdue tasks are visually indicated.
9. Browser notifications appear for triggered reminders (while app is open).
10. UI is responsive, polished, and professional.
11. No user can access another user's todos or attachments.

---

## Out of Scope (MVP)

- Team collaboration / shared tasks
- AI-powered features
- Real-time WebSocket sync
- Push notifications (requires Web Push infrastructure)
- Advanced analytics / charts
- Recurring tasks / subtasks
- Calendar view / Kanban view
- Role-based access control
- Email notifications
- Two-factor authentication
