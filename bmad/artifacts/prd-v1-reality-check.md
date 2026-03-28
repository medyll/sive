# Sive v1.0 — Product Requirements Document (Reality Check)

**Date:** 2026-03-29  
**Status:** 🔴 CRITICAL — Major gaps between spec and implementation  
**Priority:** P0 — Core AI architecture missing

---

## Executive Summary

**Problem:** L'application actuelle a passing tests mais est **loin d'être prête** pour la production. Les fonctionnalités AI coeur (MCP, Skills, Hybrid AI) ne sont **pas implémentées**.

**Scope:** 77 sprints complétés, mais ~60% des features specifiées dans PROJECT.md sont manquantes ou mockées.

---

## Critical Issues (P0)

### 1. AI Architecture — MANQUANTE

**Spécifié (PROJECT.md §5):**
- MCP Tools (20+ outils read/write/analyse)
- Skills System (skill_coherence, skill_review, skill_style)
- Command Bus (30+ commandes UI/Editor)
- Hybrid AI Routing (Ollama local + Cloud Gemini/OpenAI)

**Réalisé:**
- ❌ Aucun MCP tool
- ❌ Aucun skill
- ❌ Aucun command bus
- ❌ Uniquement Anthropic API (pas de routing, pas de local)

**Impact:** L'AI ne peut PAS faire les tâches coeur (cohérence, review, style)

**Effort estimé:** 3-4 sprints (S78-S81)

---

### 2. YAML Data Model — MANQUANT

**Spécifié (PROJECT.md §4):**
```
mybook/
├── bible.yaml (characters, locations, objects, relations)
├── timeline.yaml (events, flashbacks, ellipses)
├── structure.yaml (acts, tension curve, threads)
├── themes.yaml (motifs, symbols)
├── narrator.yaml (POV, focalization)
└── chapters/
    ├── chapter_01/
    │   ├── chapter_01.md (narrative text)
    │   └── chapter_01.yaml (states, transitions)
```

**Réalisé:**
- ❌ Aucun fichier YAML
- ❌ Aucun schema
- ❌ Aucune génération de types TypeScript

**Impact:** Le coherence engine ne peut PAS fonctionner sans data model

**Effort estimé:** 2 sprints (S82-S83)

---

### 3. Coherence Engine — MANQUANT

**Spécifié (PROJECT.md §2):**
- Détection incohérences personnages/objets/lieux
- Vérification timeline (flashbacks, ellipses)
- Niveaux de confiance (Low/Medium/High)
- Alertes non-bloquantes

**Réalisé:**
- ⚠️ Store existe mais vide/placeholder
- ❌ Aucune détection réelle
- ❌ Aucune intégration YAML

**Impact:** Feature principale de Sive inexistante

**Effort estimé:** 2 sprints (S84-S85)

---

### 4. Review Mode — MANQUANT

**Spécifié (PROJECT.md §7):**
- Audit report structuré (8 sections)
- Export .md/.pdf
- Lecture seule avec highlights

**Réalisé:**
- ⚠️ UI existe mais vide
- ❌ Aucun rapport généré
- ❌ Aucune analyse AI

**Impact:** Mode review inutilisable

**Effort estimé:** 1-2 sprints (S86-S87)

---

### 5. Auth — INCOMPLET

**Spécifié (PROJECT.md §8):**
- OAuth + MFA
- Multi-user isolation
- Deployment desktop/server

**Réalisé:**
- ⚠️ Better-Auth configuré mais stubbed ("DB unavailable")
- ❌ Pas de MFA
- ❌ Pas de multi-user testing

**Impact:** Auth non fiable en production

**Effort estimé:** 1 sprint (S88)

---

## UI Issues (P1)

### 6. Bottom "Formatting" Bar — EN DOUBLE

**Problème:**
- Bottom bar "Formatting" duplique la toolbar éditeur
- Masque la bulle de chat AI
- Bouton AI redondant

**Solution:**
- Supprimer bottom bar
- Garder uniquement toolbar éditeur + AI button

**Effort:** 2 heures

---

### 7. Sidebar Items — INCOMPRÉHENSIBLES

**Problème:**
- Items sidebar non stylisés
- Icônes/textes peu clairs
- Pas de tooltips

**Solution:**
- Refonte UI sidebar
- Ajout tooltips
- Meilleure hiérarchie visuelle

**Effort:** 1 sprint (S89)

---

## Roadmap Corrigée

### Phase 1: Core AI (S78-S85) — 6-8 sprints

| Sprint | Objectif | Livrables |
|--------|----------|-----------|
| S78 | MCP Tools | 20+ outils read/write/analyse |
| S79 | Command Bus | 30+ commandes UI/Editor |
| S80 | Skills Engine | Exécuteur + contexte |
| S81 | Skills | skill_coherence, skill_review, skill_style |
| S82 | YAML Schemas | bible, timeline, structure, themes |
| S83 | Chapter YAML | States, transitions, types TS |
| S84 | Coherence Engine | Détection incohérences |
| S85 | Hybrid AI | Ollama local + routing cloud |

### Phase 2: Polish (S86-S90) — 4-5 sprints

| Sprint | Objectif | Livrables |
|--------|----------|-----------|
| S86 | Review Mode | Audit report + export |
| S87 | Versioning | Harden snapshots + diff |
| S88 | Auth Hardening | MFA + multi-user |
| S89 | UI Cleanup | Bottom bar, sidebar |
| S90 | E2E Tests | Tests complets features AI |

---

## Recommandation

**Option A — Honnête (Recommandée):**
1. Admettre que v1.0 n'est PAS prête
2. Replanifier sprints S78-S90 (10-13 sprints)
3. Livrer v1.0 **réelle** dans 2-3 mois
4. Tests E2E sur VRAIES features

**Option B — "Fake it till you make it":**
1. Livrer avec features mockées
2. Itérer en production
3. Risque : utilisateurs déçus, reviews négatives

**Je recommande Option A.**

---

## Next Action

**S78.01 — MCP Tools Foundation:**
- [ ] Créer fichier `src/lib/mcp/tools.ts`
- [ ] Implémenter 5 outils de base:
  - `read_bible()`
  - `read_timeline()`
  - `read_chapter(id)`
  - `list_chapters()`
  - `count_words(scope)`
- [ ] Tests unitaires MCP tools
- [ ] Documentation API

---

**Signé:** L'assistant AI (honnête enfin)  
**Date:** 2026-03-29
