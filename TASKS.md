# calendar-frontend — Task List

Last updated: 2026-03-03

> **Rule:** When you complete a task, change `- [ ]` to `- [x]` and move it to the Done section.
> **Legend:** `[ ]` Not started · `[~]` Has code but broken/incomplete · `[x]` Done and working

---

## P0 — Build Next (in order)

### 1. MeetingDetail — 3 distinct layouts by type
The current MeetingDetail page shows the same UI for all meeting types.
Each type needs its own layout, chrome, and actions.

**VOICE_NOTE layout**
- [ ] Minimal header: title (AI-generated), "recorded on" date, duration
- [ ] No status badge, no participants, no accept/decline/complete
- [ ] Flat scroll layout (no tabs): recording player → transcript → summary → key points
- [ ] Only action: Delete

**RECORDED layout**
- [ ] Compact header: title, date, duration
- [ ] Speakers section (from `MeetingSpeaker[]`) — show speakerLabel or displayName
- [ ] Inline rename: click speaker → edit displayName inline
- [ ] Tabs: Recording | Transcript | Summary | Action Items
- [ ] Actions: Complete, Delete

**SCHEDULED layout** (keep current — clean it up)
- [ ] Full header: title, status badge, date/time, location
- [ ] Participants section with user avatars
- [ ] Quick actions: Accept / Decline / Complete / Cancel (context-aware)
- [ ] Tabs: Overview | Transcript | Summary | Action Items | Recording

### 2. Voice Notes — separate section
- [ ] Add "Voice Notes" nav item in sidebar (below Meetings)
- [ ] `/voice-notes` route → new VoiceNotes page
- [ ] Lists all meetings with `type=VOICE_NOTE`, sorted by createdAt desc
- [ ] Meetings list page filters out VOICE_NOTE (they only appear in Voice Notes section)
- [ ] Voice Note cards: minimal — title, date, duration, transcript status

---

## Not Built Yet

### Ask AI Chat Interface
- [ ] Chat panel inside MeetingDetail (available for RECORDED + VOICE_NOTE when transcript exists)
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
- [ ] Edit title, description, time, location (SCHEDULED only)

### Home Dashboard Polish
- [ ] Today's meetings widget (filtered to today, not just recent)
- [ ] Pending action items widget across all meetings
- [ ] Recent Voice Notes widget

---

## Phase 1 — Done ✅

- [x] Meeting list page with search, filter, group by date
- [x] Meeting context menu (accept/decline/complete/cancel)
- [x] MeetingDetail — wired to real API (transcript, summary, action items, recording player)
- [x] MeetingDetail — all action buttons wired (accept/decline/complete/cancel + ⋯ menu)
- [x] MeetingDetail — real audio player with play/pause/seek
- [x] MeetingDetail — transcription status polling (NONE → PROCESSING → COMPLETED)
- [x] MeetingDetail — 30s post-COMPLETED polling to catch AI title update
- [x] MeetingDetail — Retry AI button when processing failed
- [x] Create FAB — renamed to "Create", two-level menu (Voice Note / Meeting)
- [x] Live recording via browser microphone — Voice Note + Meeting recording flows
- [x] MeetingKind type (SCHEDULED | RECORDED | VOICE_NOTE) — passed to API on create
- [x] Home page layout and widgets
- [x] Default card widget (3D flip)
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
