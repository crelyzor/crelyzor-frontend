# calendar-frontend — Task List

Last updated: 2026-03-05

> **Rule:** When you complete a task, change `- [ ]` to `- [x]` and move it to the Done section.
> **Legend:** `[ ]` Not started · `[~]` Has code but broken/incomplete · `[x]` Done and working

> **Naming:** "Action Items" is now **"Tasks"** everywhere in the UI.

---

## P0 — Build Next (in order)

### 1. Auth — Refresh Token

- [x] Axios interceptor — on 401, auto-call `POST /auth/refresh`, retry original request
- [x] On refresh failure, clear auth state and redirect to `/signin`
- [x] No more "login again" on access token expiry

### 2. Meeting Notes UI

Backend already done. Just needs frontend.

- [x] Notes tab / section in all 3 MeetingDetail layouts
- [x] Create note (textarea + submit)
- [x] Delete note (with confirm)
- [x] Show notes with timestamp
- [x] React Query hook: `useNotes(meetingId)`
- [x] Service: notes methods in `smaService.ts` (getAll, create, delete)
- [x] Query keys: `queryKeys.sma.notes(meetingId)`

### 3. Tasks UI

Requires backend `Task` model + CRUD API to be built first.

- [x] Rename all "Action Items" labels to "Tasks" everywhere in the UI
- [x] Mark task complete / incomplete (toggle checkbox, optimistic update)
- [x] Create task manually (inline form — just title, press Enter)
- [x] Delete task (icon button, no confirm needed)
- [x] Service: task methods in `smaService.ts` (getAll, create, update, delete)
- [x] Query keys: `queryKeys.sma.tasks(meetingId)`

### 4. Edit Meeting Modal

- [x] SCHEDULED only — edit title, description, startTime, endTime, location
- [x] Open from ScheduledDetail Edit button (quick actions area)
- [x] Validates time conflicts on save (client-side + ApiError 409 from backend)
- [x] Invalidates meeting cache on success

### 5. Delete Meeting

- [x] Confirm dialog before delete ("Delete this meeting? This can't be undone.")
- [x] Wire Delete in VoiceNoteDetail ⋯ menu
- [x] Wire Delete in RecordedDetail ⋯ menu
- [x] Navigate to `/meetings` (or `/voice-notes`) after delete

---

## P1 — Next Sprint

### 6. Ask AI — chat panel

- [x] Chat panel in all 3 MeetingDetail layouts (available when transcript exists)
- [x] Input: "Ask anything about this meeting..."
- [x] Stream AI response token by token
- [x] Pre-loaded suggestion chips: "Summarize decisions", "List tasks", "What were the blockers?"
- [x] Conversation history within session (not persisted)
- [x] Service: `askAI(meetingId, question)` — streaming via fetch ReadableStream

### 7. Share Sheet

- [x] Share button in all 3 MeetingDetail layouts (header area)
- [x] Bottom sheet / popover with options:
  - Copy transcript (to clipboard)
  - Copy summary (to clipboard)
  - Download Audio (only when recording exists)
  - Share via email (opens mailto: with summary pre-filled)
  - _(Public link — P2, needs backend)_

### 8. AI Content Generation

Requires backend `POST /sma/meetings/:id/generate`.

