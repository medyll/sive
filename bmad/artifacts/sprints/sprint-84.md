# Sprint 84 — Hybrid AI (Ollama + Cloud Routing)

**Status:** Planned  
**Target:** 3 jours  
**Priority:** P0 — Production AI architecture

---

## Context

**Problem:** Currently only Anthropic API is configured. Spec requires **local Ollama + cloud routing** for privacy and cost optimization.

**Spec Reference:** `bmad/references/project/4-intelligence-data.md` §4.1 + `5-ai-architecture-mcp-skills.md`

---

## Stories

### S84.01 — Ollama Local Integration

**Goal:** Integrate Ollama for local AI inference.

**Acceptance Criteria:**
- [ ] Ollama client configured
- [ ] Local model selection (mistral, llama2, etc.)
- [ ] Prompt formatting for Ollama
- [ ] Response parsing
- [ ] Error handling (Ollama not running)
- [ ] Fallback to cloud if Ollama unavailable

**Ollama Config:**
```typescript
// src/lib/ai/ollamaClient.ts
const OLLAMA_BASE = 'http://localhost:11434';

export async function generate(prompt: string, model: string = 'mistral'): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false
    })
  });
  const data = await response.json();
  return data.response;
}
```

**Files to Create:**
- `src/lib/ai/ollamaClient.ts` — Ollama client
- `src/lib/ai/ollamaClient.spec.ts` — 5+ tests

**Estimated:** 6-8 hours

---

### S84.02 — AI Model Router

**Goal:** Route AI requests to appropriate model based on task type.

**Acceptance Criteria:**
- [ ] Routing config per task type
- [ ] Local (Ollama) for sensitive data
- [ ] Cloud (Anthropic/Gemini) for long tasks
- [ ] Fallback chain (Ollama → Anthropic → Gemini)
- [ ] User-configurable routing
- [ ] Model usage logging

**Routing Config:**
```yaml
# src/lib/ai/routingConfig.yaml
routing:
  coherence: ollama/mistral      # Local — sensitive data
  style: ollama/mistral          # Local
  review: cloud/gemini           # Cloud — long task
  suggestions: cloud/anthropic   # Cloud — max quality
  ghost_text: ollama/mistral     # Local — low latency
  fallback: ollama/mistral       # If cloud unavailable
```

**Router Implementation:**
```typescript
// src/lib/ai/modelRouter.ts
export async function routeAI(taskType: string, prompt: string): Promise<string> {
  const route = routingConfig[taskType] || routingConfig.fallback;
  
  if (route.startsWith('ollama')) {
    try {
      return await ollama.generate(prompt, route.split('/')[1]);
    } catch (error) {
      console.warn('Ollama failed, falling back to cloud');
      return routeToCloud(taskType, prompt);
    }
  } else {
    return routeToCloud(taskType, prompt);
  }
}
```

**Files to Create:**
- `src/lib/ai/modelRouter.ts` — Router implementation
- `src/lib/ai/routingConfig.ts` — Routing configuration
- `src/lib/ai/modelRouter.spec.ts` — 8+ tests

**Estimated:** 6-8 hours

---

### S84.03 — Cloud AI Providers (Multi-Provider)

**Goal:** Support multiple cloud AI providers.

**Acceptance Criteria:**
- [ ] Anthropic Claude integration (existing)
- [ ] Google Gemini integration (new)
- [ ] OpenAI GPT integration (optional)
- [ ] Provider selection by task
- [ ] API key management
- [ ] Cost tracking per provider

**Files to Create:**
- `src/lib/ai/geminiClient.ts` — Gemini client
- `src/lib/ai/openaiClient.ts` — OpenAI client (optional)
- `src/lib/ai/providerManager.ts` — Provider management

**Estimated:** 6-8 hours

---

### S84.04 — AI Settings UI

**Goal:** User configuration for AI routing.

**Acceptance Criteria:**
- [ ] Settings page with AI section
- [ ] Toggle: Local vs Cloud preference
- [ ] Model selection dropdown
- [ ] API key inputs (Anthropic, Gemini, OpenAI)
- [ ] Test connection button
- [ ] Usage statistics (tokens, cost)

**Files to Modify:**
- `src/routes/settings/+page.svelte` — AI settings section
- `src/lib/aiSettingsStore.svelte.ts` — Settings storage

**Estimated:** 4-6 hours

---

## Dependencies

- ✅ Skills Engine (S81) — Uses model router
- ✅ skill_coherence (S82) — Task type for routing
- ✅ skill_review (S83) — Task type for routing
- ❌ Ollama must be installed locally for testing

---

## Test Strategy

**Router Test:**
```typescript
describe('modelRouter', () => {
  it('routes coherence to Ollama', async () => {
    await routeAI('coherence', 'Check consistency...');
    expect(mockOllamaGenerate).toHaveBeenCalled();
  });
  
  it('routes review to Cloud', async () => {
    await routeAI('review', 'Analyse full chapter...');
    expect(mockAnthropicGenerate).toHaveBeenCalled();
  });
  
  it('falls back on Ollama failure', async () => {
    mockOllamaGenerate.mockRejectedValue(new Error('not running'));
    await routeAI('coherence', 'Check...');
    expect(mockAnthropicGenerate).toHaveBeenCalled();
  });
});
```

---

## Success Metrics

- [ ] Ollama integration working
- [ ] Model router functional
- [ ] Multi-provider support
- [ ] Settings UI complete
- [ ] 20+ unit tests passing
- [ ] Fallback chain tested

---

## Environment Variables

```env
# .env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral

ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
OPENAI_API_KEY=sk-...

AI_ROUTING_COHERENCE=ollama/mistral
AI_ROUTING_STYLE=ollama/mistral
AI_ROUTING_REVIEW=cloud/gemini
AI_ROUTING_SUGGESTIONS=cloud/anthropic
```

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Ollama not installed | Clear setup docs, fallback to cloud |
| API costs high | Default to local for most tasks |
| Latency on cloud | Async processing, show spinner |
| Privacy concerns | Local-first for sensitive data |

---

**Ready for dev:** ✅ Yes (spec complete)  
**Blocked by:** S81 (Skills Engine needs AI)

---

## 📊 S78-S84 SUMMARY

| Sprint | Goal | Stories | Effort | Dependencies |
|--------|------|---------|--------|--------------|
| **S78** | MCP Tools | 4 | 3-4 jours | None |
| **S79** | Command Bus | 3 | 2-3 jours | S78 |
| **S80** | YAML + Types | 3 | 2-3 jours | None |
| **S81** | Skills Engine | 2 | 2 jours | S78, S79, S80 |
| **S82** | skill_coherence | 2 | 2 jours | S78-S81 |
| **S83** | skill_review + skill_style | 4 | 2-3 jours | S78-S82 |
| **S84** | Hybrid AI | 4 | 3 jours | S81, S82, S83 |

**Total: 22 stories, ~18-20 jours de développement**

---

**PLANIFICATION COMPLETE ✅**

Toutes les stories S78-S84 sont maintenant détaillées avec :
- Critères d'acceptation
- Fichiers à créer
- Estimates
- Dependencies
- Stratégie de test
- Risques

**Prêt à coder S78.01 !** 🚀
