# Analyse technique — Sive

**Dernière mise à jour :** 15 août 2026
**Méthode :** exécution réelle des gates (`build`, `svelte-check`, `eslint`, `vitest`, `db:migrate`, `playwright`) et lecture ciblée du code. Aucune conclusion reprise d'un document existant.

> Ce document décrit **l'état courant** du dépôt. L'historique de ce qui a été trouvé puis corrigé est regroupé en §9, pas dispersé dans le reste.

---

## 1. Résumé

Sive est une application d'écriture assistée par IA : éditeur riche, panneau IA multi-provider, versioning de documents, moteur de skills, export, notifications, découverte d'auteurs.

L'architecture est saine — séparation `server/` nette, un module par domaine, tests colocalisés, Svelte 5 runes utilisées de façon cohérente. Le socle de tests unitaires est authentique et solide.

Trois réserves demeurent, par ordre d'importance :

1. **La suite e2e ne passe pas** et n'a probablement jamais été exécutée en vert.
2. **18 % des composants ne sont montés nulle part** — du code testé, maintenu, jamais rendu.
3. **Typage et lint ne sont pas propres** (80 et 206), ce qui empêche d'en faire des gates bloquants.

### Gates

| Gate | Commande | Résultat |
|---|---|---|
| Build | `pnpm build` | ✅ vert |
| Tests unitaires | `pnpm test:unit -- --run` | ✅ **840 passés, 0 échec** |
| Vérification combinée | `pnpm verify` | ✅ build + tests |
| Typecheck | `pnpm check` | 🟠 80 erreurs / 31 fichiers |
| Lint | `pnpm lint` | 🟠 206 problèmes |
| Migrations | `pnpm db:migrate` | ✅ chaîne complète validée |
| Tests e2e | `pnpm test:e2e` | ❌ échecs massifs |

`pnpm verify` n'inclut volontairement que ce qui est vert. `check` et `lint` l'y rejoindront quand ils le seront.

---

## 2. Stack

| Couche | Techno | Version |
|---|---|---|
| Framework | SvelteKit 2 + Svelte 5 (runes) | 2.59 / 5.54 |
| Build | Vite 8 (rolldown) | 8.0.10 |
| CSS | Tailwind v4 + `@medyll/css-base` | 4.2.2 / 0.1.4 |
| Auth | Better-Auth | 1.5.5 |
| DB | SQLite (better-sqlite3) + Drizzle ORM | 12.8 / 0.45.2 |
| IA | SDK Anthropic, OpenAI, Google Generative AI, Ollama | — |
| Tests | Vitest 4 + Playwright 1.58 | — |

**Volumétrie :** 73 composants Svelte, 210 modules TypeScript, 26 endpoints API, 14 pages, 81 specs unitaires, 47 specs e2e.

---

## 3. Architecture

```
src/
├── routes/
│   ├── pages (14)      éditeur (/), dashboard, feed, discover,
│   │                   profile, profile/[username], settings,
│   │                   auth, auth/signup, offline, demo/*
│   └── api/ (26)       ai/*, skills/*, export/*, versions, templates,
│                       search, stats, activity, discover,
│                       notifications, users/search, guest/*, mcp/tools
├── lib/
│   ├── elements/       composants UI
│   ├── editor/         éditeur riche (ghost text, suggestions)
│   ├── skills/         moteur de skills (définitions JSON/YAML)
│   ├── shared/         code transverse : command bus, data-loader,
│   │                   skill engine, stores partagés
│   ├── gestures/, tools/, types/, styles/
│   └── server/         apiGuard, auth, rbac, rateLimit, search,
│                       versions, templates, stats, notifications,
│                       exportFormats, inputValidation,
│                       discoveryQueries, ai/, mcp/, skills/, db/
└── data/
```

> `src/lib/shared/` est du **code partagé**, sans rapport avec une quelconque fonctionnalité de partage. Un `grep share` naïf y fait des dégâts.

### Modèle de propriété

Un document appartient à un utilisateur unique, via `documents.user_id`. `getDocumentRole()` lit cette colonne ; `DocumentRole` vaut `'owner'` ou rien. Il n'existe ni rôle intermédiaire, ni partage, ni collaboration.

---

## 4. Sécurité

### Garde `/api` fermé par défaut

Toute route sous `/api` est refusée sans session authentifiée, **sauf liste blanche explicite** :

```ts
// src/lib/server/apiGuard.ts
export const PUBLIC_API_PREFIXES = [
	'/api/auth',          // handler better-auth
	'/api/guest/status',  // renvoie l'état invité
	'/api/guest/convert'  // convertit un invité en compte réel
];
```

Trois propriétés à préserver si l'on touche à ce code :

