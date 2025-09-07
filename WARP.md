# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Context

This is a client portal dashboard application that creates client-facing dashboards from Notion workspaces. It manages three core entities: Clients, Projects, and Tasks (Client -> Project -> Task relationship). The application allows clients to view their projects and tasks through filtered dashboards, with OAuth integration to Notion.

**Tech Stack (MVP Phase):**
- **Frontend**: Next.js 15.5.2 with App Router
- **Authentication**: NextAuth.js with Google OAuth + demo credentials
- **Database**: Prisma (configured but using dummy data for MVP)
- **Notion Integration**: Notion API with OAuth 2.0
- **UI**: Tailwind CSS 4.0 with Headless UI components
- **Drag & Drop**: React DnD for Kanban board
- **Icons**: Heroicons and Lucide React

**Development Philosophy:** Currently in MVP phase using dummy data for rapid prototyping. Authentication is functional, Notion OAuth is implemented, and three task view types are working (Table, Kanban, Calendar). Ready for database integration when needed.

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

### Testing Authentication Flow
```bash
# Test demo login (use these credentials in browser)
# Client: john@techcorp.com / password123
# Admin: admin@clientportal.com / admin123

# Test API endpoints
curl http://localhost:3000/api/clients/1
curl http://localhost:3000/api/tasks/1
```

### Testing Notion Integration
```bash
# Test Notion OAuth authorization
curl http://localhost:3000/api/auth/notion/authorize

# Test database discovery
curl http://localhost:3000/api/notion/databases

# Test database configuration
curl -X POST http://localhost:3000/api/notion/databases/configure \
  -H "Content-Type: application/json" \
  -d '{"clientsDbId": "db_id", "projectsDbId": "db_id", "tasksDbId": "db_id"}'
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Install dependencies
npm install

# Start development server (uses dummy data by default)
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
- **NextAuth.js** for authentication with Google OAuth
- **Prisma** as ORM (configured for future database integration)

### Core Architecture Patterns

#### Data Flow Architecture (Current MVP)
- **Primary Data Source**: Dummy data in TypeScript files (`src/lib/dummy-data.ts`)
- **Notion Integration**: OAuth 2.0 flow for connecting user workspaces
- **API Routes**: Next.js API routes for client/task data and Notion integration
- **Future Database**: Prisma configured for PostgreSQL when ready to migrate from dummy data
- **Client Filtering**: Data filtered by client_id in API routes

#### Authentication & Authorization
- **NextAuth.js**: JWT-based authentication with session management
- **Google OAuth**: Primary authentication method (requires setup)
- **Demo Credentials**: Hardcoded credentials for development testing
- **Route Protection**: Middleware-based protection for authenticated routes
- **Role System**: Client vs Admin user types (stored in dummy data)
- **Session Persistence**: NextAuth handles session state and cookies

#### Component Architecture
- **Layout System**: Responsive sidebar/navbar with mobile-first design
- **Task View Polymorphism**: Three interchangeable views (Table, Kanban, Calendar) implementing `TaskViewProps` interface
- **Context Providers**: Theme and Auth contexts for global state management
- **Drag-and-Drop**: React DnD for Kanban board interactions
- **Notion OAuth Flow**: Multi-step authorization and database configuration

### Key Data Models

#### TypeScript Types (see `src/types/index.ts`)
- **Client**: Core client entity with company info and status
  - Fields: id, name, email, company, avatar, status, notion_id
  - Status: 'active' | 'inactive' | 'pending'
- **Project**: Project entity with client relationship
  - Fields: id, name, description, client_id, status, priority, dates, budget
  - Status: 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  - Priority: 'low' | 'medium' | 'high' | 'urgent'
- **Task**: Task entity with project relationship and time tracking
  - Fields: id, title, description, project_id, assignee, status, priority, due_date, hours, tags
  - Status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'
- **ViewType**: Task view types ('table' | 'kanban' | 'calendar')
- **AuthUser**: User authentication type with role-based access

#### Current Data Source (MVP)
- **Dummy Data**: All data stored in `src/lib/dummy-data.ts`
- **Helper Functions**: Client/project/task relationships with filtering
- **API Routes**: Serve dummy data filtered by client_id
- **Future Migration**: Ready for Prisma database integration

#### Notion Integration Schema (Expected)
- **Clients Database**: Name (Title), Email, Company, Status (Select), Avatar (Files)
- **Projects Database**: Name (Title), Client (Relation), Status/Priority (Select), Dates, Budget
- **Tasks Database**: Name (Title), Project (Relation), Status/Priority (Select), Assignee, Hours, Tags

### Critical Code Locations

#### Data Layer (`src/lib/`)
- `dummy-data.ts`: All client, project, and task data with helper functions
- `notion-oauth.ts`: Notion OAuth 2.0 flow implementation
- `notion-data.ts`: Notion API integration for data fetching
- `notion.ts.disabled`: Legacy Notion integration (disabled)

#### Authentication (`src/app/api/auth/`)
- `[...nextauth]/route.ts`: NextAuth.js configuration with Google OAuth
- `notion/authorize/route.ts`: Notion OAuth authorization endpoint
- `notion/callback/route.ts`: Notion OAuth callback handler

#### UI Components (`src/components/`)
- `layout/`: Application shell components
  - `Layout.tsx`: Main layout with NextAuth session
  - `Navbar.tsx`: Top navigation with user menu
  - `Sidebar.tsx`: Side navigation for dashboard
- `tasks/`: Task view implementations
  - `TableView.tsx`: Sortable data table
  - `KanbanView.tsx`: Drag-drop board with React DnD
  - `CalendarView.tsx`: Calendar-based task visualization
- `onboarding/`: Multi-step onboarding flow
- `search/`: Global search functionality

#### Context Providers (`src/contexts/`)
- `AuthContext.tsx`: NextAuth integration and user state
- `ThemeContext.tsx`: Dark/light mode with localStorage persistence
- `providers/SessionProvider.tsx`: NextAuth session wrapper

#### API Routes (`src/app/api/`)
- `clients/[id]/route.ts`: Client dashboard data from dummy-data
- `tasks/[id]/route.ts`: Individual task operations
- `notion/databases/`: Notion database discovery and configuration
- `search/route.ts`: Global search across entities

### Development Patterns

#### NextAuth.js Integration Workflow
- **Session Management**: Use NextAuth session hooks and server-side helpers
- **Route Protection**: Implement middleware for protected routes
- **OAuth Configuration**: Set up Google and Notion OAuth providers
- **Demo Credentials**: Use hardcoded credentials for development testing
- **Type Safety**: Extend NextAuth types for custom user properties

#### Dummy Data Development
- **Data Structure**: All entities in `dummy-data.ts` with relationships
- **Helper Functions**: Use provided filtering and joining utilities
- **API Simulation**: API routes serve dummy data with realistic responses
- **Client Isolation**: Filter data by client_id to simulate multi-tenancy
- **Migration Ready**: Data structure matches expected database schema

#### Component Architecture Patterns
- **Task View Abstraction**: All views implement `TaskViewProps` interface
- **Drag-and-Drop**: React DnD for Kanban with status updates
- **Context Usage**: Theme and Auth contexts for global state
- **Responsive Design**: Mobile-first with Tailwind breakpoints
- **Error Boundaries**: Graceful fallbacks for component failures

#### Notion Integration Patterns
- **OAuth Flow**: Multi-step authorization with callback handling
- **Database Discovery**: Auto-detect and validate Notion databases
- **Rate Limiting**: Respect 3 requests/second Notion API limits
- **Error Handling**: Graceful degradation when Notion is unavailable
- **Future Sync**: Architecture ready for bidirectional synchronization

### Environment Variables
```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth (for production)
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Notion OAuth (for production integration)
NOTION_CLIENT_ID=your_oauth_client_id
NOTION_CLIENT_SECRET=your_oauth_client_secret  
NOTION_REDIRECT_URI=http://localhost:3000/api/auth/notion/callback

