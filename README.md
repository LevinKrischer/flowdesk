# Flowdesk – Kanban Board Application

A collaborative task management app built with Angular and Supabase. Manage tasks on a Kanban board, track contacts, and get an overview of your progress on the dashboard — all in real time.

> **Portfolio Demo** — Use the *Login as guest* button to explore all features without creating an account.

## Tech Stack

| Layer            | Technology                   |
| ---------------- | ---------------------------- |
| Frontend         | Angular 19+, TypeScript, SCSS |
| UI Framework     | Bootstrap 5 + Bootstrap Icons |
| Backend / Auth   | Supabase (BaaS)              |
| State Management | Angular Signals              |
| Version Control  | Git                          |

## Quick Start

```bash
# Clone repository
git clone <repository-url>
cd flowdesk

# Install dependencies
npm install

# Start development server
npm start

# Production build
ng build --configuration=production
```

### Environment Setup

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseKey: 'YOUR_SUPABASE_ANON_KEY',
  guestEmail: 'guest@example.com',
};
```

## Features

### Dashboard
- Personalised greeting with time-of-day awareness (first name only)
- Progress bar showing overall task completion rate
- Stat cards for To-do, In Progress, Await Feedback, Done, Urgent, Overdue, Total, and Upcoming Deadline
- Due-soon and overdue task lists with priority indicators

### Board (Kanban)
- Four status columns: To-do, In Progress, Await Feedback, Done
- Drag-and-drop task reordering
- Compact / expanded view toggle (persisted in localStorage)
- Full-text search across title and description
- Dropdown filters: Priority, Category, Due date (due soon / overdue), Assignees (multi-select)
- "Assigned to me" quick filter (hidden for guest sessions)
- Real-time updates via Supabase subscriptions

### Contacts
- Grouped contact list with alphabetical sections
- Contact detail view with inline edit and delete
- Add / edit form with validation (name, email, phone, notes)
- Responsive: list and detail side-by-side on desktop, full-screen detail on mobile

### Task Management
- Create tasks with title, description, due date, priority, category, subtasks, and assigned contacts
- Edit and delete tasks from the detail view
- Subtask completion tracking

### Auth
- Email / password sign-up and login
- Guest login (pre-configured demo account)
- Route guard protecting all pages behind authentication
- Intro animation on first login

## Project Architecture

```
src/app/
├── components/           # Standalone form components
│   ├── contact-add-form/
│   ├── contact-edit-form/
│   ├── login-form/
│   ├── signup-form/
│   └── task-add-form/
├── core/
│   ├── constants/        # Shared constants (colors, etc.)
│   ├── db/               # Supabase DB services (tasks, contacts, users)
│   ├── guards/           # Auth route guard
│   └── utils/            # Validation helpers, user-contact marker
├── interfaces/           # TypeScript interfaces (SingleTask, SingleContact)
├── layout/               # App shell (header, sidebar navigation)
├── pages/                # Route-level components
│   ├── board/            # Kanban board + task-card, task-detail, task-board
│   ├── contacts/         # Contact management + sub-views
│   ├── dashboard/        # Overview & stats
│   ├── add-task/         # Standalone add-task page
│   ├── login/ signup/    # Auth pages
│   └── help/ legal-notice/ privacy-policy/
├── services/             # Supabase service, InitialsPipe, TruncatePipe, HorizontalScrollDirective
└── shared/ui/            # Reusable UI components
    ├── button/           # ui-button (variant: primary | secondary | link | icon-sm)
    ├── forms/            # input-field, textarea, back-button, contact-picker, subtask-input-group
    ├── main/             # ui-main layout wrapper
    ├── modal-wrapper/    # ui-modal-wrapper
    └── user-feedback/    # Toast notifications
```

## Design System

- **Variables:** `src/styles/_variables.scss` — color tokens, spacing, border-radius, transitions
- **Mixins:** `src/styles/_mixins.scss` — `for-size()` responsive breakpoint mixin
- **BEM** class naming throughout all components
- Bootstrap Icons (`bi-*`) replace all custom SVG icon assets
- Transitions: 125 ms `ease-in-out` on interactive elements

## Browser Support

Chrome, Firefox, Edge, Safari (latest versions)

---

*Updated portfolio project*
