# Sive v1.0 — AI-Assisted Writing Software

**Release:** v1.0.0 (2026-03-29)  
**Status:** ✅ Production Ready

Sive is an AI-powered writing assistant designed for authors, screenwriters, and creative professionals. It helps you write, edit, and refine narrative text with real-time AI suggestions, coherence checks, and stylistic analysis. Built with **SvelteKit (Svelte 5)** and **Tailwind CSS v4**, it offers a modern, responsive interface with full mobile support.

---

## ✨ Key Features

### 📝 Writing Experience
- **Split-Screen Editor** — Resizable panels with focus mode
- **AI Ghost Text** — Inline completions (Tab to accept, Escape to dismiss)
- **Selection Toolbar** — Rewrite, Expand, Condense, Change Tone
- **Outline Generator** — AI-generated document structure
- **Auto-Save** — Never lose your work
- **Export** — PDF, DOCX, EPUB formats

### 🤖 AI Integration
- **Chat Panel** — Real-time AI assistance with streaming
- **Context-Aware Suggestions** — Based on your document content
- **Prompt History** — Reuse and refine previous prompts
- **Auto-Summaries** — Generated on save
- **Tone Changes** — Formal, Casual, Professional, Creative, Academic

### 🎯 Goals & Gamification
- **Daily Writing Goals** — Set and track daily targets
- **Streak Tracking** — Maintain your writing streak
- **Achievement Badges** — Earn badges for milestones (7, 30, 100, 365 days)
- **Leaderboards** — Weekly and all-time rankings
- **Community Challenges** — Join writing challenges with friends

### 🤝 Social Features
- **Writer Discovery** — Find accountability partners
- **Activity Feed** — See partners' achievements in real-time
- **Follow System** — Track your favorite writers
- **Profile Pages** — Showcase your stats, badges, and bio
- **Accountability Partners** — Private feed of partner activities

### 📱 Mobile Support
- **Touch Gestures** — Swipe left/right to navigate documents
- **Mobile Toolbar** — Thumb-friendly formatting actions
- **Keyboard Optimization** — Editor scrolls above keyboard
- **Offline Mode** — Write without connection, sync when online
- **Responsive Design** — Works on phones, tablets, desktops

### ♿ Accessibility
- **WCAG 2.1 AA Compliant** — Full accessibility support
- **Keyboard Navigation** — All features accessible via keyboard
- **Screen Reader Support** — Proper ARIA labels throughout
- **Focus Indicators** — Visible focus states
- **High Contrast** — Dark theme included

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/sive.git
cd sive

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your settings (see below)

# Generate and run database migrations
npm run db:generate
npm run db:migrate

# Start development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite database path (`local.db`) |
| `BETTER_AUTH_SECRET` | Yes | Random 32-char secret |
| `ORIGIN` | Yes | App origin URL (e.g., `http://localhost:5173`) |
| `ANTHROPIC_API_KEY` | For AI | Anthropic API key |
| `GITHUB_CLIENT_ID` | Optional | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth client secret |

Generate a secret:
```bash
openssl rand -base64 32
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema to DB (dev only) |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run lint` | ESLint + Prettier check |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format with Prettier |

---

## 🏗️ Project Structure

```
sive/
├── src/
│   ├── routes/          # SvelteKit routes and pages
│   ├── lib/
│   │   ├── elements/    # UI components
│   │   ├── editor/      # Editor components
│   │   ├── server/      # Server-only helpers
│   │   └── styles/      # Global styles
│   ├── app.d.ts         # TypeScript declarations
│   ├── app.html         # HTML template
│   └── hooks.server.ts  # Auth & security headers
├── bmad/                # Project artifacts (PRDs, sprints)
├── e2e/                 # Playwright E2E tests
├── drizzle/             # Database migrations
├── static/              # Static assets
└── docs/                # Documentation
```

---

## 🧪 Testing

### Run All Tests

```bash
# Full test suite
npm run test

# Unit tests only
npm run test:unit

# E2E tests only
npm run test:e2e
```

### Run Single Test

```bash
# By file
npm run test:unit -- --run src/lib/challengeStore.spec.ts

# By name pattern
npm run test:unit -- --run --testNamePattern "streak"

# E2E by file
npm run test:e2e -- e2e/challenge-features.spec.ts
```

### Test Coverage

- **Unit Tests:** 1,072 passing
- **E2E Tests:** 42 passing
- **Coverage:** ~85% of critical paths

---

## 📦 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Svelte 5 (runes), SvelteKit, Tailwind CSS v4 |
| **Backend** | Node.js, Better-Auth |
| **Database** | SQLite via Drizzle ORM |
| **Testing** | Vitest (unit), Playwright (E2E) |
| **Package Manager** | pnpm (preferred) |

---

## 📖 Documentation

- **[Release Notes](./RELEASE_NOTES.md)** — What's new in v1.0
- **[Project Completion](./PROJECT_COMPLETION.md)** — Full project summary
- **[User Guide](./docs/USER_GUIDE.md)** — How to use Sive
- **[API Reference](./docs/API.md)** — REST API documentation
- **[Development Guide](./DEV.md)** — Contributing to Sive
- **[BMAD Artifacts](./bmad/artifacts/)** — Project documentation

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Use pnpm** for dependency management
2. **Run tests** before committing: `npm run test`
3. **Link to BMAD artifacts** in PR descriptions
4. **Follow coding conventions** (lint/typecheck must pass)

### Development Conventions

- **Formatting:** Tabs, single quotes, print width 100
- **TypeScript:** Strict mode, avoid `any`
- **Svelte 5:** Use runes (`$state`, `$effect`, `$props`)
- **Accessibility:** WCAG 2.1 AA compliance required

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Sprints Completed** | 78 |
| **Unit Tests** | 1,072 passing |
| **E2E Tests** | 42 passing |
| **Client Bundle** | 115 KB (gzipped) |
| **Server Bundle** | 380 KB (gzipped) |
| **Accessibility** | WCAG 2.1 AA compliant |

---

## 🗺️ Roadmap

### v1.1 (Q2 2026)
- [ ] Real-time collaborative editing
- [ ] Enhanced accessibility features
- [ ] Performance improvements (Lighthouse 90+)
- [ ] More AI writing tools

### v2.0 (Q4 2026)
- [ ] Multiplayer writing rooms
- [ ] Advanced AI features
- [ ] Plugin system
- [ ] Mobile apps (iOS/Android)

---

## 📄 License

MIT License — See [LICENSE](./LICENSE) file for details.

---

## 📞 Support

- **GitHub Issues:** https://github.com/your-org/sive/issues
- **Discussions:** https://github.com/your-org/sive/discussions
- **Documentation:** `./docs/`

---

**Happy Writing! ✍️**

*The Sive Team — March 2026*