- **Échec fermé.** Un endpoint ajouté demain est protégé sans intervention. Un test le vérifie explicitement.
- **L'autorisation se base sur `locals.session`, jamais sur `locals.user`.** `hooks.server.ts` attribue un utilisateur invité factice en l'absence de session : `locals.user` est **toujours** vrai et ne constitue pas un signal d'autorisation. C'est précisément la confusion qui avait laissé 24 endpoints sur 26 ouverts (§9.3).
- **Neutre en mode mock/dev/e2e.** Sans backend d'authentification il n'y a pas de session à vérifier. Sans cette clause, le développement local et l'e2e seraient cassés.

La politique est un module pur (`apiGuard.ts`), couverte par 15 tests.

### État

| Point | État |
|---|---|
| Endpoints `/api` non authentifiés | ✅ 0 sur 26, hors liste blanche de 3 |
| Clés API en réponse HTTP | ✅ jamais renvoyées (`api_key_configured` seul) |
| Stockage des clés API | 🟠 en mémoire, **par utilisateur**, perdu au redémarrage |
| Clés API en `localStorage` | ✅ retirées |
| En-têtes de sécurité | ✅ CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy` |
| CSP `unsafe-eval` | ✅ retiré |
| CSP `unsafe-inline` | 🟠 encore nécessaire (hydratation SvelteKit + styles inline) — demande des nonces |
| Rate limiting | 🟠 présent sur IA, export, search, versions, templates — absent sur `skills/config` et `skills/execute` |
| RBAC, validation d'entrée | ✅ modules dédiés, testés |
| Secrets en dur | ✅ aucun ; les clés transitent par `process.env` côté serveur |

---

## 5. Base de données

**9 tables :** `users`, `sessions`, `accounts`, `documents`, `user_preferences`, `task`, `writer_discovery`, `activity_events`, plus `__drizzle_migrations`.

Le journal de migrations et les fichiers correspondent 1:1 sur cinq entrées ; la chaîne complète s'applique proprement depuis une base vide. `local.db` a été recréée à partir des migrations.

`drizzle.config.ts` ne pointe que sur `schema.ts`, ce qui est suffisant : ce fichier ré-exporte `auth.schema` et `schema/discovery`, donc Drizzle voit bien toutes les tables.

**Pas de table pour** : versions, templates, notifications. Ces fonctionnalités s'appuient sur l'état en mémoire décrit au §6.

---

## 6. Limites structurelles

### État serveur en mémoire

Plusieurs modules conservent leur état dans la mémoire du processus, sans persistance : `notifications`, `skills/engine`, `ai/router` (clés API comprises), `commands/bus`.

Deux conséquences, l'une et l'autre bloquantes pour un déploiement sérieux :

- tout est perdu au redémarrage ;
- **rien ne fonctionne au-delà d'une instance unique** — une requête peut atteindre un processus qui ignore ce que le précédent a fait.

`ecosystem.config.js` est donc épinglé à une instance unique en mode `fork`, avec un commentaire expliquant pourquoi. Ne pas repasser en `cluster` avant d'avoir persisté cet état.

### Composants jamais montés

**10 composants sur 57 ne sont rendus nulle part** — aucun `<Nom>` ailleurs dans le code :

`AISettings`, `DocumentFilterPanel`, `DocumentSearch`, `EditorToolbar`, `PerformanceDashboard`, `SlashMenu`, `StatsPanel`, `SuggestionToolbar`, `VirtualDocumentList`, `WordCountBadge`

Deux d'entre eux ont des tests unitaires qui passent. C'est le piège : une suite verte donne l'impression que la fonctionnalité existe, alors que le composant n'est jamais atteint par un utilisateur.

`AISettings` est le cas le plus visible : le panneau de configuration IA — providers, clés, routage par type de tâche — n'est accessible depuis aucune page, alors que la page Réglages est censée l'accueillir.

Décision à prendre pour chacun : le câbler ou le supprimer. Les laisser en l'état, c'est maintenir et tester du code que personne n'exécute.

### `/api/ai` renvoie des données factices

`src/routes/api/ai/+server.ts` définit `STUB_SUGGESTIONS`, `STUB_ALERTS` et `STUB_SIGNALS`, servis en repli silencieux quand l'exécution d'un skill échoue. L'interface affiche alors des suggestions inventées sans rien signaler. À rendre explicite ou à supprimer.

### `/api/ai/complete` contourne le routeur

Câblé en dur sur Anthropic (`claude-sonnet-4-20250514`), il ignore le routeur multi-provider utilisé partout ailleurs.

---

## 7. Tests

### Unitaires — le point fort

**840 tests, 81 fichiers, 0 échec, stables.** Specs colocalisées avec les sources, y compris côté serveur.

La suite était instable : des specs navigateur à base de clics échouaient environ une exécution sur trois, puis repassaient sans modification. Diagnostic en §9.6. Le projet `client` tourne désormais en `fileParallelism: false` avec `testTimeout: 20000`, et enregistre le hook de nettoyage via `setupFiles`.

`SummaryPanel.svelte.spec.ts` reste exclu en dur du script `test:unit` — dette masquée, à documenter ou corriger.

### E2E — ne passe pas

47 specs Playwright. La suite produit des dizaines d'échecs, et **cet état est antérieur à tous les travaux consignés ici** : `smoke.spec` attend un `<h1>` que la page éditeur n'a jamais eu, y compris au commit `02395fb`.

Les specs ont été nettoyées des fonctionnalités supprimées, mais rendre l'e2e vert est un chantier à part entière. Bon point de départ : le `<h1>` manquant, qui est aussi un défaut d'accessibilité.

---

## 8. Ce qui reste ouvert

Par ordre de valeur décroissante :

1. **Suite e2e** — chantier à part entière. Commencer par le `<h1>` manquant sur la page éditeur.
2. **10 composants non montés** — câbler ou supprimer, en commençant par `AISettings`.
3. **80 erreurs de typage** — dont ~40 « type non assignable », réparties sur `+page.svelte`, `MobileEditorToolbar`, `ai/router`, `ai/service`.
4. **206 problèmes de lint** — dominés par `no-unused-vars` (74) et `no-explicit-any` (53).
5. **État serveur en mémoire** — bloque le multi-instance et la survie au redémarrage.
6. **`/api/ai` en repli factice** — rendre l'échec visible.
7. **Rate limiting** sur `skills/config` et `skills/execute`.
8. **CSP `unsafe-inline`** — demande des nonces par requête.
9. **Fichier `LICENSE`** — le README annonce MIT, le dépôt n'a ni fichier ni champ `license`.
10. **`AUDIT.md`** — à archiver ou dater : plusieurs de ses affirmations sont fausses et vérifiablement fausses (cf. §9.1).
11. **`pnpm verify`** — y ajouter `check` et `lint` une fois au vert.

---

## 9. Historique — 15 août 2026

Point de départ : commit `02395fb`, branche `main`.

### 9.1 État initial, et l'écart avec `AUDIT.md`

`AUDIT.md` (3 mai 2026, généré par un autre outil) annonçait « Production Ready », « Qualité Code 9/10 », « TypeScript strict partout », score global 8,2/10.

Mesures réelles au même commit :

| Gate | Annoncé | Mesuré |
|---|---|---|
| Build | — | ❌ échec `MISSING_EXPORT` |
| Typecheck | « strict partout » | ❌ 182 erreurs / 55 fichiers |
| Lint | ✅ | ❌ crash (`TypeError` dans le plugin) |
| Tests unitaires | 1 072 + 42 e2e | ✅ 1 164 (mais instables) |
| Endpoints `/api` ouverts | — | 24 sur 26 |

`AUDIT.md` listait par ailleurs `docs/USER_GUIDE.md` et `docs/API.md` comme « ✅ Bon » : **ni l'un ni l'autre n'existe**.

### 9.2 Build débloqué — `21b8d84`

`service.ts` importait `AIProvider` et `ModelConfig` en position de valeur alors que `router.ts` les exporte en types purs. Vitest utilise esbuild, qui efface les types en silence : la suite restait verte pendant que le build était cassé. Rien dans le pipeline ne lançait `build`.

En réparant cela, un défaut plus grave est apparu : `AISettings.svelte`, composant **client**, importait `aiService` en valeur depuis `$lib/server` et appelait `aiService.generate()` dans le navigateur — embarquant les SDK Anthropic/OpenAI et les accès `process.env` dans le bundle client. Réacheminé via l'API, avec un nouvel endpoint `POST /api/ai/test` authentifié.

Également : `pnpm rebuild better-sqlite3` ne faisait rien (pnpm bloque les scripts de build par défaut) ; script `verify` ajouté.

### 9.3 Réduction du périmètre — `bb61718`

Décision produit : l'application reste simple. Retrait de la gamification (challenges, objectifs, classement, badges) et du travail partagé (partage de documents, collaboration, présence, curseurs distants). **84 fichiers supprimés.**

Le point structurant était la propriété des documents. `document_shares` ne portait pas que le partage : il servait de modèle de propriété, `+page.server.ts` listant les documents via cette table. Or `documents.user_id` portait déjà la même information — la table la dupliquait, la suppression n'a donc demandé aucune migration de données.

`discover`, `feed` et `profile/[username]` ont été **conservés** : hors périmètre décidé. Ils ont seulement perdu leurs dépendances à la gamification.

### 9.4 Sécurité — `5dceb08`

Le décompte initial de 12 endpoints non protégés était **très en dessous de la réalité**. Neuf endpoints se gardaient ainsi :

```ts
if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
```

Condition qui ne peut jamais être vraie, `hooks.server.ts` attribuant un utilisateur invité factice. Réel : **24 endpoints sur 26 atteignables sans authentification**, dont toute la surface IA facturée et `skills/config`, qui renvoyait en plus les clés API en clair depuis une `Map` partagée entre tous les utilisateurs.

Réparer neuf gardes une par une aurait laissé le piège intact pour le prochain endpoint. La politique a été centralisée et inversée (§4).

### 9.5 Outillage — `df73355`, `d88d130`

**ESLint** : le crash venait d'un décalage de versions, pas de la configuration. `typescript-eslint` 8.57.1 → 8.67.0, `eslint-plugin-svelte` 3.15.2 → 3.23.0.

**Mockups** : les 12 fichiers de `src/lib/elements/mockups/` sont des descripteurs pseudo-HTML, pas des composants — `<panel/>` auto-fermant suivi de `</panel>`. Renommés `.svelte` → `.html`, en place.

**Journal de migrations** : il référençait `0002_last_black_cat`, absent du disque, tandis que deux fichiers portaient le préfixe `0003`. Le croisement avec les snapshots a reconstitué l'histoire : le fichier généré avait été renommé à la main, et `0002_add_document_tags.sql` était un doublon de l'`ALTER` déjà contenu dans la migration idx 2.

### 9.6 Tests instables — `95e62dd`

Première hypothèse : accumulation du DOM entre tests, les specs interrogeant le locator global `page` après un `render()` local. Le projet `client` n'avait effectivement aucun `setupFiles` — or c'est lui qui enregistre le hook de nettoyage. L'ajouter était correct, mais **n'a pas résolu l'instabilité**.

En lisant le message d'erreur au lieu de le supposer : `Test timed out in 5000ms`. Des timeouts, pas des sélecteurs ambigus. Exécutée seule, la spec passe 4 fois sur 4. `locator.click()` attend l'actionnabilité, et la suite entière en parallèle prive le navigateur de ressources.

### 9.7 Qualité et documentation — `526a4f2`, `84469b0`, `f553561`, `c38cb12`

**27 `{#each}` sans clé** corrigés. Sans clé, Svelte réconcilie par position : réordonner une liste laisse l'état accroché au mauvais élément.

**Gestionnaires d'événements en casse React** — `onClick`, `onChange`, `onInput` sur des éléments DOM natifs dans `DocumentFilterPanel` et `DocumentSearch`. Svelte 5 ne lie que les attributs en minuscules : les douze gestionnaires étaient inertes.

> ⚠️ **Correction d'une surestimation.** Le message du commit `f553561` présentait cela comme un bug utilisateur visible (« le panneau de filtres ne filtrait rien »). C'est exact sur le fond, mais trompeur sur la portée : `DocumentFilterPanel` et `DocumentSearch` **ne sont montés nulle part** (§6). Aucun utilisateur n'a jamais pu cliquer sur ces contrôles. Le correctif reste juste ; son impact réel est nul tant que ces composants ne sont pas câblés.

**Recherche** : `DocumentSearch` affiche une rangée de tags sous garde `{#if result.tags && …}`, mais `SearchResult` n'a jamais eu ce champ — garde toujours fausse. `indexDocument` intégrait les tags au texte cherchable puis les jetait. Corrigé, 4 tests. Même réserve de portée que ci-dessus.

Autres défauts réels : `MilestoneNotification` utilisait `in:scale` sans importer `scale` ; trois spécificateurs de modules pointaient à côté ; `confetti.ts` gardait `ctx` contre `null` mais l'utilisait dans une fonction hoistée, où TypeScript ne propage pas le narrowing.

**Code mort résiduel** : un balayage des modules jamais importés a révélé quatre rescapés de la collaboration, manqués lors de la réduction de périmètre — `server/sharing.ts`, `cursorColors.ts`, `editor/cursor-sync.ts`, `editor/ot-adapter.ts`, avec leurs specs. Cause de l'oubli : l'inventaire cherchait `share` dans les noms de fichiers, et « sharing » ne contient pas « share ». Supprimés.

**Documentation** : `docs/API-WS.md` supprimé (documentait l'endpoint WebSocket retiré, qui n'était qu'un stub 501). `docs/DEPLOYMENT.md` était un vrai guide sous un titre WebSocket — conservé, retitré, section nginx/WSS remplacée. `ecosystem.config.js` renommé et passé de `cluster` à `fork` : le mode cluster était activement faux compte tenu de l'état en mémoire. README aligné sur l'application qui existe.

---

## 10. Annexe — commandes

```bash
pnpm verify
```

```bash
pnpm check
```

```bash
pnpm lint
```

```bash
pnpm test:e2e
```
