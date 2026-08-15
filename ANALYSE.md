# Analyse technique — Sive

**Date :** 15 août 2026
**Commit analysé :** `02395fb` (branche `main`, synchro avec `origin`)
**Méthode :** exécution réelle des gates de qualité + lecture ciblée du code. Aucune conclusion reprise de `AUDIT.md`.

---

## 1. Résumé exécutif

Sive est une application d'écriture assistée par IA, réellement substantielle : 105 composants Svelte, 272 modules TypeScript, 40 endpoints API, 1 164 tests unitaires qui passent. L'architecture est cohérente et le socle de tests est authentique.

Mais **l'application ne compile pas** et **trois des quatre gates de qualité sont rouges**. Plusieurs sous-systèmes présentés comme livrés sont des stubs. Enfin, douze endpoints — dont toute la surface IA — n'ont aucun contrôle d'authentification, et l'un d'eux expose des clés API en clair.

| Gate | Commande | À l'analyse | Après phases 1 + 1bis |
|---|---|---|---|
| Build | `npx vite build` | ❌ `MISSING_EXPORT` | ✅ **vert** |
| Typecheck | `npx svelte-check` | ❌ 182 erreurs / 55 fichiers | 🟠 135 erreurs / 47 fichiers |
| Lint | `npx eslint .` | ❌ crash (`TypeError`) | ❌ crash — inchangé |
| Tests unitaires | `npx vitest --run` | ✅ 1 164 passés | ✅ **867 passés, 0 échec** |

> Les colonnes « à l'analyse » décrivent l'état au commit `02395fb`. Les phases 1 et 1bis ont été exécutées le même jour — voir §11 et §12.

### Écart avec `AUDIT.md`

`AUDIT.md` (daté du 3 mai 2026, généré par un autre outil) annonce « Production Ready », « Qualité Code 9/10 », « TypeScript strict partout », score global 8,2/10. Ces affirmations ne sont pas vérifiables aujourd'hui : le build échoue et le typecheck remonte 182 erreurs. Le document est obsolète et ne doit plus servir de référence d'état. Il reste utile comme inventaire de la stack et liste d'intentions.

---

## 2. Stack et architecture

| Couche | Techno | Version |
|---|---|---|
| Framework | SvelteKit 2 + Svelte 5 (runes) | 2.59 / 5.54 |
| Build | Vite 8 (rolldown) | 8.0.10 |
| CSS | Tailwind v4 + `@medyll/css-base` | 4.2.2 / 0.1.4 |
| Auth | Better-Auth | 1.5.5 |
| DB | SQLite (better-sqlite3) + Drizzle ORM | 12.8 / 0.45.2 |
| IA | SDK Anthropic, OpenAI, Google Generative AI, Ollama | — |
| Tests | Vitest 4 + Playwright 1.58 | — |

### Découpage

```
src/
├── routes/
│   ├── (18 pages)          dashboard, feed, discover, challenges,
│   │                       leaderboard, goals, profile, settings, s/[token]
│   └── api/ (40 endpoints) ai/*, skills/*, challenges/*, shares, versions,
│                           notifications, presence, export/*, mcp/tools, ws
├── lib/
│   ├── elements/    (~105 composants)
│   ├── editor/      éditeur riche (ghost text, suggestions)
│   ├── skills/      moteur de skills (définitions JSON/YAML)
│   ├── gestures/, tools/, shared/, types/
│   └── server/      auth, rbac, rateLimit, search, shares, versions,
│                    stats, notifications, ai/, mcp/, skills/, db/
└── data/
```

L'organisation est saine : séparation `server/` nette, un module par domaine, tests colocalisés (`*.spec.ts` à côté de la source). Svelte 5 runes utilisées de façon cohérente.

---

## 3. Anomalies bloquantes

### 3.1 🔴 Le build échoue — import de type en position de valeur

```
[MISSING_EXPORT] "AIProvider" is not exported by "src/lib/server/ai/router.ts"
[MISSING_EXPORT] "ModelConfig" is not exported by "src/lib/server/ai/router.ts"
  → src/lib/server/ai/service.ts:7
```

`router.ts` exporte ces symboles en tant que types purs :

```ts
export type AIProvider = 'ollama' | 'anthropic' | 'openai' | 'gemini';  // ligne 16
export interface ModelConfig { … }                                       // ligne 21
```

`service.ts:8` les importe en position de valeur :

```ts
import { aiRouter, AIProvider, ModelConfig } from './router';   // ❌
```

**Correctif :**

```ts
import { aiRouter } from './router';
import type { AIProvider, ModelConfig } from './router';
```

Les autres consommateurs (`AISettings.svelte`, `skills/engine.ts`, `skills/types.ts`, `api/skills/config`) utilisent déjà `import type` correctement. Le défaut est isolé à ce seul fichier.

**Pourquoi les tests ne l'ont pas vu :** esbuild (utilisé par Vitest) efface les types silencieusement ; rolldown, lui, valide les exports au bundling. Aucun test ni hook ne lance `build`. Régression probablement introduite par `1471c93` (« Enhance AISettings and AIModelRouter »).

