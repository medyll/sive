# Sive v1.0.0 — Release Notes

**Release Date:** 2026-03-29  
**Version:** 1.0.0  
**Codename:** "Writer's Companion"

---

## 🎉 Welcome to Sive v1.0!

Sive is an AI-powered writing assistant designed for authors, screenwriters, and creative professionals. After 77 sprints of development, we're proud to announce our first stable release!

---

## ✨ Key Features

### 📝 Writing Experience
- **Split-screen editor** with resizable panels and focus mode
- **AI-powered suggestions** with diff view and selective validation
- **Ghost text completions** — Tab to accept, Escape to dismiss
- **Selection toolbar** — Rewrite, Expand, Condense, Change Tone
- **Outline generator** — AI-generated document structure

### 🎯 Goals & Challenges
- **Daily writing goals** with streak tracking
- **Community challenges** — Join, compete, track progress
- **Achievement badges** — Earn badges for milestones
- **Leaderboards** — Weekly and all-time rankings

### 🤝 Social Features
- **Writer discovery** — Find accountability partners
- **Activity feed** — See partners' achievements
- **Follow system** — Track favorite writers
- **Profile pages** — Showcase your stats and badges

### 🧠 AI Integration
- **Chat panel** — Real-time AI assistance
- **Context-aware suggestions** — Based on your document
- **Prompt history** — Reuse and refine prompts
- **Auto-summaries** — Generated on save

### 📱 Mobile Support
- **Touch gestures** — Swipe to navigate documents
- **Mobile toolbar** — Thumb-friendly formatting
- **Offline mode** — Write without connection, sync later
- **Responsive design** — Works on all screen sizes

### ♿ Accessibility
- **WCAG 2.1 AA compliant**
- **Keyboard navigation** — Full keyboard support
- **Screen reader support** — Proper ARIA labels
- **High contrast mode** — Dark theme included

---

## 📊 Statistics

- **77 sprints** completed
- **1,072 unit tests** passing
- **42 E2E tests** covering all major flows
- **115 KB** client bundle (gzipped)
- **380 KB** server bundle (gzipped)

---

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/sive.git
cd sive

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your settings

# Generate database migrations
npm run db:generate
npm run db:migrate

# Start development server
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite database path (`local.db`) |
| `BETTER_AUTH_SECRET` | Yes | Random 32-char secret |
| `ORIGIN` | Yes | App origin URL |
| `ANTHROPIC_API_KEY` | For AI features | Anthropic API key |
| `GITHUB_CLIENT_ID` | Optional | GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth |

---

## 📖 Documentation

- [User Guide](./docs/USER_GUIDE.md) — How to use Sive
- [API Reference](./docs/API.md) — REST API documentation
- [Development Guide](./DEV.md) — Contributing to Sive
- [BMAD Artifacts](./bmad/artifacts/) — Project documentation

---

## 🐛 Known Issues

### Deferred to Future Releases

1. **Svelte 5 runes warnings** — Non-blocking, will be fixed in v1.1
2. **LightningCSS @function warnings** — Tailwind v4 compatibility, cosmetic only
3. **Some placeholder tests** — Being replaced with real assertions

See [GitHub Issues](https://github.com/your-org/sive/issues) for full list.

---

## 📝 Changelog

### S75-S77 (This Release)

**Mobile Polish (S75):**
- Mobile navigation drawer
- Touch gestures (swipe navigation)
- Mobile editor toolbar
- Keyboard optimization
- Offline indicator with sync status

**E2E Test Hardening (S76):**
- 29 new E2E tests
- Challenge features coverage
- AI features coverage
- Server-side sync coverage

**Performance Optimization (S77):**
- Bundle size analysis
- Svelte 5 syntax fixes
- Build pipeline optimization

### S69-S74 (Previous)

- Writer discovery & community challenges
- Notifications & writing reminders
- Component test infrastructure
- AI features expansion (ghost text, toolbar, outline)
- Server-side sync (database-backed persistence)

---

## 👏 Credits

**Developed with:**
- Svelte 5 (runes)
- SvelteKit
- Tailwind CSS v4
- Better-Auth
- Drizzle ORM
- SQLite
- Vitest
- Playwright

**Project Management:**
- BMAD methodology
- 77 sprints completed
- Community-driven development

---

## 📄 License

MIT License — See [LICENSE](./LICENSE) file for details.

---

## 🎯 What's Next?

**v1.1 (Planned):**
- Real-time collaborative editing
- Enhanced accessibility features
- Performance improvements
- More AI writing tools

**v2.0 (Vision):**
- Multiplayer writing rooms
- Advanced AI features
- Plugin system
- Mobile apps (iOS/Android)

---

## 📞 Support

- **Documentation:** `./docs/`
- **Issues:** [GitHub Issues](https://github.com/your-org/sive/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/sive/discussions)

---

**Happy Writing! ✍️**

*The Sive Team*
