# Sprint 27 — PDF Export & Mobile UX Polish

**Status:** done
**Focus:** Implement PDF export via headless rendering, and improve mobile responsiveness & touch interactions.
**Dates:** 2026-03-17

---

## Stories

### S27-01: PDF export library integration
Add `html2pdf` or `puppeteer` dependency. Create `/api/export/pdf` endpoint that:
- Accepts `docId` and optional `includeSummary` query params.
- Renders the document + optional summary preface to HTML.
- Returns a PDF blob with proper headers.
- Mock/dev fallback returns stub PDF data.

### S27-02: PDF export button in ExportButton
Update `ExportButton.svelte`:
- Add a "PDF (.pdf)" option to the export menu.
- Call `/api/export/pdf` and trigger a client-side download.
- Show a loading spinner while rendering.

### S27-03: Mobile menu accessibility
Enhance mobile responsiveness:
- Ensure all toolbar buttons are touch-friendly (min 44px tap target).
- Make the sidebar collapse/expand smoother on mobile.
- Test with viewport widths 320px–768px.

### S27-04: Touch-friendly summary & export panels
Adjust panel positioning for mobile:
- Summary panel should not overflow viewport on small screens.
- Export menu should position intelligently (top/bottom/left/right).
- Add swipe-to-close gesture support (optional).

### S27-05: Unit tests
- `/api/export/pdf` endpoint logic (mock fallback, error handling).
- PDF filename sanitization.

### S27-06: E2E tests
- Download PDF from export menu and verify file exists.
- Verify PDF includes summary when checkbox is enabled.
- Test export on mobile viewport (320px).
