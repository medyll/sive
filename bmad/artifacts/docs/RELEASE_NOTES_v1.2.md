# Sive v1.2 — Beta Release Notes

**Release Date:** 2026-03-30  
**Version:** 1.2.0-beta  
**Build:** 90  

---

## What's New

### MCP Tools & Skills Engine (v1.1 → v1.2)

The biggest update yet — Sive now has a complete AI automation foundation with MCP Tools, Command Bus, and Skills Engine.

#### 🆕 MCP Tools (23 tools)

AI can now access and modify your project data safely:

**Read Operations:**
- `read_bible` — Load character/object/location bible
- `read_timeline` — Load story timeline
- `read_structure` — Load acts and narrative threads
- `read_themes` — Load themes and motifs
- `read_narrator` — Load POV configuration
- `read_chapter` — Load chapter content + metadata
- `read_character_sheet` — Load detailed character info
- `list_chapters` — List all chapters
- `read_version` — Load archived version
- `read_version_index` — Load version history

**Write Operations:**
- `write_transition` — Add chapter transitions
- `update_status` — Update entity status
- `add_timeline_event` — Add timeline events
- `add_character` — Add new characters
- `update_narrative_thread` — Update thread state
- `add_motif_occurrence` — Record motif appearances

**Analysis:**
- `compare_versions` — Diff two versions
- `extract_chapter_states` — Extract entity states
- `count_words` — Word count by scope
- `search_occurrences` — Search term occurrences

**Versioning:**
- `create_harden` — Create version snapshot
- `restore_version` — Restore archived version

#### 🆕 Command Bus (26 commands)

Skills can now control the UI:

- **UI Commands** (8): Tab control, scrolling, highlights, notifications, modals, spinners, focus mode
- **Editor Commands** (4): Text injection, replacement, selection
- **Suggestions Commands** (2): Push diffs, clear
- **Coherence Commands** (3): Push alerts, clear
- **Style Commands** (3): Push signals, clear
- **Versioning Commands** (3): Create harden, refresh timeline, highlight
- **Review Commands** (3): Push report, highlight passages

#### 🆕 Skills Engine

Pre-built AI workflows:

1. **skill_coherence** — Auto-detect narrative inconsistencies
2. **skill_version_description** — Generate version messages
3. **skill_review** — Complete audit reports
4. **skill_style** — Prose style analysis

#### 🆕 Hybrid AI Support

- **Ollama** — Local AI (privacy-first, free)
- **Anthropic** — Cloud AI (Claude Haiku, high quality)
- **OpenAI** — Cloud AI (coming soon)
- **Gemini** — Cloud AI (coming soon)

Task-based routing ensures the right model for each job.

---

### Real-time Collaboration (Sprint 86)

**WebSocket Presence:**
- See who's viewing/editing documents
- Real-time cursor positions
- Activity status (active/idle/offline)
- Automatic cleanup of inactive users

**Collaborative Cursors:**
- See other users' cursor positions
- Selection highlighting
- Color-coded by user
- Smooth animations

**Conflict Resolution:**
- Detect concurrent edits
- Visual conflict UI
- Choose: theirs/yours/merge
- Auto-resolve minor conflicts

**Collaborative Versioning:**
- Multi-author version tracking
- Merge version indicators
- Collaborator badges
- Version comparison

---

### Export Improvements (Sprint 87)

**EPUB Export:**
- Full EPUB 3.0 support
- Chapter ordering
- Metadata (title, author, language)
- Table of contents (NCX)
- Downloadable from browser

**MOBI Support:**
- Kindle format export (via Calibre integration)
- Coming in next beta

---

### Mobile Optimization (Sprint 88)

**PWA Support:**
- Install prompt for mobile/desktop
- Offline support via service worker
- Cache-first strategy for documents
- Network-first for API

**Mobile Editor:**
- Touch-optimized toolbar
- Virtual keyboard handling
- Responsive panels
- 44px tap targets

---

### Performance Monitoring (Sprint 89)

**Core Web Vitals:**
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

**Performance Dashboard:**
- Real-time metrics display
- Color-coded ratings (good/needs improvement/poor)
- Navigation timing breakdown
- In-app performance tracking

---

## Installation

### Requirements

- Node.js 18+
- pnpm (preferred) or npm
- SQLite (local.db) or PostgreSQL (production)

### Quick Start

```bash
# Clone repository
git clone https://github.com/your-org/sive.git
cd sive

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Initialize database
pnpm run db:generate
pnpm run db:migrate

# Start dev server
pnpm run dev
```

### Production Build

```bash
pnpm run build
pnpm run preview
```

---

## Known Issues

### Beta Limitations

1. **MCP Tools** — File system operations are stubbed. Production deployment needs real FS backend.

2. **AI Providers** — Only Ollama is fully implemented. Anthropic integration needs API key setup.

3. **Collaborative Editing** — WebSocket server is basic. Production needs:
   - Proper authentication
   - Room-based presence
   - Operational transformation for conflicts

4. **EPUB Export** — Basic implementation. Complex formatting may not render correctly.

5. **Service Worker** — Cache strategy is simple. May need tuning for large document libraries.

### Delayed Issues

| ID | Issue | Workaround |
|----|-------|------------|
| del-2026-03-25-001 | Svelte build warnings (a11y/state/css) | Non-blocking, cleanup planned |
| del-2026-03-25-002 | E2E webserver timeout (Playwright) | Start preview manually, then run tests |

---

## Upgrade Guide

### From v1.1

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
pnpm install

# Run migrations (if any)
pnpm run db:migrate

# Rebuild
pnpm run build
```

### Configuration Changes

New environment variables (optional):

```env
# AI Providers
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here

# WebSocket (for collaboration)
WS_HOST=localhost
WS_PORT=3000

# MCP (for AI tools)
MCP_PROJECT_ROOT=./projects
```

---

## What's Next (v1.3 Roadmap)

### Planned Features

- **Command Palette** — Ctrl+K quick actions
- **Writing Goals** — Daily/weekly word count targets
- **Streak Tracking** — Maintain writing streaks
- **Achievement Badges** — Gamification
- **Leaderboards** — Weekly/all-time rankings
- **Accountability Partners** — Share goals with friends
- **Activity Feed** — See partner progress
- **Notifications** — Deadline reminders, partner activity

### Under Consideration

- Mobile app (React Native / Flutter)
- Desktop app (Electron / Tauri)
- Browser extension (Chrome, Firefox)
- Integration with writing apps (Scrivener, Ulysses)

---

## Feedback

Beta testing is critical for v1.2. Please report:

- Bugs or crashes
- Performance issues
- Missing features
- UX confusion
- AI quality issues

**Report via:**
- GitHub Issues: https://github.com/your-org/sive/issues
- Discord: [invite link]
- Email: beta@sive.app

---

## Credits

**Developed by:** Sive Team  
**AI Architecture:** MCP Tools + Skills Engine  
**Real-time Collaboration:** WebSocket + Presence  
**Design System:** Bits UI + Tailwind CSS v4  

**Special thanks to beta testers!**

---

**Build:** 90 | **Sprints:** 90 | **Lines of Code:** ~5000+

*Thank you for testing Sive v1.2 Beta!* 🎉
