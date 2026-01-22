# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 (App Router) frontend application for a Jira-like task management system. It provides user, project, and task management capabilities with a responsive UI built using Tailwind CSS 4.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Environment Configuration

The application requires environment variables defined in `.env` (see `.env.example` for template):
- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: http://localhost:8000)
- `NEXT_PUBLIC_FRONTEND_URL`: Frontend absolute URL (default: http://localhost:3000)
- `NODE_ENV`: Environment mode (development/production)

## Architecture

### App Router Structure

The application uses Next.js App Router with the following route hierarchy:

- `/` - Landing page (home)
- `/login` - Authentication page with Zod validation
- `/manage-users` - User management with add/delete operations
  - `/manage-users/add` - Add new user
- `/manage-projects` - Project management with CRUD operations
  - `/manage-projects/add` - Add new project
  - `/manage-projects/edit/[id]` - Edit existing project (dynamic route)
- `/manage-tasks` - Task management interface

All management pages use a shared layout component with sidebar navigation.

### Component Architecture

**Layout System:**
- `components/layouts/Layout.tsx` - Main layout wrapper with sidebar navigation
  - Provides responsive sidebar (hidden on mobile, fixed on desktop)
  - Manages navigation between management sections (Users, Projects, Tasks)
  - Uses Lucide React icons for navigation items
  - Accepts custom navigation items or uses defaults

- `components/layouts/Header.tsx` - Fixed header component
  - Displays "Jira Task (Mini)" branding
  - Supports optional back button navigation
  - Responsive design with mobile menu icon

**Key Patterns:**
- Client components use `"use client"` directive
- Form validation uses Zod schemas
- Navigation uses Next.js `useRouter` and `usePathname` hooks
- State management is local (useState) - no global state library

### Constants

Static data is stored in `constants/` directory:
- `level.js` - Employee levels (Senior, Middle, Junior)
- `position.js` - Employee positions
- `task-type.js` - Task type definitions

These are plain JavaScript objects exported as default, not TypeScript.

### Styling

- Tailwind CSS 4 with PostCSS configuration
- Custom fonts: Geist Sans and Geist Mono (loaded via next/font)
- Dark mode classes present but not actively implemented
- Responsive design with mobile-first approach
- Color scheme: Gray scale with accent colors (gray-900 for primary actions)

### TypeScript Configuration

- Path alias: `@/*` maps to root directory (`./`)
- Strict mode enabled
- Target: ES2017
- JSX: react-jsx (React 19)

## Development Notes

- API integration is mocked - actual API calls need to be implemented using `NEXT_PUBLIC_API_URL`
- Login page includes TODO comment for actual API authentication
- Management pages display dummy data - connect to backend to fetch real data
- No authentication/authorization system implemented yet
- No global state management - consider adding Context API or Zustand if needed
