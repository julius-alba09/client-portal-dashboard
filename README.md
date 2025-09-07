# Client Portal Dashboard

A modern, full-stack web application that creates client-specific dashboards pulling data from Notion workspaces. Built with Next.js, TypeScript, and Tailwind CSS.

## 🌟 Features

### Core Functionality
- **Dynamic Client Dashboards**: Automatically generated dashboards for each client
- **Three Task Views**: Table, Kanban, and Calendar views for task management
- **Notion OAuth Integration**: Connect your own Notion workspace like Zapier, Todoist, or Monday.com
- **Database Auto-Discovery**: Automatically finds and validates your Notion databases
- **Real-time Data Sync**: Live synchronization with your existing Notion setup
- **Authentication System**: Role-based access control for clients and admins
- **Drag-and-Drop Updates**: Task status updates with live Notion synchronization
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### UI/UX Features
- **Notion-inspired Design**: Clean, minimal interface similar to Notion.so
- **Dark/Light Mode**: Full theme switching support
- **Accessible**: WCAG compliant with keyboard navigation
- **Interactive Elements**: Sortable tables, draggable Kanban cards, calendar navigation

### Technical Features
- **TypeScript**: Fully typed for better developer experience
- **Server-side Rendering**: Fast initial page loads with Next.js
- **API Routes**: RESTful API for data operations
- **Component Architecture**: Modular, reusable components
- **Error Handling**: Graceful fallbacks and error boundaries

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Notion workspace (optional, demo data available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd client-portal-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Demo Credentials

The application includes demo accounts for testing:

### Client Accounts
- **Email**: john@techcorp.com  
  **Password**: password123
- **Email**: sarah@designstudio.com  
  **Password**: password123
- **Email**: michael@startupventures.io  
  **Password**: password123

### Admin Account
- **Email**: admin@clientportal.com  
  **Password**: admin123

## 📊 Data Structure

The application expects three Notion databases with the following structure:

### Clients Database
| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Client name |
| Email | Email | Contact email |
| Company | Rich Text | Company name |
| Status | Select | active, inactive, pending |
| Avatar | Files & Media | Profile image |

### Projects Database
| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Project name |
| Description | Rich Text | Project details |
| Client | Relation | Link to Clients DB |
| Status | Select | not_started, in_progress, on_hold, completed, cancelled |
| Priority | Select | low, medium, high, urgent |
| Start Date | Date | Project start |
| Due Date | Date | Project deadline |
| Budget | Number | Project budget |

### Tasks Database
| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Task title |
| Description | Rich Text | Task details |
| Project | Relation | Link to Projects DB |
| Assignee | Rich Text | Person assigned |
| Status | Select | todo, in_progress, review, done, blocked |
| Priority | Select | low, medium, high, urgent |
| Due Date | Date | Task deadline |
| Estimated Hours | Number | Time estimate |
| Actual Hours | Number | Time spent |
| Tags | Multi-select | Task tags |

## ⚙️ Configuration

### Notion OAuth Integration

The Client Portal Dashboard integrates with Notion using OAuth 2.0, just like popular third-party apps. This means:

✅ **No manual token management** - Users connect through Notion's official OAuth flow  
✅ **Secure access** - Users maintain full control and can revoke access anytime  
✅ **Database discovery** - Automatically finds and validates your databases  
✅ **Easy setup** - Just like connecting Zapier or Todoist to Notion  

#### Quick Setup:

1. **Create OAuth Integration** in Notion
2. **Configure environment variables**
3. **Run the app and go to Settings**
4. **Click "Connect to Notion"** 
5. **Select your databases**
6. **Start syncing!**

📖 **[Complete Setup Guide](./docs/NOTION_SETUP.md)** - Detailed instructions with screenshots

#### Environment Variables:
```env
# Notion OAuth (get from your Notion integration)
NOTION_CLIENT_ID=your_oauth_client_id
NOTION_CLIENT_SECRET=your_oauth_client_secret
NOTION_REDIRECT_URI=http://localhost:3000/api/auth/notion/callback
```

### Authentication (Optional)

For production, replace the demo auth with a real provider:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

## 🏗️ Architecture

### Project Structure
```
src/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   ├── clients/[id]/      # Client dashboard pages
│   └── layout.tsx         # Root layout
├── components/
│   ├── layout/            # Layout components
│   └── tasks/             # Task view components
├── contexts/              # React contexts
├── lib/                   # Utilities and services
└── types/                 # TypeScript definitions
```

### Key Components

- **Layout System**: Responsive sidebar and navbar
- **Task Views**: Table, Kanban, Calendar implementations
- **Authentication**: Context-based auth with route protection
- **Theme System**: Dark/light mode with system preference detection
- **Notion Service**: API integration with fallback to demo data

## 🎨 Customization

### Styling
The application uses Tailwind CSS with a custom configuration supporting:
- Dark/light themes
- Notion-inspired color palette
- Responsive breakpoints
- Custom animations

### Adding New Views
To add a new task view:

1. Create component in `src/components/tasks/`
2. Implement the `TaskViewProps` interface
3. Add to `viewTypes` array in dashboard
4. Update navigation icons

### Extending Data Models
To add new properties:

1. Update TypeScript interfaces in `src/types/`
2. Modify Notion service functions
3. Update UI components to display new data

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables
Don't forget to set your environment variables in production:
- `NOTION_TOKEN`
- `NOTION_CLIENTS_DB_ID`
- `NOTION_PROJECTS_DB_ID`
- `NOTION_TASKS_DB_ID`

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run type-check   # TypeScript check
```

### Code Quality
- **ESLint**: Configured for Next.js and TypeScript
- **TypeScript**: Strict mode enabled
- **Prettier**: Code formatting (optional)

### Testing Strategy
- Unit tests for utility functions
- Component tests for UI elements
- Integration tests for API routes
- E2E tests for user workflows

## 📚 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Beautiful SVG icons
- **date-fns**: Date manipulation library

### Backend
- **Next.js API Routes**: Serverless functions
- **Notion SDK**: Official Notion API client

### State Management
- **React Context**: For theme and authentication
- **Local State**: Component-level state with hooks

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Static type checking
- **Git**: Version control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

## 🔮 Roadmap

### Upcoming Features
- [ ] Real-time notifications
- [ ] File upload integration
- [ ] Advanced filtering and search
- [ ] Mobile app (React Native)
- [ ] API rate limiting
- [ ] Webhook support for live updates
- [ ] Multi-language support
- [ ] Export functionality (PDF, Excel)
- [ ] Time tracking integration
- [ ] Team collaboration features

### Performance Improvements
- [ ] Implement caching strategy
- [ ] Optimize bundle size
- [ ] Add service worker for offline support
- [ ] Database indexing optimization

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
