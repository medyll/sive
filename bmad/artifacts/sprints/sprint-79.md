# Sprint 79 — Command Bus

**Status:** Planned  
**Target:** 2-3 jours  
**Priority:** P0 — UI/AI communication layer

---

## Context

**Problem:** Skills need to trigger UI actions without knowing UI internals. Command Bus is the communication channel.

**Spec Reference:** `bmad/references/project/5-ai-architecture-mcp-skills.md` §5.5

---

## Stories

### S79.01 — Command Bus Core + Registry

**Goal:** Implement central command bus with 30+ command registrations.

**Acceptance Criteria:**
- [ ] `emitCommand(command, params)` — Central emission function
- [ ] Command registry with categories (ui/editor/suggestions/etc.)
- [ ] 30+ commands registered
- [ ] Type-safe command signatures
- [ ] Error handling for unknown commands
- [ ] Command execution logging

**Commands to Register:**

**UI (10):**
- `ui.open_tab(tab: string)`
- `ui.scroll_to(anchor: string)`
- `ui.highlight_range(start, end, color)`
- `ui.show_notification(message, level)`
- `ui.show_modal(title, content, actions)`
- `ui.set_spinner(visible: bool)`
- `ui.focus_editor()`
- `ui.toggle_focus_mode(active: bool)`
- `ui.close_modal()`
- `ui.navigate_to(screen: string)`

**Editor (4):**
- `editor.inject_text(position, text)`
- `editor.replace_range(start, end, text)`
- `editor.get_selection()`
- `editor.get_full_text()`

**Suggestions (2):**
- `suggestions.push_diff(original, proposal)`
- `suggestions.clear()`

**Coherence (2):**
- `coherence.push_alert(entity, discrepancy_type, confidence, note)`
- `coherence.clear()`

**Style (2):**
- `style.push_signal(location, signal, suggestion)`
- `style.clear()`

**Versioning (3):**
- `harden.trigger(label, message)`
- `timeline.refresh()`
- `timeline.highlight_version(id)`

**Review (2):**
- `review.push_report(report)`
- `review.highlight_passage(start, end, report_section)`

**Generic (5):**
- `app.export_file(content, format, name)`
- `app.navigate_to(screen)`
- `app.reload_project()`
- `app.run_skill(skill_id, params)`
- `app.cancel_skill(skill_id)`

**Files to Create:**
- `src/lib/mcp/commandBus.ts` — Core implementation
- `src/lib/mcp/commandRegistry.ts` — Command registry
- `src/lib/mcp/commandBus.spec.ts` — 10+ tests

**Estimated:** 8-10 hours

---

### S79.02 — UI Command Handlers

**Goal:** Implement all UI command handlers in components.

**Acceptance Criteria:**
- [ ] Tab opening/closing works
- [ ] Scroll to anchor works
- [ ] Text highlighting works
- [ ] Notifications display
- [ ] Modals open/close
- [ ] Spinner control works
- [ ] Focus mode toggle works
- [ ] Screen navigation works

**Files to Modify:**
- `src/routes/+page.svelte` — Add command listeners
- `src/lib/elements/AIPanel.svelte` — Add tab commands
- `src/lib/elements/Modal.svelte` — Add modal commands

**Estimated:** 6-8 hours

---

### S79.03 — Editor Command Handlers

**Goal:** Implement editor command handlers.

**Acceptance Criteria:**
- [ ] Text injection at position works
- [ ] Range replacement works
- [ ] Selection retrieval works
- [ ] Full text retrieval works
- [ ] Cursor position maintained after edits

**Files to Modify:**
- `src/lib/elements/EditorPanel.svelte` — Add command listeners

**Estimated:** 4-6 hours

---

## Dependencies

- ✅ MCP tools (S78) — Skills call MCP, then emit commands
- ❌ Skills engine (S81) — Will use Command Bus
- ❌ UI components need updating

---

## Test Strategy

**Command Emission Test:**
```typescript
describe('emitCommand', () => {
  it('executes registered command', () => {
    emitCommand('ui.open_tab', { tab: 'coherence' });
    expect(mockOpenTab).toHaveBeenCalledWith('coherence');
  });
  
  it('throws for unknown command', () => {
    expect(() => emitCommand('unknown.command')).toThrow();
  });
});
```

**UI Integration Test:**
```typescript
describe('UI commands', () => {
  it('opens tab when command emitted', async () => {
    render(EditorPanel);
    emitCommand('ui.open_tab', { tab: 'suggestions' });
    await waitFor(() => {
      expect(screen.getByText('Suggestions')).toBeInTheDocument();
    });
  });
});
```

---

## Success Metrics

- [ ] 30+ commands registered
- [ ] All commands executable
- [ ] UI responds to commands
- [ ] Editor responds to commands
- [ ] 15+ unit tests passing

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Command naming inconsistent | Use dot notation (category.action) |
| Too many commands | Group by module, lazy load |
| UI not responding | Add command execution logging |

---

**Ready for dev:** ✅ Yes (spec complete)  
**Blocked by:** S78 (MCP tools for context)
