# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development Workflow
```bash
# Start development server with Turbopack for faster builds
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Testing Single Components/Features
```bash
# Test specific client dashboard (replace {id} with client ID)
curl http://localhost:3000/api/clients/{id}

# Test Notion OAuth flow
curl http://localhost:3000/api/notion/databases

# Test task updates
curl -X PUT http://localhost:3000/api/tasks/{taskId} -H "Content-Type: application/json" -d '{"status": "done"}'
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Install dependencies
npm install

# Quick demo setup (uses dummy data)
npm run dev
# Navigate to http://localhost:3000
# Use demo credentials: john@techcorp.com / password123
```

## Architecture Overview

### Application Type & Framework
- **Next.js 15.5.2** with App Router architecture
- **TypeScript** with strict mode for type safety
- **Tailwind CSS 4.0** for styling with dark/light mode support
- **React 19** with modern hooks and patterns

### Core Architecture Patterns

#### Data Flow Architecture
- **Dual Data Sources**: Notion OAuth integration with dummy data fallback
- **API-First Design**: RESTful API routes in `src/app/api/` handle all data operations
- **Optimistic Updates**: UI updates immediately, syncs with Notion asynchronously
- **Graceful Degradation**: Falls back to demo data if Notion integration fails

#### Authentication & Authorization
- **Context-Based Auth**: `AuthContext` provides user state and role-based access
- **Role System**: Client users see only their data, admins see everything
- **Demo Credentials System**: Built-in test accounts for development
- **Route Protection**: `AuthGuard` component wraps protected pages

#### Component Architecture
- **Layout System**: Responsive sidebar/navbar with mobile-first design
- **Task View Polymorphism**: Three interchangeable views (Table, Kanban, Calendar) implementing `TaskViewProps` interface
- **Theme System**: Context-based dark/light mode with system preference detection
- **Drag-and-Drop**: Kanban board with live status updates to Notion

### Key Data Models

#### Core Entities (see `src/types/index.ts`)
- **Client**: Represents client companies with Notion workspace connections
- **Project**: Client-specific projects with status/priority tracking
- **Task**: Granular work items with multiple view representations
- **AuthUser**: User authentication with role-based permissions

#### Notion Integration Schema
- **Clients Database**: Name (Title), Email, Company, Status (Select), Avatar (Files)
- **Projects Database**: Name (Title), Client (Relation), Status/Priority (Select), Dates, Budget
- **Tasks Database**: Name (Title), Project (Relation), Status/Priority (Select), Assignee, Hours, Tags

### Critical Code Locations

#### Notion Integration (`src/lib/`)
- `notion-oauth.ts`: OAuth 2.0 flow, database discovery, token management
- `notion-data.ts`: Data fetching and synchronization with Notion APIs  
- `dummy-data.ts`: Fallback demo data matching Notion schema exactly
- `notion.ts.disabled`: Legacy token-based integration (keep for reference)

#### UI Components (`src/components/`)
- `layout/Layout.tsx`: Main application shell with responsive sidebar
- `tasks/`: Three view implementations sharing common `TaskViewProps` interface
  - `TableView.tsx`: Sortable data table with inline editing
  - `KanbanView.tsx`: Drag-drop board with status updates
  - `CalendarView.tsx`: Date-based task visualization

#### Context Providers (`src/contexts/`)
- `AuthContext.tsx`: User authentication, login/logout, role management
- `ThemeContext.tsx`: Dark/light mode with localStorage persistence

#### API Routes (`src/app/api/`)
- `clients/[id]/route.ts`: Client dashboard data with Notion fallback
- `notion/databases/route.ts`: Database discovery for OAuth setup
- `tasks/[id]/route.ts`: Task CRUD operations with Notion sync

### Development Patterns

#### Error Handling Strategy
- **Notion Fallback Pattern**: Always try Notion first, gracefully fall back to dummy data
- **API Error Responses**: Consistent JSON error format with success flags
- **UI Error Boundaries**: Graceful degradation for component failures

#### State Management
- **No Global State**: Uses React Context for theme/auth, component state for UI
- **Optimistic Updates**: UI updates immediately, background sync with Notion
- **Data Fetching**: API routes handle all external data operations

#### Styling Conventions
- **Tailwind CSS**: Utility-first with custom dark mode classes
- **Responsive Design**: Mobile-first breakpoints (sm:, md:, lg:, xl:)
- **Component Variants**: Use `clsx` for conditional styling
- **Notion-Inspired Design**: Clean, minimal interface matching Notion.so aesthetics

### Environment Variables
```env
# Notion OAuth (for production integration)
NOTION_CLIENT_ID=your_oauth_client_id
NOTION_CLIENT_SECRET=your_oauth_client_secret  
NOTION_REDIRECT_URI=http://localhost:3000/api/auth/notion/callback

# NextAuth (for production auth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

### Key Development Notes

#### When Working with Tasks
- All task views implement `TaskViewProps` interface
- Status changes trigger Notion API updates in background
- Use `onTaskUpdate(taskId, updates)` pattern for consistency
- Priority and status use controlled vocabularies defined in types

#### When Adding New Features
- Follow the Notion-first, dummy-data-fallback pattern
- Add TypeScript types to `src/types/index.ts`
- Create API routes in `src/app/api/` following existing patterns
- Update dummy data to match new Notion schema requirements

#### Notion Integration Guidelines
- Use OAuth 2.0 flow, not internal integration tokens
- Validate database structure before attempting data sync
- Handle rate limits and API errors gracefully
- Always provide demo data equivalent for development

## Common Tasks

### Adding a New Task View
1. Create component in `src/components/tasks/` implementing `TaskViewProps`
2. Add to view selector in client dashboard
3. Update type definitions if needed
4. Test with both Notion and dummy data

### Debugging Notion Integration
```bash
# Check OAuth configuration
curl http://localhost:3000/api/notion/auth

# List available databases  
curl http://localhost:3000/api/notion/databases

# Test database validation
curl http://localhost:3000/api/notion/validate/{database_id}
```

### Extending Data Models
1. Update TypeScript interfaces in `src/types/index.ts`
2. Update dummy data in `src/lib/dummy-data.ts`
3. Update Notion integration functions
4. Update UI components to display new properties
