# S78-S84 — AI Core Implementation Plan

**Date:** 2026-03-29  
**Status:** ✅ PLANIFICATION COMPLETE  
**Total:** 7 sprints, 22 stories, ~18-20 jours de dev

---

## 📊 Vue d'ensemble

| Sprint | Objectif | Stories | Effort | Status |
|--------|----------|---------|--------|--------|
| **S78** | MCP Tools Foundation | 4 | 3-4 jours | 📋 Prêt |
| **S79** | Command Bus | 3 | 2-3 jours | 📋 Prêt |
| **S80** | YAML File System + Types | 3 | 2-3 jours | 📋 Prêt |
| **S81** | Skills Engine | 2 | 2 jours | 📋 Prêt |
| **S82** | skill_coherence | 2 | 2 jours | 📋 Prêt |
| **S83** | skill_review + skill_style | 4 | 2-3 jours | 📋 Prêt |
| **S84** | Hybrid AI (Ollama + Cloud) | 4 | 3 jours | 📋 Prêt |

---

## 📁 Fichiers de Sprint Créés

| Fichier | Contenu |
|---------|---------|
| `bmad/artifacts/sprints/sprint-78.md` | MCP Tools (read/write/analyse/version) |
| `bmad/artifacts/sprints/sprint-79.md` | Command Bus (30+ commandes) |
| `bmad/artifacts/sprints/sprint-80.md` | YAML + TypeScript Types |
| `bmad/artifacts/sprints/sprint-81.md` | Skills Engine (exécuteur) |
| `bmad/artifacts/sprints/sprint-82.md` | skill_coherence (détection incohérences) |
| `bmad/artifacts/sprints/sprint-83.md` | skill_review + skill_style |
| `bmad/artifacts/sprints/sprint-84.md` | Hybrid AI (Ollama + routing cloud) |

---

## 🎯 Prochaine Action

**Commencer S78.01 — MCP Tools: Read Operations**

**Fichiers à créer:**
- `src/lib/mcp/tools/read.ts` — 5 outils de lecture
- `src/lib/mcp/tools/read.spec.ts` — 5+ tests
- `src/lib/mcp/types.ts` — Types partagés

**Outils à implémenter:**
1. `readBible()` — Retourne bible.yaml
2. `readTimeline()` — Retourne timeline.yaml
3. `readStructure()` — Retourne structure.yaml
4. `readChapter(id)` — Retourne chapitre .md + .yaml
5. `listChapters()` — Liste ordonnée des chapitres

---

## ✅ Critères de Validation

Chaque sprint est considéré **complet** quand :

- [ ] Toutes les stories implémentées
- [ ] Tests unitaires passing (80%+ coverage)
- [ ] Documentation à jour
- [ ] Zéro erreur TypeScript
- [ ] Démonstration fonctionnelle

---

## 📋 Dependencies Critiques

```
S78 (MCP Tools)
    ↓
S79 (Command Bus)
    ↓
S80 (YAML + Types)
    ↓
S81 (Skills Engine) ← Utilise S78, S79, S80
    ↓
S82 (skill_coherence) ← Utilise S81
    ↓
S83 (skill_review + skill_style) ← Utilise S82
    ↓
S84 (Hybrid AI) ← Utilise S81, S82, S83
```

---

## 🚀 Prêt à Démarrer

**Toutes les stories sont :**
- ✅ Détaillées avec critères d'acceptation
- ✅ Estimées en heures
- ✅ Dependencies identifiées
- ✅ Stratégie de test définie
- ✅ Risques documentés

**Prochaine étape :** Exécuter `bmad continue` pour commencer S78.01

---

**Signé:** L'assistant AI (enfin prêt à coder le VRAI coeur AI)  
**Date:** 2026-03-29