### 3.2 🔴 Endpoint `/api/skills/config` : clés API exposées sans authentification

Fichier : `src/routes/api/skills/config/+server.ts`

Trois problèmes cumulés, à traiter avant toute exposition réseau :

1. **Aucun contrôle d'accès.** Ni le `GET` ni le `POST` ne consultent `locals.session`. `hooks.server.ts` renseigne bien `locals` mais ne protège aucune route : la garde est à la charge de chaque endpoint, et celui-ci n'en a pas.
2. **Le `GET` retourne les clés API en clair** (lignes 39, 45, 51 : `apiKey: apiKeyStore.get('anthropic')`) à n'importe quel appelant anonyme. Le champ `api_key_configured` existe déjà juste à côté et suffirait pour l'UI.
3. **Le `POST` accepte l'injection de clés et la réécriture du routage IA** par un appelant anonyme (lignes 99-115).

S'ajoute un défaut de conception : `apiKeyStore` est une `Map` unique au niveau du module (ligne 8), donc **partagée entre tous les utilisateurs** du processus — la clé saisie par un utilisateur sert aux requêtes de tous les autres.

**Correctif :** garde `locals.session` sur les deux verbes ; ne jamais renvoyer `apiKey` dans la réponse ; scoper le stockage par utilisateur (et le persister chiffré si la fonctionnalité doit survivre à un redémarrage).

Bug annexe dans le même fichier : clé `enabled` dupliquée dans l'objet `ollama` (lignes 29 et 34) — la seconde écrase la première.

### 3.3 🔴 12 endpoints sur 40 sans référence d'authentification

Aucune occurrence de `locals.session` / `locals.user` / `rbac` / `requireAuth` :

| Endpoint | Verbes | Risque |
|---|---|---|
| `ai` | POST | Consommation des clés API du propriétaire par des tiers |
| `ai/stream` | GET | idem |
| `ai/suggest` | GET | idem |
| `ai/summary` | GET | idem |
| `skills/config` | GET, POST | **Fuite de clés** (cf. 3.2) |
| `skills/execute` | POST, GET | Exécution de skills arbitraires |
| `skills/list` | GET | Divulgation d'inventaire |
| `mcp/tools` | POST, GET | Surface d'outils MCP ouverte |
| `export/epub` | POST, GET | Coût CPU non maîtrisé |
| `export/pdf` | GET | idem |
| ~~`share/content`~~ | GET | Supprimé en phase 1bis |
| ~~`ws/presence`~~ | GET | Supprimé en phase 1bis |

> Après la phase 1bis, **10 endpoints non protégés subsistent sur 33**. Les deux derniers du tableau ont disparu avec la fonctionnalité de partage.

Le point saillant est la surface IA : `ai`, `ai/stream`, `ai/suggest`, `ai/summary` sont ouverts alors qu'ils déclenchent des appels facturés sur les clés du propriétaire. Le rate limiting y est appliqué, ce qui plafonne l'abus sans l'empêcher.

Les 28 autres endpoints référencent bien une vérification. Quelques-uns méritent une revue ciblée (`share/content` est peut-être intentionnellement public via token).

---

## 4. Fonctionnalités déclarées mais non implémentées

### 4.1 Collaboration temps réel — absente

`src/routes/api/ws/+server.ts` valide la session et le `documentId`, puis retourne :

```
501 { error: 'WebSocket endpoint requires adapter support' }
```

Le corps réel est un bloc de commentaires décrivant comment on l'implémenterait avec `ws`. La collaboration temps réel, présentée comme livrée, n'existe pas. `PresenceList`, `RemoteCursor` et `presence/cursor/stream` (SSE) fonctionnent, eux — la présence est donc réelle, la co-édition non.

### 4.2 État serveur en mémoire — perdu au redémarrage

Modules stockant leur état dans des `Map`/`Set` de module, sans persistance :

`sharing.ts`, `goalSharing.ts`, `notifications.ts`, `ws.ts`, `skills/engine.ts`, `commands/bus.ts`, `ai/router.ts`

Conséquences : tout est perdu au redémarrage, et rien ne fonctionne au-delà d'une instance unique (aucun déploiement multi-process ou scalé horizontalement).

---

## 5. Base de données

### 5.1 🔴 Le journal de migrations pointe vers un fichier inexistant

`drizzle/meta/_journal.json` référence quatre entrées :

```
0000_normal_maggott  ✅ présent
0001_aberrant_reptil ✅ présent
0002_last_black_cat  ❌ FICHIER ABSENT
0003_hard_spectrum   ✅ présent
```

Or `drizzle/` contient `0002_add_document_tags.sql` et `0003_add_document_shares.sql`, **absents du journal**. Deux fichiers portent par ailleurs le préfixe `0003`.

Donc : `pnpm db:migrate` échoue sur `0002_last_black_cat` introuvable, et les deux migrations écrites à la main ne sont jouées par aucun mécanisme. L'état du schéma dépend actuellement de `db:push` ou d'applications manuelles — non reproductible sur un environnement neuf.

### 5.2 ✅ Pas de dérive de schéma — *correction d'un constat erroné*

