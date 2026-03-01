# calendar-frontend — Task List

Last updated: 2026-03-02

> **Rule:** When you complete a task, change `- [ ]` to `- [x]` and move it to the Done section.
> **Legend:** `[ ]` Not started · `[~]` Has code but broken/incomplete · `[x]` Done and working

---

## In Progress

_Nothing in progress right now._

---

## Phase 1 — Broken / Needs Fix (Priority)

These all have existing code in the codebase but are **not working**. Fix before building new things.

### MeetingDetail Page — Mock Data Everywhere
The page exists at `src/pages/meeting-detail/MeetingDetail.tsx` but shows hardcoded fake data.

- [~] Transcript tab — has mock speaker segments, needs real `TranscriptSegment[]` from API
- [~] Summary tab — has mock text, needs real `MeetingAISummary` from API
- [~] Action items tab — has mock items, needs real `MeetingActionItem[]` from API
- [~] Recording tab — shows placeholder, needs real recording info from API
- [~] Overview tab — SMA status indicators not reflecting real `transcriptionStatus`

**What to do:** Add React Query hooks, connect to real `/sma/meetings/:id/*` endpoints.

### Recording Upload — Not Connected
Upload UI exists but the file never reaches the backend.

- [~] File picker / drag-drop — exists in UI, not wired to API call
- [~] Upload progress bar — not functional
- [~] Post-upload: trigger transcription status polling
- [~] Show processing state while Deepgram is running (pulsing indicator)
- [~] On completion: auto-refresh transcript + summary tabs

**What to do:** Connect upload to `POST /sma/meetings/:id/recordings`, poll `transcriptionStatus`.

---

## Phase 1 — Not Built Yet

### Ask AI Chat Interface (Highest Impact)
- [ ] Chat panel inside MeetingDetail (new tab or side panel)
- [ ] Input: "Ask anything about this meeting..."
- [ ] Stream AI response
- [ ] Pre-loaded suggestions: "Summarize decisions", "List action items", "What were the blockers?"
- [ ] Conversation history within session
- [ ] Requires Ask AI backend endpoint first

### Action Items (Beyond Display)
- [ ] Mark action item complete / incomplete (toggle)
- [ ] Create action item manually (inline form)
- [ ] Delete action item

### Meeting Notes UI
- [ ] Create note (textarea + submit)
- [ ] Delete note
- [ ] Show notes with author and timestamp

### Edit Meeting Modal
- [ ] Edit title, description, time, location
- [ ] Add / remove participants

### Home Dashboard Polish
- [ ] Today's meetings widget (filtered to today, not just recent)
- [ ] Pending action items widget across all meetings
- [ ] Meeting SMA status on home cards

---

## Phase 1 — Done ✅

- [x] Meeting list page with search, filter, group by date
- [x] Meeting cards with SMA indicators
- [x] Home page layout and widgets
- [x] Default card widget (3D flip)
- [x] Start Meeting FAB
- [x] Command palette (Cmd+K)
- [x] Google OAuth sign-in
- [x] Theme system (light/dark/system)
- [x] Toolbar with pins
- [x] Card editor page
- [x] Card analytics page
- [x] Card contacts page
- [x] Cards list page
- [x] Auth guard
- [x] Page transitions (PageMotion)
- [x] React Query + Zustand setup

---

## Phase 1.2 — Future

- [ ] Availability settings page
- [ ] Public booking page UI
- [ ] Recall.ai bot activation flow
- [ ] Google Calendar sync settings

---

## Phase 2 — Future

- [ ] Big Brain chat interface

---

## Phase 3 — Future

- [ ] Tasks page (Todoist-style)
