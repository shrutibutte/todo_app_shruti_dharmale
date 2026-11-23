# TaskFlow – Premium SaaS Productivity & Todo Application

TaskFlow is a modern, high-performance personal task management web application built with React, Vite, Tailwind CSS, Node.js, Express, and MongoDB Atlas.

---

## ✨ Features

- **Authentication & Security**:
  - JWT session management with auto-token attachments
  - Password hashing with bcrypt (salt rounds: 10)
  - Protected routes and strict user data isolation
- **Task Management (CRUD)**:
  - Create, view, edit, delete, and toggle completion with instant updates
  - Clean confirmation dialogs for safe deletion
- **Categories & Tagging**:
  - Color-coded categories: `Work` (Blue), `Personal` (Purple), `Study` (Emerald), `Finance` (Amber), `Health` (Rose), `General` (Slate)
  - Sidebar and top filter pills for instant category filtering
- **Interactive Kanban Board View**:
  - Switch between **List View** and **Board (Kanban) View** with a single click
  - Columns: **To Do**, **In Progress**, **Completed**
  - 1-click status transitions across columns with live counters
- **Checklist & Subtasks**:
  - Break tasks into actionable subtasks
  - Progress bar & completion indicators (e.g., `2/4 subtasks completed`)
  - Interactive checkboxes to toggle subtasks directly in the detail view
- **Priority System**:
  - `Low`, `Medium`, `High`, and `Urgent` (with animated flame alert badge)
- **1-Second Quick Task Creation**:
  - Inline input bar on Dashboard and Task list to quickly add tasks with priority and category without opening forms
- **Task Detail Drawer / Modal**:
  - Click on any task card to inspect full details
  - Interactive checklist to toggle subtasks
  - Attachment gallery with image previews and PDF download buttons
  - Relative time indicators (e.g., "Due in 2 days", "Overdue by 3 hours")
- **File Attachments**:
  - Upload JPG, PNG, WEBP images and PDF documents (up to 5MB, user-restricted access)
- **Due Dates & Overdue Alerts**:
  - Date and time pickers with relative formatting and red overdue alerts
- **Scheduled Reminders**:
  - `node-cron` backend checks for upcoming reminders and triggers in-app browser notifications
- **SaaS Productivity Dashboard**:
  - Real-time KPI statistic cards (Total, In Progress, Pending, Completed, Overdue)
  - Personalized time-of-day greeting header
  - Today's schedule and upcoming 7-day deadlines

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Zustand, Axios, Date-fns, React Hot Toast
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose), JWT, Bcrypt.js, Multer, Node-cron

---

## 📁 Directory Structure

```
TaskFlow/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── todoController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── models/
│   │   ├── Todo.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── todos.js
│   ├── services/
│   │   └── reminderService.js
│   ├── uploads/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.js
│   │   │   ├── axios.js
│   │   │   └── todos.js
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   └── StatCard.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── TopNav.jsx
│   │   │   ├── todos/
│   │   │   │   ├── DeleteConfirmDialog.jsx
│   │   │   │   ├── KanbanBoard.jsx
│   │   │   │   ├── QuickAddBar.jsx
│   │   │   │   ├── TaskDetailModal.jsx
│   │   │   │   ├── TodoCard.jsx
│   │   │   │   ├── TodoFilters.jsx
│   │   │   │   └── TodoModal.jsx
│   │   │   ├── ui/
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   └── Skeleton.jsx
│   │   │   ├── lib/
│   │   │   │   ├── constants.js
│   │   │   │   └── utils.js
│   │   │   ├── pages/
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   └── TodosPage.jsx
│   │   │   ├── store/
│   │   │   │   ├── authStore.js
│   │   │   │   └── todoStore.js
│   │   │   ├── App.jsx
│   │   │   ├── main.jsx
│   │   │   └── index.css
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── vite.config.js
├── architecture.md
├── design.md
├── phase.md
├── project-requirement.md
├── rules.md
└── README.md
```

---

## 🚀 Running Locally

### 1. Backend Server
```bash
cd backend
npm run dev
# or: node server.js
```
Runs on `http://localhost:5000` with automated reminder cron job.

### 2. Frontend Development Server
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` or `http://localhost:5174` in your browser.