# Database (for future Prisma integration)
DATABASE_URL=your_database_url
```

### Key Development Notes

#### When Working with NextAuth.js
- Always check session state before accessing user data
- Use middleware for route protection patterns
- Extend NextAuth types for custom user properties
- Test OAuth flows with proper redirect URLs

#### When Working with Dummy Data
- Use helper functions for data relationships
- Filter by client_id to simulate multi-tenancy
- Keep data structure consistent with expected database schema
- Update dummy data when testing new features

#### When Building Notion Integration
- Respect Notion API rate limits (3 requests/second)
- Handle OAuth authorization errors gracefully
- Validate database schema before configuration
- Store OAuth tokens securely for production

#### When Implementing UI Components
- Use TaskViewProps interface for consistent task views
- Implement responsive design with Tailwind breakpoints
- Handle loading and error states gracefully
- Test drag-and-drop interactions across devices

## Common Tasks

### Adding New Task View Types
```typescript
// 1. Create new view component implementing TaskViewProps
interface TaskViewProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
}

// 2. Add to ViewType union in src/types/index.ts
export type ViewType = 'table' | 'kanban' | 'calendar' | 'your_new_view';

// 3. Update dashboard component to include new view option
```

### Extending Dummy Data
```typescript
// Add new dummy entities in src/lib/dummy-data.ts
export const dummyNewEntity = [
  {
    id: '1',
    // ... your fields
    client_id: '1', // Always include for client filtering
    notion_id: 'notion_entity_1' // For future Notion sync
  }
];

// Add helper functions
export function getNewEntitiesByClientId(clientId: string) {
  return dummyNewEntity.filter(entity => entity.client_id === clientId);
}
```

### Setting Up New API Routes
```typescript
// Create new route in src/app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Your API logic here
  return NextResponse.json({ data: yourData });
}
```

### Configuring NextAuth Providers
```typescript
// Add new provider in src/app/api/auth/[...nextauth]/route.ts
import YourProvider from 'next-auth/providers/your-provider';

export const authOptions = {
  providers: [
    // ... existing providers
    YourProvider({
      clientId: process.env.YOUR_PROVIDER_CLIENT_ID!,
      clientSecret: process.env.YOUR_PROVIDER_CLIENT_SECRET!,
    }),
  ],
  // ... rest of config
};
```

### Creating Bordio-Level Components
```typescript
// Example: Smooth button with bordio-style interactions
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', ...props }) => (
  <motion.button
    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
      variant === 'primary' 
        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
    }`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.15, ease: 'easeOut' }}
    {...props}
  >
    {children}
  </motion.button>
);
```

### Implementing Smooth Kanban Interactions
```typescript
// Bordio-style drag and drop with physics
import { motion, useMotionValue } from 'framer-motion';

const TaskCard = ({ task, onMove }) => {
  const y = useMotionValue(0);
  
  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      style={{ y }}
      whileDrag={{ 
        scale: 1.05, 
        rotate: 2,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)' 
      }}
      onDragEnd={(event, info) => {
        if (Math.abs(info.offset.y) > 100) {
          onMove(task.id, info.offset.y > 0 ? 'next' : 'prev');
        }
      }}
    >
      {/* Task content */}
    </motion.div>
  );
};
```