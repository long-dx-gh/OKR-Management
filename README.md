# OKR Platform - Quản lý Mục tiêu và Kết quả chính

A modern OKR (Objectives and Key Results) management platform built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **OKR Management**: Create, track, and manage objectives and key results
- **Real-time Updates**: Optimistic UI with Supabase real-time subscriptions
- **Analytics Dashboard**: Visualize team performance and progress
- **Activity Feed**: Track all changes and updates
- **Kanban Board**: Visual board view for OKRs
- **Network Visualization**: Interactive graph visualization of OKR relationships
- **Comments & Collaboration**: Add comments to objectives for team collaboration
- **Authentication**: Secure login with Supabase Auth

## 📁 Project Structure

```
OKR/
├── src/
│   ├── app/                      # Application entry points
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # Entry point
│   │
│   ├── components/               # React components (organized by feature)
│   │   ├── auth/                # Authentication components
│   │   ├── dashboard/           # Dashboard & analytics
│   │   ├── kanban/              # Kanban board view
│   │   ├── layout/              # Layout components (Sidebar, etc.)
│   │   ├── modals/              # Modal dialogs
│   │   ├── okr/                 # OKR list, detail, card components
│   │   ├── comments/            # Comment system
│   │   ├── visualization/       # OKR visualization & charts
│   │   ├── shared/              # Shared/common components
│   │   └── ui/                  # UI primitives (shadcn/ui)
│   │
│   ├── services/                 # Business logic & API services
│   │   ├── analytics.service.ts
│   │   ├── comment.service.ts
│   │   ├── okr.service.ts
│   │   ├── visualization.service.ts
│   │   └── supabase.ts
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useOptimisticObjectives.ts
│   │   ├── useOptimisticKeyResults.ts
│   │   ├── useToast.ts
│   │   └── useVisualization.ts
│   │
│   ├── contexts/                 # React contexts
│   │   └── AuthContext.tsx
│   │
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── utils/                    # Utility functions
│   │   └── cn.ts
│   │
│   └── styles/                   # Global styles
│       └── globals.css
│
├── scripts/                      # Database scripts
│   ├── confirm-email.sql
│   └── supabase-v1-analytics.sql
│
├── docs/                         # Documentation
│   ├── README.md
│   ├── DEPLOY_GITHUB_PAGES.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── OPTIMISTIC_UI_REFACTOR.md
│   ├── TEST_PROGRESS_CALCULATION.md
│   └── VISUAL_GUIDE.md
│
└── public/                       # Static assets
    └── 404.html

```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Visualization**: ReactFlow (D3.js)
- **Build Tool**: Vite
- **Routing**: React Router v7

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd OKR

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase credentials to .env

# Run development server
npm run dev
```

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to GitHub Pages

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 Database Setup

Run the SQL scripts in the `scripts/` directory in your Supabase SQL editor:

1. `scripts/confirm-email.sql` - Email confirmation setup
2. `scripts/supabase-v1-analytics.sql` - Analytics tables and functions

## 🎯 Key Features Explained

### Optimistic UI Updates
The application uses optimistic UI patterns for instant feedback:
- Immediate UI updates before server confirmation
- Automatic rollback on errors
- Real-time sync with Supabase

### Component Organization
Components are organized by feature for better maintainability:
- **Feature-based folders**: Each feature has its own folder
- **Co-location**: Related components are grouped together
- **Clear dependencies**: Imports follow a consistent pattern

### Service Layer
Business logic is separated into service files:
- Clean separation of concerns
- Reusable across components
- Easy to test and maintain

## 📝 Documentation

Detailed documentation is available in the `docs/` folder:

- [Deployment Guide](docs/DEPLOY_GITHUB_PAGES.md)
- [Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)
- [Optimistic UI Refactor](docs/OPTIMISTIC_UI_REFACTOR.md)
- [Visual Guide](docs/VISUAL_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Authors

- Development Team

## 🙏 Acknowledgments

- shadcn/ui for the beautiful component library
- Supabase for the backend infrastructure
- React team for the amazing framework