Une version antérieure de ce document affirmait que `drizzle.config.ts`, en ne pointant que sur `schema.ts`, ignorait les tables déclarées dans `auth.schema.ts`, `schema/challenges.ts` et `schema/discovery.ts` — et qu'un `db:generate` les supprimerait.

**C'est faux.** `schema.ts` se termine par des ré-exports :

```ts
export * from './auth.schema';
export * from './schema/discovery';
```

Drizzle suit ces ré-exports : toutes les tables sont bien visibles depuis le point d'entrée unique. Aucune action requise.

### 5.3 Tables existantes

11 tables au total : `users`, `sessions`, `accounts`, `documents`, `document_shares`, `user_preferences`, `task`, `challenges`, `challenge_participants`, `writer_discovery`, `activity_events`.

À noter : `versions`, `templates`, `notifications`, `shares` (liens de partage), badges et objectifs n'ont **pas** de table. Ces fonctionnalités s'appuient sur l'état en mémoire décrit en 4.2, ou sur des colonnes de `documents`.

### 5.4 Environnement local cassé

Le binding natif de `better-sqlite3` n'est pas compilé :

```
Error: Could not locate the bindings file
  → node_modules/.pnpm/better-sqlite3@12.8.0/.../better_sqlite3.node
```

L'application ne peut pas démarrer localement en l'état. Correctif : `pnpm rebuild better-sqlite3` (nécessite les outils de build natifs).

---

## 6. Qualité du code

### 6.1 🔴 ESLint ne s'exécute pas

```
TypeError: Cannot read properties of undefined (reading 'type')
Occurred while linting src/routes/goals/[linkId]/+page.svelte:1
Rule: "@typescript-eslint/no-unused-vars"
```

Incompatibilité entre ESLint 10, `typescript-eslint` 8.57 et `eslint-plugin-svelte` sur les fichiers `.svelte`. Le lint ne couvre plus rien depuis. À traiter par montée de version du plugin ou désactivation ciblée de la règle sur les `.svelte`.

### 6.2 🟠 182 erreurs de typage

Répartition : 150 dans `src/lib`, 32 dans `src/routes`, sur 55 fichiers.

| Nb | Fichier |
|---|---|
| 11 | `src/lib/confetti.ts` |
| 10 | `src/routes/+page.svelte` |
| 10 | `src/lib/elements/DocumentFilterPanel.svelte` |
| 9 | `src/lib/elements/RemoteCursor.svelte.spec.ts` |
| 9 | `src/lib/elements/DocumentSearch.svelte` |
| 8 | `src/lib/server/ai/service.ts` |
| 8 | `src/lib/shared/yamlStore.svelte.ts` |
| 8 | `src/routes/api/skills/config/+server.ts` |

Motifs dominants : `'X' is possibly 'undefined'` (strictness réelle, pas cosmétique), `Argument of type 'string | undefined' is not assignable to 'string'`, et un usage de rune `$state` traité comme store dans `leaderboard/+page.svelte`.

### 6.3 🟠 `src/lib/elements/mockups/` pollue le typecheck

12 fichiers `.svelte` qui ne sont pas des composants Svelte, mais des **descripteurs pseudo-HTML** :

```svelte
<panel id="editor-panel" default-width="55%" resizable role="Editor panel" />
  <text-zone id="main-editor" … />
</panel>
```

Balise auto-fermante suivie d'une balise fermante → `` `</panel>` attempted to close an element that was not open ``. Ces fichiers ne sont importés nulle part et génèrent à eux seuls ~18 des 182 erreurs. Les renommer en `.html` ou les déplacer hors de `src/` (par exemple sous `docs/`) nettoie le typecheck sans rien casser.

---

## 7. Tests

Le seul gate vert, et il est solide.

- **Unitaires :** 110 fichiers, 1 164 tests passés, 1 skipped, 1 todo — 10,7 s.
- **E2E :** ~40 specs Playwright (auth, partage, IA, mobile, collaboration, sécurité, onboarding, sprints 17 à 30). Non exécutées ici : elles nécessitent un serveur, lui-même bloqué par 3.1 et 5.4.
- **Colocalisation :** `*.spec.ts` à côté des sources, y compris côté serveur.
- **Exclusion permanente :** `SummaryPanel.svelte.spec.ts` est exclu en dur dans le script `test:unit` du `package.json` — dette masquée à documenter ou à corriger.

**Angle mort principal :** aucun gate n'exécute `build`. C'est exactement ce qui a laissé passer 3.1. Un `pnpm build` en CI aurait suffi.

---

## 8. Sécurité — synthèse

