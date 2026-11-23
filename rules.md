# TaskFlow — Coding Rules and Conventions

## JavaScript Standards

- Use ES6+ syntax: `const`/`let`, arrow functions, template literals, destructuring.
- No `var`. Use `const` by default; `let` only when reassignment is needed.
- Use async/await for asynchronous operations (no raw callbacks).
- No TypeScript. Plain JavaScript only (.js for backend, .jsx for React components).

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files (components) | PascalCase.jsx | `TodoCard.jsx` |
| Files (backend) | camelCase.js | `authController.js` |
| Variables/functions | camelCase | `getUserTodos` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| React components | PascalCase | `StatCard` |
| CSS classes | Tailwind utilities | `className="text-sm font-medium"` |
| API routes | kebab-case | `/api/auth/register` |
| Database fields | camelCase | `reminderSent` |
| Environment vars | UPPER_SNAKE_CASE | `MONGODB_URI` |

## Component Guidelines

- One component per file.
- Keep components under 150 lines. Extract sub-components if needed.
- Use functional components with hooks only.
- Props: destructure in function signature.
- State management: Zustand stores for global state, `useState` for local UI state.
- Side effects: `useEffect` with proper dependency arrays and cleanup.

## API Response Format

All backend responses follow this structure:

```js
// Success
{ success: true, data: { ... } }

// Error
{ success: false, message: "Human-readable error message" }

// Paginated
{ success: true, data: { todos: [...], total: 42, page: 1, pages: 3 } }
```

HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad request / validation error
- 401: Unauthorized
- 403: Forbidden (not owner)
- 404: Not found
- 500: Server error

## Validation Rules

- **Backend**: Validate all inputs in controllers before database operations.
- **Frontend**: Validate forms before submission; show inline error messages.
- Never trust client-sent userId; always use `req.user.id` from auth middleware.
- Sanitize search inputs to prevent injection.

## Security Rules

1. Never hardcode secrets. Use environment variables.
2. Never expose `.env` files. Add to `.gitignore`.
3. Never return password fields in API responses.
4. Always hash passwords with bcrypt (salt rounds: 10).
5. JWT tokens expire after 7 days.
6. All todo operations filter by `user: req.user.id`.
7. File uploads: whitelist extensions, limit size, use generated filenames.
8. CORS: allow only the configured CLIENT_URL origin.
9. Never serve uploaded files without ownership verification.

## Error Handling

### Backend
- Wrap async controller logic in try/catch.
- Return consistent error responses with appropriate status codes.
- Use a global error handler middleware for unhandled errors.
- Log errors to console (production: use a logging service).

### Frontend
- Handle loading, success, and error states for every API call.
- Show toast notifications for success/error.
- Show empty states when no data.
- Show skeleton loaders during loading.
- Redirect to login on 401 responses.

## Environment Variables

### Backend (.env)
```
MONGODB_URI=<connection_string>
JWT_SECRET=<random_secret>
PORT=5000
CLIENT_URL=http://localhost:5174
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Git Practices

- Add `.gitignore` to both frontend and backend.
- Never commit `node_modules/`, `.env`, or `uploads/`.
- Write clear commit messages.
- Keep commits focused on one feature or fix.

## File Organization

- **API calls**: `src/api/` directory, one file per resource.
- **State**: `src/store/` directory, one Zustand store per domain.
- **UI components**: `src/components/ui/` for reusable primitives.
- **Layout components**: `src/components/layout/` for Sidebar, TopNav, Layout.
- **Feature components**: `src/components/dashboard/`, `src/components/todos/`.
- **Pages**: `src/pages/` — one file per route.
