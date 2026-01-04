# 🎯 OKR Management Platform

> A modern, real-time OKR (Objectives and Key Results) management platform built with React, TypeScript, and Supabase.

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://long-dx-gh.github.io/OKR-Management/)
[![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://long-dx-gh.github.io/OKR-Management/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-green?style=for-the-badge&logo=supabase)](https://supabase.com)

---

## 🚀 Live Demo

**Try it now**: [https://long-dx-gh.github.io/OKR-Management/](https://long-dx-gh.github.io/OKR-Management/)

---

## ✨ Features

### 📊 **OKR Management**
- ✅ Create and manage objectives with key results
- ✅ Track progress with visual progress bars
- ✅ Set due dates and owners
- ✅ Status tracking (on-track, at-risk, off-track)

### 🔄 **Real-time Collaboration**
- ✅ Real-time updates across all users
- ✅ Multi-user support with Supabase
- ✅ Instant synchronization

### 🎨 **Modern UI/UX**
- ✅ Beautiful, responsive design with Tailwind CSS
- ✅ Radix UI components for accessibility
- ✅ Smooth animations and transitions
- ✅ Mobile-friendly interface

### 🔐 **Authentication & Security**
- ✅ Secure authentication with Supabase Auth
- ✅ Row-level security (RLS) policies
- ✅ Protected routes
- ✅ User profile management

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Lucide React** - Icons

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row-level security

### Deployment
- **GitHub Pages** - Hosting
- **gh-pages** - Deployment automation

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/long-dx-gh/OKR-Management.git
   cd OKR-Management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   
   Create `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Setup Database**
   
   Run `supabase-schema.sql` in Supabase SQL Editor:
   ```bash
   # Copy content from supabase-schema.sql
   # Paste in Supabase Dashboard → SQL Editor
   # Click "Run"
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173)

---

## 🚀 Deployment

### Deploy to GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Deploy**
   ```bash
   npm run deploy
   ```

3. **Enable GitHub Pages**
   - Go to Repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Save

4. **Access**
   - https://long-dx-gh.github.io/OKR-Management/

See [DEPLOY_GITHUB_PAGES.md](DEPLOY_GITHUB_PAGES.md) for detailed instructions.

---

## 📖 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get started quickly
- **[Deployment Guide](DEPLOY_GITHUB_PAGES.md)** - Deploy to GitHub Pages
- **[Database Schema](supabase-schema.sql)** - Supabase database setup

---

## 🎯 Usage

### 1. Sign Up / Login
- Create account or login with existing credentials
- Email confirmation (can be disabled in development)

### 2. Create Objectives
- Click "New Objective"
- Fill in title, description, due date
- Set owner and status

### 3. Add Key Results
- Click on an objective
- Add key results with targets
- Track progress

### 4. Real-time Updates
- Open app in multiple tabs
- Changes sync automatically
- Collaborate with team in real-time

---

## 🏗️ Project Structure

```
OKR-Management/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── LoginPage.tsx
│   │   ├── OKRList.tsx
│   │   └── ...
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/             # Utilities & services
│   │   ├── supabase.ts  # Supabase client
│   │   ├── okr-service.ts # API functions
│   │   └── types.ts     # TypeScript types
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── supabase-schema.sql  # Database schema
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies
```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Deployment
npm run deploy       # Deploy to GitHub Pages
```

---

## 🌟 Key Features in Detail

### Real-time Synchronization
- WebSocket connection via Supabase
- Instant updates across all users
- No page refresh needed

### Row-Level Security
- Every user sees only their data
- Secure by default
- Protected endpoints

### Responsive Design
- Works on desktop, tablet, mobile
- Adaptive layout
- Touch-friendly interface

### TypeScript
- Full type safety
- Better IDE support
- Fewer runtime errors

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Đào Xuân Long**

- GitHub: [@long-dx-gh](https://github.com/long-dx-gh)
- Repository: [OKR-Management](https://github.com/long-dx-gh/OKR-Management)

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [Vite](https://vitejs.dev) - Build tool
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Radix UI](https://www.radix-ui.com) - UI components
- [Lucide](https://lucide.dev) - Icons

---

## 📞 Support

If you have any questions or need help, please:

1. Check the [documentation](DEPLOY_GITHUB_PAGES.md)
2. Open an [issue](https://github.com/long-dx-gh/OKR-Management/issues)
3. Contact via GitHub

---

## 🎉 Live Demo

**Try it now**: [https://long-dx-gh.github.io/OKR-Management/](https://long-dx-gh.github.io/OKR-Management/)

---

**Built with ❤️ by Đào Xuân Long**