- [x] "Generate" section in MeetingDetail (separate from Summary tab)
- [x] Options: Meeting report / Main points / To-do list / Tweet / Blog post / Email
- [x] Each shows a loading state while generating, then displays result
- [x] Copy to clipboard button on each result
- [x] Results cached per session (don't re-fetch on re-render)

### 9. Regenerate Actions

- [x] Regenerate title button (in meeting header, ⋯ menu)
- [x] Regenerate summary button (in Summary section)
- [x] Both show spinner while running, update on complete
- [x] Service calls: `POST /sma/meetings/:id/summary/regenerate` + `POST /sma/meetings/:id/title/regenerate`

---

## P2 — Deeper Features

### 10. Public Meeting Links

Requires backend `MeetingShare` model.

- [ ] Share sheet: "Copy public link" option (creates share if not exists)
- [ ] "Disable public link" toggle
- [ ] Shows the short URL when enabled

### 11. Export

- [ ] Export options in Share sheet:
  - Export Transcript as PDF
  - Export Summary as PDF
  - Export Transcript as .txt
  - Export Summary as .txt
- [ ] Triggers file download from backend export endpoint

### 12. Tags

Requires backend Tags API.

- [ ] Tag pill display on meeting cards + detail header
- [ ] Tag editor — add/remove tags on a meeting
- [ ] Tag management page (or settings section) — create, rename, color, delete
- [ ] Tag filter on Meetings list

### 13. Attachments

- [ ] Attachments section in MeetingDetail
- [ ] Attach a link (paste URL + name)
- [ ] Attach a file (upload — image, PDF, doc)
- [ ] Display with icon by type, clickable, deletable

### 14. Edit Transcript / Summary

- [ ] Click-to-edit on transcript segments (inline)
- [ ] Click-to-edit on summary (textarea modal or inline)
- [ ] Save on blur or explicit Save button

### 15. Regenerate Transcript + Change Language

- [ ] Regenerate transcript option in ⋯ menu (only when recording exists)
- [ ] Change language option — opens language picker, re-runs Deepgram
- [ ] Both show progress (polls transcription status)

### 16. UI Revamp

All the new P1/P2 features add significant surface area. Plan a layout pass:

- [ ] MeetingDetail — rethink sidebar vs tab layout to fit: notes, tasks, ask AI, generate, attachments, tags
- [ ] Share sheet — polished bottom sheet with all export/share options
- [ ] Consider splitting into panels: left = content (transcript/summary), right = tools (ask AI, generate, notes, tasks)

---

## Phase 1 — Done ✅

### MeetingDetail — 3 distinct layouts by type

- [x] VoiceNoteDetail: minimal header, flat scroll (player → transcript → summary), Delete only
- [x] RecordedDetail: compact header, speakers section with inline rename, tabs (Recording | Transcript | Summary | Tasks | Ask AI placeholder)
- [x] ScheduledDetail: full header with status badge, participants, quick actions, tabs (Overview | Transcript | Summary | Tasks | Recording)
- [x] MeetingDetail shell: thin router to 3 layout components, polling preserved

### Voice Notes — separate section

- [x] "Voice Notes" nav item in toolbar
- [x] `/voice-notes` route → VoiceNotes page
- [x] Lists all VOICE_NOTE meetings, sorted by date desc
- [x] Meetings list (`/meetings`) filters out VOICE_NOTE
- [x] Voice Notes quick-action bubble on home dashboard
- [x] Recent Voice Notes widget on home dashboard

### Meetings List — type segregation + UX

- [x] Type toggle: All | Live | Recordings
- [x] RECORDED badge, Online SCHEDULED badge
- [x] Skeleton loading state

### Home Dashboard

- [x] Recent Meetings (no VOICE_NOTE), skeleton loading, shared cache
- [x] Recent Voice Notes widget

### Settings — fixed and wired

- [x] Appearance theme change works
- [x] Profile shows @username below email, read-only username field
- [x] URL-based tabs (`?tab=profile`, `?tab=appearance`, `?tab=security`)
- [x] UserMenu: Profile + Settings buttons wired

### Cmd+K

- [x] Navigate section sourced from TOOLBAR_ITEMS (single source of truth)
- [x] Input focus ring removed
- [x] "New Meeting" goes to `/meetings`

### Skeleton loading states — all pages

- [x] Home RecentMeetings, Meetings page, CardEditor, Cards list

### Global fixes

- [x] Light mode background softened
- [x] Theme flash on hard refresh eliminated
- [x] MeetingProvider field added to DisplayMeeting

### Previously done

- [x] Meeting list page — search, filter, group by date
- [x] Meeting context menu — accept/decline/complete/cancel
- [x] MeetingDetail — wired to real API
- [x] MeetingDetail — all action buttons wired
- [x] MeetingDetail — real audio player
- [x] MeetingDetail — transcription status polling
- [x] MeetingDetail — 30s post-COMPLETED polling for AI title
- [x] MeetingDetail — Retry AI button
- [x] Create FAB — two-level menu (Voice Note / Meeting)
- [x] Live recording via browser microphone
- [x] Home page layout + widgets
- [x] Default card widget (3D flip)
- [x] Command palette (Cmd+K)
- [x] Google OAuth
- [x] Theme system
- [x] Toolbar with pins
- [x] Card editor, analytics, contacts, list pages
- [x] Auth guard, PageMotion, React Query + Zustand setup

---

## Phase 1.2 — Future

- [ ] Availability settings page
- [ ] Public booking page UI
- [ ] Recall.ai bot activation flow
- [ ] Google Calendar sync settings

---

## Phase 2 — Future

- [ ] Global Ask AI / Big Brain chat interface

---

## Phase 3 — Future

- [ ] Standalone Tasks page (Todoist-style — `GET /tasks`, all tasks not scoped to a meeting)
- [ ] Task filters: by status, priority, due date, meeting source
- [ ] Tags on Tasks (extends universal Tag system built in P2)