| Point | État |
|---|---|
| Clés API exposées sans auth (`skills/config`) | 🔴 Critique — cf. 3.2 |
| Surface IA non authentifiée | 🔴 Critique — cf. 3.3 |
| En-têtes de sécurité (`hooks.server.ts`) | ✅ CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy` |
| CSP `unsafe-inline` + `unsafe-eval` | 🟠 Affaiblit fortement la protection XSS ; déjà signalé dans `AUDIT.md`, jamais corrigé |
| Rate limiting | 🟡 Présent sur IA, export, share, search, versions, templates — absent sur `skills/config` et `skills/execute` |
| RBAC | ✅ Module dédié (`rbac.ts`) avec tests |
| Validation d'entrée | ✅ Module dédié (`inputValidation.ts`) avec tests |
| Secrets côté client | ✅ Aucun secret en dur ; les clés transitent par `process.env` côté serveur |
| Overrides pnpm | ✅ 9 overrides de sécurité actifs (`flatted`, `kysely`, `cookie`, `esbuild`…) — les vulnérabilités listées dans `AUDIT.md` §Sécurité semblent traitées |

---

## 9. Plan de remise en état

### Phase 1 — Débloquer ✅ **FAIT le 15 août 2026**

Voir §11 pour le détail de ce qui a été appliqué et vérifié.

1. ✅ **`service.ts` → `import type`.** Build débloqué.
2. ✅ **Sortir le service IA serveur du composant client** (`AISettings.svelte`) — défaut découvert en réparant le point 1, bloquant lui aussi.
3. ✅ **`pnpm rebuild better-sqlite3`** (a nécessité `onlyBuiltDependencies`). Base de données à nouveau accessible.
4. ✅ **Script `pnpm verify`** = `build` + tests unitaires. Gate ajouté.

### Phase 1bis — Réduction du périmètre fonctionnel ✅ **FAITE le 15 août 2026**

Voir §12 pour le détail de ce qui a été supprimé, recâblé et vérifié.

Le plan ci-dessous est conservé comme trace de la décision et du périmètre retenu.

**Décision :** l'application doit rester simple. Sont retirés du produit :

- la **gamification** — challenges, objectifs (goals), classement (leaderboard), badges ;
- le **travail partagé** — partage de documents, collaboration, présence, curseurs distants, résolution de conflits.

Cette phase précède les phases 2 à 4 : elle supprime une partie de la surface à sécuriser et à typer, donc elle réduit d'autant le travail restant. Concrètement, `/api/goals/*` et `/api/challenges/*` disparaissent de la revue d'authentification, et une partie des 182 erreurs de typage part avec le code supprimé.

#### Périmètre à supprimer

**Gamification — challenges (10 fichiers)**

```
src/lib/challengeStore.svelte.ts + .spec.ts
src/lib/elements/ChallengeCard.svelte
src/lib/server/db/schema/challenges.ts
src/routes/api/challenges/**            (4 endpoints)
src/routes/challenges/+page.svelte
e2e/challenge-features.spec.ts
```

**Gamification — objectifs (20 fichiers)**

```
src/lib/elements/GoalsDashboard.svelte + .spec.ts
src/lib/elements/GoalTemplateModal.svelte
src/lib/elements/WritingGoalBar.svelte
src/lib/goalTemplates.ts + .spec.ts
src/lib/weeklyGoalsStore.svelte.ts + .spec.ts
src/lib/writingGoalsStore.svelte.ts + .spec.ts
src/lib/server/goalSharing.ts + .spec.ts
src/routes/api/goals/**                 (2 endpoints)
src/routes/goals/[linkId]/**
```

**Gamification — classement et badges (16 fichiers)**

```
src/lib/leaderboardStore.svelte.ts
src/lib/server/leaderboardCache.ts + .spec.ts
src/lib/server/leaderboardQueries.ts + .spec.ts
src/routes/api/leaderboard/**           (2 endpoints)
src/routes/leaderboard/+page.svelte
src/lib/badgesStore.svelte.ts + .spec.ts
src/lib/elements/BadgeDisplay.svelte + .spec.ts
```

**Travail partagé — partage (11 fichiers)**

```
src/lib/elements/ShareButton.svelte + .spec.ts
src/lib/elements/ShareModal.svelte
src/lib/elements/ShareGoalsModal.svelte + .spec.ts
src/lib/server/shares.ts + .spec.ts
src/lib/shareLinksStore.svelte.ts + .spec.ts
src/routes/api/share, api/shares, api/share/content
src/routes/s/[token]/**
```

**Travail partagé — collaboration et présence (18 fichiers)**

```
src/lib/elements/CollaborativeCursors.svelte
src/lib/elements/CollaborativeVersioning.svelte
src/lib/elements/ConflictIndicator.svelte + .spec.ts
src/lib/elements/ConflictResolutionUI.svelte
src/lib/elements/PresenceList.svelte + .spec.ts
src/lib/elements/RemoteCursor.svelte + .spec.ts
src/lib/elements/RemoteCursors.svelte
src/lib/presenceStore.svelte.ts + .spec.ts
src/lib/editor/presence-store.spec.ts
src/lib/shared/collaborativeVersioningStore.svelte.ts
src/lib/shared/conflictStore.svelte.ts
src/lib/shared/websocketPresence.ts
src/lib/server/ws.ts + .spec.ts, src/routes/api/ws/**
src/lib/server/collaboration.spec.ts
src/routes/api/presence/**
e2e/collaboration.spec.ts
```

> ⚠️ **Piège de nommage.** `src/lib/shared/` est le dossier de **code partagé** (command bus, data-loader, skill engine, stores transverses) — 18 fichiers qui n'ont **rien** à voir avec la fonctionnalité de partage. Ne pas le supprimer. Seuls trois de ses fichiers sont concernés, listés ci-dessus.

#### Points à trancher avant exécution

| Question | Enjeu |
|---|---|
| `discover` / `feed` / `profile/[username]` restent-ils ? | Ce sont des pages **sociales** (découverte d'autres auteurs, flux d'activité). Elles ne sont ni gamification ni partage, mais elles supposent une dimension multi-utilisateurs. Si Sive devient mono-utilisateur, elles tombent aussi — avec `writer_discovery` et `activity_events`. |
| `WordCountBadge.svelte` | Contient « Badge » dans le nom mais c'est un compteur de mots, pas un badge de gamification. **À conserver.** |
| Versioning des documents | `versions` est indépendant de la collaboration. **À conserver.** |
| Tables DB | `challenges`, `challenge_participants`, `document_shares` deviennent orphelines. Prévoir une migration de suppression — à coordonner avec la réparation du journal (§5.1). |
| Notifications | Leur contenu est aujourd'hui surtout événements sociaux. À réévaluer une fois le reste retiré. |

#### Ordre d'exécution recommandé

1. Retirer les **entrées de navigation** et les liens vers les pages concernées.
2. Supprimer **pages puis endpoints**, en vérifiant `pnpm verify` à chaque étape.
3. Supprimer **stores et modules serveur** devenus orphelins.
4. Supprimer les **specs** associées (les tests doivent baisser en nombre, pas échouer).
5. Émettre une **migration de suppression** des tables orphelines.
6. Mettre à jour `README.md`, `docs/`, et retirer les specs e2e correspondantes.

Volume indicatif : ~75 fichiers, soit environ 20 % de la base de code.

### Phase 2 — Sécurité ✅ **FAITE le 15 août 2026**

Voir §13. Le plan initial est conservé ci-dessous.

#### Plan initial (≈ 4 h)

4. **`skills/config` :** garde d'authentification, suppression de `apiKey` de la réponse, store scopé par utilisateur.
5. **Surface IA :** garde d'authentification sur `ai`, `ai/stream`, `ai/suggest`, `ai/summary`, `skills/execute`, `mcp/tools`.
6. **Décider d'une politique globale :** soit un garde `/api/*` dans `hooks.server.ts` avec liste blanche explicite des routes publiques, soit une revue endpoint par endpoint. La première option est plus sûre — elle échoue en refusant l'accès, pas en l'accordant.
7. **Retirer `unsafe-eval` de la CSP** ; `unsafe-inline` demande plus de travail (nonces).

### Phase 3 — Base de données (≈ 3 h)

8. **Réparer le journal de migrations** : régénérer une baseline propre depuis l'état réel du schéma, ou réaligner journal et fichiers.
9. **Élargir `drizzle.config.ts`** à tous les fichiers de schéma, avant qu'un `db:generate` ne détruise sept tables.

### Phase 4 — Qualité (≈ 1-2 j)

10. **Sortir `mockups/` de `src/`** (−18 erreurs, gratuit).
11. **Réparer ESLint** (versions du plugin Svelte).
12. **Résorber les ~150 erreurs de typage restantes**, en commençant par `confetti.ts`, `+page.svelte`, `DocumentFilterPanel.svelte`.

### Phase 5 — Vérité du produit

13. **Aligner la documentation sur le code.** Marquer explicitement comme non implémentés : collaboration temps réel (stub 501) et persistance des partages / notifications / versions (en mémoire).
14. **Archiver ou dater `AUDIT.md`** pour qu'il ne soit plus lu comme un état courant.
15. **Persister l'état serveur en mémoire** si un déploiement multi-instance est envisagé.

---

## 10. Annexe — commandes de vérification

```bash
npx vite build
```

```bash
npx svelte-check --tsconfig ./tsconfig.json
```

```bash
npx vitest --run --exclude 'src/lib/elements/SummaryPanel.svelte.spec.ts'
```

```bash
npx eslint . --ignore-pattern '**/*.test.*'
```

---

## 11. Journal — Phase 1 appliquée (15 août 2026)

### Correctifs

**1. Build débloqué — `src/lib/server/ai/service.ts`**

```ts
- import { aiRouter, AIProvider, ModelConfig } from './router';
+ import { aiRouter } from './router';
+ import type { AIProvider, ModelConfig } from './router';
```

**2. `src/routes/api/skills/config/+server.ts`** — le fichier importait `aiRouter` depuis `service.ts`, qui ne le réexporte pas. Import redirigé vers `router.ts`, et les trois types regroupés en `import type`.

**3. 🔴 Code serveur exécuté côté client — `src/lib/elements/AISettings.svelte`**

Défaut découvert en réparant le point 1, et bloquant pour le build. Le composant importait `aiService` — une **valeur** — depuis `$lib/server/ai/service`, puis appelait `aiService.getAvailableProviders()` et `aiService.generate()` directement dans le navigateur. Cela embarquait les SDK Anthropic/OpenAI et les accès `process.env` dans le bundle client.

Correctifs appliqués :
- import réduit aux **types seuls** depuis `router.ts` (effacés à la compilation, donc sans fuite) ;
- `checkProviders()` passe désormais par `GET /api/skills/config` ;
- `runTest()` passe par un nouvel endpoint `POST /api/ai/test` ;
- au passage, correction d'un `providers.map(...)` appliqué à un `Record` (jamais un tableau) — bug latent qui aurait levé un `TypeError` à l'exécution.

**4. Nouvel endpoint — `src/routes/api/ai/test/+server.ts`**

Expose l'exécution IA multi-provider au panneau de réglages. Authentifié dès l'écriture (`locals.session`, refus des invités), avec validation du provider contre une liste blanche. C'est le seul ajout de surface de cette phase ; il ne fait pas partie des 12 endpoints non protégés du §3.3.

**5. Bindings natifs — `package.json`**

`pnpm rebuild better-sqlite3` ne faisait rien : pnpm bloque les scripts de build des dépendances par défaut. Ajout de :

```json
"pnpm": { "onlyBuiltDependencies": ["better-sqlite3"] }
```

Le binding se compile désormais et la base s'ouvre.

**6. Gate de vérification — `package.json`**

```json
"verify": "npm run build && npm run test:unit -- --run"
```

Volontairement limité à ce qui est vert aujourd'hui. `check` et `lint` rejoindront ce script à l'issue de la phase 4 — les y mettre maintenant rendrait le gate inutilisable, donc ignoré.

### Vérification

| Contrôle | Avant | Après |
|---|---|---|
| `npx vite build` | ❌ `MISSING_EXPORT` | ✅ built in 7,09 s |
| `npx vitest --run` | ✅ 1 164 | ✅ 1 164 — aucune régression |
| Ouverture de `local.db` | ❌ bindings absents | ✅ 12 tables listées |

Tables réellement présentes dans `local.db` : `__drizzle_migrations`, `users`, `sessions`, `accounts`, `documents`, `document_shares`, `user_preferences`, `task`, `challenges`, `challenge_participants`, `writer_discovery`, `activity_events`.

### Constats annexes relevés pendant la phase 1

- **`/api/ai` retourne des données factices en cas d'échec.** `src/routes/api/ai/+server.ts` définit `STUB_SUGGESTIONS`, `STUB_ALERTS`, `STUB_SIGNALS` et un `getStubResponse()` utilisé en repli silencieux quand l'exécution du skill échoue. L'interface affiche alors des suggestions inventées sans rien signaler à l'utilisateur. À rendre explicite ou à supprimer.
- **Clés API en clair dans `localStorage`.** `AISettings.svelte` sérialise `providers` — clés comprises — sous `localStorage['ai-settings']`. À traiter avec le §3.2.
- **`/api/ai/complete` est câblé en dur sur Anthropic** (`claude-sonnet-4-20250514`), en contournant le routeur multi-provider. Incohérent avec le reste de l'architecture IA.
- **Imports `$lib/server` depuis des composants client** : cinq autres fichiers le font, mais uniquement en `import type` — sans effet à l'exécution. Seul `WordCountBadge.svelte` importe des **valeurs** (`countWords`, `countParagraphs`, `readingTimeMinutes` depuis `$lib/server/stats`). Ce sont des fonctions pures, donc sans danger, mais elles sont mal placées : à déplacer hors de `server/`.

---

## 12. Journal — Phase 1bis appliquée (15 août 2026)

**84 fichiers supprimés, 25 modifiés ou créés.**

Périmètre exécuté : celui explicitement décidé — challenges, objectifs, classement, badges, partage de documents, collaboration et présence. `discover`, `feed` et `profile/[username]` ont été **conservés** : ils n'entraient pas dans la décision, et supprimer au-delà du périmètre annoncé est le sens risqué. Ils ont seulement été débarrassés de leurs dépendances à la gamification.

### Recâblages notables

**Modèle de propriété des documents — `rbac.ts`**

Le point structurant. `document_shares` ne portait pas seulement la fonctionnalité de partage : il servait de **modèle de propriété**. `+page.server.ts` listait les documents d'un utilisateur en interrogeant cette table, et `createOwnerShare()` était appelé à chaque création.

Or `documents.user_id` existait déjà et portait la même information. `document_shares` la dupliquait. La suppression est donc propre :

- `getDocumentRole()` lit désormais `documents.user_id` ;
- `DocumentRole` se réduit à `'owner'` — un utilisateur possède un document ou n'y a aucun accès ;
- les trois appels à `requireDocumentRole(..., 'editor' | 'owner' | 'viewer')` deviennent des vérifications de propriété ;
- `+page.server.ts` liste les documents par `documents.user_id`.

`rbac.spec.ts` testait une matrice de rôles qui n'existe plus ; il a été réécrit pour le modèle propriétaire (8 tests).

**Composants dépouillés plutôt que supprimés**

`UserProfileCard.svelte` (statistiques de série, badges, semaines parfaites), `EditorToolbar.svelte` (présence, bouton de partage), `DocumentList.svelte` (badge « Shared », compteur de présence), `settings/+page.svelte` (objectif quotidien, tableau de bord, visibilité classement), `discover/+page.svelte` (séries et badges envoyés à l'API), `privacyStore` (`showOnLeaderboard`, `setLeaderboardVisibility`), `activityStore` (types d'événements `leaderboard_entry` et `goal_completed`), `MobileNavDrawer` (liens morts vers `/challenges` et `/leaderboard`).

**Migration** — `drizzle/0004_drop_gamification_and_sharing.sql` supprime `challenges`, `challenge_participants` et `document_shares`. ⚠️ Elle **ne peut pas encore être jouée** : le journal de migrations est cassé (§5.1). À appliquer une fois la phase 3 faite.

### Vérification

| Contrôle | Avant 1bis | Après 1bis |
|---|---|---|
| `npx vite build` | ✅ | ✅ 4,1 s |
| Tests unitaires | 1 164 passés (110 fichiers) | **867 passés, 0 échec** (83 fichiers) |
| `svelte-check` | 182 erreurs / 55 fichiers | **135 erreurs / 47 fichiers** (−47) |
| Warnings CSS inutilisé | 0 | 0 (CSS mort purgé au fur et à mesure) |

La baisse du nombre de tests (−297) correspond aux specs des fonctionnalités supprimées. Aucun test restant n'échoue.

### Constat : tests navigateur instables

Lors d'une exécution intermédiaire, quatre specs non liées à la suppression ont échoué — `HardenModal`, `ReviewToolbar`, `SuggestionItem`, `DocumentList` (« calls onSelect ») — puis sont repassées au vert **sans aucune modification**. Ce sont des tests `vitest-browser-svelte` pilotés par des clics : ils sont instables (*flaky*).

C'est un problème de fond pour le seul gate vert du projet : un test qui échoue au hasard finit par être ignoré, et masque les vraies régressions. À investiguer (attentes explicites plutôt que délais implicites) avant de faire de `verify` un gate bloquant en CI.

### Reste à faire sur ce périmètre

- Specs e2e référençant encore les fonctionnalités retirées : `server-sync`, `sprint-17`, `sprint28`, `sprint32-notifications`, `sprint37-cursors`, `sprint39-41`, `sprint42-46`, `sprint47-wiring`, `sprint51`, `sprint52`. Non traitées ici (les e2e ne sont pas exécutables tant que la phase 3 n'est pas faite).
- `README.md`, `docs/USER_GUIDE.md`, `docs/API.md` décrivent toujours partage, collaboration et gamification.
- Notifications : le contenu restant est surtout social. À réévaluer.
- `discover` / `feed` / `profile/[username]` : décision produit toujours ouverte (cf. tableau en phase 1bis).

---

## 13. Journal — Phase 2 appliquée (15 août 2026)

### 🔴 Le vrai périmètre était bien plus large que le §3.3

Le §3.3 classait 12 endpoints « sans référence d'authentification » et 28 « avec ». Cette seconde catégorie était **trompeuse**, et l'erreur vient de `hooks.server.ts` :

```ts
} else {
	// No authenticated session: create a lightweight guest identity
	event.locals.session = null;
	event.locals.user = { id: 'guest', name: 'Guest', role: 'guest' } as any;
	event.locals.isGuest = true;
}
```

En l'absence de session, `locals.user` est **toujours** renseigné avec un utilisateur factice. Or la garde majoritaire dans le code était :

```ts
if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
```

Cette condition **ne peut jamais être vraie**. Ces endpoints se croyaient protégés et ne l'étaient pas.

Décompte réel après la phase 1bis, sur 26 endpoints :

| Garde effective | Nombre |
|---|---|
| `locals.session` (réelle) | 1 — `ai/test`, écrit en phase 1 |
| `locals.isGuest` (réelle) | 2 — les deux endpoints `guest/*` |
| `!locals.user` (**inopérante**) | 9 |
| Aucune | 14 |

Soit **24 endpoints sur 26 atteignables sans authentification**, dont toute la surface IA facturée et `skills/config`.

### Correctifs

**1. Garde global `/api`, fermé par défaut — `src/lib/server/apiGuard.ts` + `hooks.server.ts`**

Plutôt que de réparer neuf gardes une par une — et d'en oublier au prochain endpoint ajouté — la politique est centralisée et inversée : **tout `/api` est refusé sauf liste blanche explicite**.

```ts
export const PUBLIC_API_PREFIXES = [
	'/api/auth',          // handler better-auth (connexion, inscription, callbacks)
	'/api/guest/status',  // renvoie l'état invité ; exiger une session n'aurait pas de sens
	'/api/guest/convert'  // convertit un invité en compte réel
];
```

Propriétés retenues :

- **Échec fermé.** Un endpoint ajouté demain est protégé sans intervention. Un test le vérifie explicitement.
- **Autorisation basée sur `session`, pas sur `user`** — précisément la confusion à l'origine du problème.
- **Neutre en mode mock/dev/e2e** : sans backend d'authentification il n'y a pas de session à vérifier, et l'application sert déjà des données factices. Sans cette clause, le développement local et les tests e2e seraient cassés.
- **Politique extraite dans un module pur**, testable sans monter better-auth ni SvelteKit. `hooks.server.ts` ne fait plus qu'appeler `shouldDenyApiRequest()` et composer via `sequence()`.

**15 tests** couvrent la politique (`apiGuard.spec.ts`), dont les correspondances de préfixe aux frontières de chemin (`/api/authorize-everything` ne doit pas passer pour `/api/auth`) et le cas « endpoint flambant neuf ».

**2. Fuite de clés API — `/api/skills/config`**

- Authentification exigée sur `GET` et `POST` (en plus du garde global — défense en profondeur : l'endpoint reste correct si la liste blanche change).
- **La réponse ne contient plus jamais `apiKey`.** Seul `api_key_configured` (booléen) subsiste, ce qui suffit à l'interface.
- Le stockage passe d'une `Map` unique de processus à **une `Map` par utilisateur**. Auparavant la clé saisie par un utilisateur servait aux requêtes de tous les autres.
- Validation du nom de provider contre une liste blanche à l'écriture.

**3. Clés API hors de `localStorage` — `AISettings.svelte`**

Le composant sérialisait `providers`, clés comprises, sous `localStorage['ai-settings']`. Tout ce qui est stocké là est lisible par n'importe quel script de l'origine : une seule XSS livrait l'ensemble des clés. Les clés sont désormais envoyées au serveur mais retirées de la copie locale.

**4. CSP — `unsafe-eval` retiré**

Rien dans l'application n'évalue de code à l'exécution. `unsafe-inline` reste nécessaire (données d'hydratation SvelteKit et styles inline) ; le retirer demande des nonces par requête et reste à faire.

### Vérification

| Contrôle | Avant phase 2 | Après |
|---|---|---|
| `npx vite build` | ✅ | ✅ 3,3 s |
| Tests unitaires | 867 passés | ✅ **882 passés, 0 échec** (+15) |
| Endpoints `/api` non authentifiés | 24 / 26 | **0 / 26** hors liste blanche de 3 |

### Reste à faire

- **`unsafe-inline` dans la CSP** — nécessite des nonces par requête.
- **Rate limiting sur `skills/config` et `skills/execute`** — ils sont désormais authentifiés, mais toujours sans plafond.
- **Persistance chiffrée des clés API.** Le stockage reste en mémoire et par processus : perdu au redémarrage, incohérent en multi-instance.
- **Nettoyer les gardes `!locals.user` mortes** dans les neuf endpoints concernés. Elles sont inoffensives — le garde global couvre — mais elles donnent une fausse impression de protection à la lecture.

---

## 14. Journal — Phase 4 partielle (15 août 2026)

### ESLint réparé

Le crash venait bien d'une incompatibilité de versions, pas de la configuration. `typescript-eslint` 8.57.1 → **8.67.0** et `eslint-plugin-svelte` 3.15.2 → **3.23.0**. La documentation amont confirme qu'ESLint 10 est supporté par la branche 8.x à condition d'être assez récent ; le projet était en retard de dix versions mineures.

ESLint s'exécute désormais et remonte **297 problèmes réels** (12 corrigés automatiquement). Le gate passe de « inutilisable » à « bruyant mais exploitable ».

| Règle | Occurrences |
|---|---|
| `@typescript-eslint/no-unused-vars` | 136 |
| `@typescript-eslint/no-explicit-any` | 53 |
| `svelte/require-each-key` | 27 |
| `svelte/no-navigation-without-resolve` | 26 |
| `svelte/prefer-svelte-reactivity` | 16 |
| autres (13 règles) | 39 |

`svelte/require-each-key` mérite une attention particulière : 27 boucles `{#each}` sans clé, source classique de réconciliation DOM incorrecte sur listes réordonnées.

### Mockups sortis du périmètre Svelte

Les 12 fichiers de `src/lib/elements/mockups/` sont des descripteurs pseudo-HTML, pas des composants. Renommés `.svelte` → `.html`, **en place** : ils décrivent l'interface, donc ils restent à côté des composants qu'ils documentent.

Effet : **135 → 111 erreurs** de typage, **28 → 8 warnings**.

### Débris supprimés à la racine

`tmp_sse_parse.js` (script d'expérimentation SSE), `auth_page.html` (vide) et `auth_page_resp.html` — tous versionnés par accident, référencés nulle part. Récupérables via l'historique git si besoin.

### État des gates

| Gate | À l'analyse | Maintenant |
|---|---|---|
| Build | ❌ `MISSING_EXPORT` | ✅ vert |
| Typecheck | ❌ 182 erreurs / 55 fichiers | 🟠 **111 erreurs / 36 fichiers** |
| Lint | ❌ crash | 🟠 **297 problèmes** (s'exécute) |
| Tests unitaires | ✅ 1 164 | ✅ **882, 0 échec** |

### Reste à faire

- Résorber les 297 problèmes de lint, en commençant par `require-each-key` (correction) puis `no-unused-vars` (nettoyage).
- Résorber les 111 erreurs de typage restantes.
- Ajouter `check` et `lint` à `pnpm verify` une fois les deux au vert — c'est la condition pour en faire un gate bloquant.
- Phase 3 (journal de migrations) toujours ouverte : elle bloque `db:migrate`, les tests e2e et la migration `0004`.
