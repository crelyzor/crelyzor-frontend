# calendar-frontend — Task List

Last updated: 2026-03-26 (Phase 1.2 complete — P0 Settings, Event Types, Availability, Integrations UI done)

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
- [x] ⋯ menu with "Copy tasks" — copies all tasks as a formatted checklist to clipboard
- [x] Tasks section present in all 3 layouts (VoiceNoteDetail, RecordedDetail, ScheduledDetail)
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

- [x] "Generate" tab/section in all 3 MeetingDetail layouts
- [x] 4 types: Meeting Report / Tweet / Blog Post / Follow-up Email
- [x] Each shows loading state while generating, then displays result
- [x] Copy to clipboard + Redo buttons on generated content
- [x] Results cached in DB (persist across sessions) + React Query session cache
- [x] Dropped Main Points (redundant with Summary key points) and To-Do List (redundant with Tasks)

### 9. Regenerate Actions

- [x] Regenerate title button (in meeting header, ⋯ menu)
- [x] Regenerate summary button (in Summary section)
- [x] Both show spinner while running, update on complete
- [x] Service calls: `POST /sma/meetings/:id/summary/regenerate` + `POST /sma/meetings/:id/title/regenerate`

---

## P2 — Deeper Features

### 10. Public Meeting Links

Requires backend `MeetingShare` model.

- [x] Share sheet: "Copy public link" option (creates share if not exists)
- [x] "Disable public link" toggle
- [x] Shows the short URL when enabled

### 11. Export

- [x] Export options in Share sheet:
  - Export Transcript as PDF
  - Export Summary as PDF
  - Export Transcript as .txt
  - Export Summary as .txt
- [x] Triggers file download from backend export endpoint

### 12. Tags

Requires backend Tags API.

- [x] Tag pill display in MeetingDetail header (all 3 layouts)
- [x] Tag editor — add/remove tags on a meeting (inline popover in MeetingDetail)
- [x] Create new tag inline (name + color picker) from within the tag editor
- [x] Tag management page (or settings section) — rename, delete standalone
- [x] Tag filter on Meetings list

### 13. Attachments

- [x] Attachments section in MeetingDetail (all 3 layouts)
- [x] Attach a link (paste URL + name)
- [x] Attach a file (upload — image, PDF, doc — drag-and-drop + click to browse)
- [x] Display with icon by type, clickable (opens signed URL), deletable (two-click confirm)

### 14. Edit Transcript / Summary

- [x] Click-to-edit on transcript segments (inline)
- [x] Click-to-edit on summary (textarea modal or inline)
- [x] Save on blur or explicit Save button

### 15. Regenerate Transcript + Change Language

- [x] Regenerate transcript option in ⋯ menu (only when recording exists)
- [x] Change language option — opens language picker, re-runs Deepgram
- [x] Both show progress (polls transcription status)

### 16. Mobile Responsiveness + UI Revamp

- [x] Layout header — search bar collapses to icon on mobile, padding responsive
- [x] Toolbar — pinned nav items hidden on mobile, ThemeToggle + Control Center always visible
- [x] MeetingDetail (Recorded + Scheduled) — tabs scrollable on mobile, tab content padding responsive
- [x] VoiceNoteDetail — date row wraps on narrow screens
- [x] Meetings page — filter tabs horizontally scrollable, header margin responsive
- [x] Home hero — quick-action bubbles gap + margin responsive
- [x] Global `.scrollbar-hide` utility added to index.css

---

## UX & Polish — Discovered Issues

### 17. Meeting List UX — Single Click to Navigate

Currently: click → card expands → click "Open" to navigate (two clicks).
Fix: click anywhere on card → navigate to meeting detail. Context menu (⋯) stays for actions.

- [x] Remove `expandedId` state and expand/collapse behavior
- [x] Card `onClick` → `navigate(/meetings/:id)` directly
- [x] Move context menu (⋯) to always-visible right side of card (stop-propagation on click)
- [x] For RECORDED meetings: ⋯ menu only has "Open" + "Delete" (no accept/decline)
- [x] For SCHEDULED meetings: ⋯ menu retains accept/decline/complete/cancel

### 18. RECORDED Meeting Status Badge

Currently: RECORDED meetings show "Created" badge — meaningless for recordings.
Fix: hide the status badge for RECORDED meetings. The Video icon + transcription status icons are enough.

- [x] In Meetings.tsx, only render the status badge when `meeting.meetingType === 'SCHEDULED'`
- [x] Ensure RECORDED card still looks complete without the badge

### 19. Tags on Voice Notes Listing

Currently: Voice Notes page shows no tags.
Fix: show tag chips on each voice note row + tag filter at top (same pattern as Meetings page).

- [x] Fetch user tags (`useUserTags`) in VoiceNotes page
- [x] Tag filter bar (same chip UI as Meetings)
- [x] Tag chips on each voice note row (above meta row)
- [x] Filter logic: only show notes that have any of the selected tags
- [x] Note: tags on VOICE_NOTE meetings are stored via `MeetingTag` — backend already supports this

### 20. Tags on Cards Listing + Dashboard Tag Edit

Currently: Cards list doesn't show tags. No way to add/remove tags from a card in the dashboard.
Backend already has `GET/POST/DELETE /cards/:cardId/tags` + `CardTag` junction.

- [x] Tag chips on each card row in Cards list
- [x] Tag filter bar on Cards list (same chip UI)
- [x] Tag editor on Card detail/editor page — add/remove tags inline (same popover pattern as MeetingDetail TagsSection)
- [x] Use existing `queryKeys.tags.byCard(cardId)` key + backend tag endpoints

### 21. Hover Jitter Fix

Currently: meeting cards use `transition-all` which causes jitter/paint issues on hover.

- [x] Replace `transition-all duration-200` with `transition-[border-color,box-shadow] duration-200` on meeting cards (Meetings.tsx)
- [x] Same fix on VoiceNotes.tsx cards and any other list cards using `transition-all`
- [x] Test in both light and dark mode

### 22. Ask AI Persistence (Deferred)

Deferred until Ask AI becomes universal (Phase 2 Big Brain). Skip for now.

---

## Phase 1 — Done ✅

### MeetingDetail — 3 distinct layouts by type

- [x] VoiceNoteDetail: minimal header, flat scroll (player → transcript → summary → tasks → notes → ask AI → generate)
- [x] RecordedDetail: compact header, speakers section, tabs (Recording | Transcript | AI Summary | Tasks | Notes | Ask AI | Generate)
- [x] ScheduledDetail: full header with status badge, participants, quick actions, tabs (Overview | Transcript | AI Summary | Tasks | Notes | Recording | Ask AI | Generate)
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

## Phase 1.2 — Scheduling & Online Meetings ← current

Design doc: `docs/dev-notes/phase-1.2-scheduling.md`

Depends on: backend P0 (UserSettings API) must exist before building settings UI.

### P0 — Settings Page Restructure

- [x] **Settings page skeleton:** Restructure `/settings` into tabbed sections: Profile | Scheduling | Event Types | Availability | Integrations | AI & Transcription | Privacy. URL-based tabs (`?tab=scheduling`, etc.). Grouped sidebar + mobile pill bar.
- [x] **Scheduling settings section:** Master on/off toggle, min notice hours (number input), max window days, default buffer mins. Wire to `PATCH /settings/user`. Skeleton + optimistic update.
- [x] **AI & Transcription settings section:** Auto-transcribe toggle, auto-AI toggle, default language selector (dropdown, BCP-47). Wire to `PATCH /settings/user`.

### P1 — Event Types + Availability UI

- [x] **Event types section:** List event type cards (title, duration, locationType badge, active toggle). "New event type" button. Edit + delete. React Query hooks: `useEventTypes`, `useCreateEventType`, `useUpdateEventType`, `useDeleteEventType`. Wire to `/scheduling/event-types` endpoints. Optimistic active toggle.
- [x] **Event type form (slide-over/dialog):** Fields: title, slug (auto-derived, editable), duration (15/30/45/60/90 min select), locationType (IN_PERSON | ONLINE), meeting link (ONLINE only), buffer before/after, max per day. Client-side validation. Error + loading + empty states.
- [x] **Availability weekly grid:** 7-row grid (Sun–Sat). Each row: day label + on/off toggle + time range inputs. Disabled when off. "Reset to defaults" button. Wire to `GET/PATCH /scheduling/availability`.
- [x] **Availability overrides:** Date picker to block specific dates. Blocked dates shown as removable chips. Wire to `POST/DELETE /scheduling/availability/overrides`.

### P3 — Google Calendar Settings

- [x] **Google Calendar integration section:** Connected state (email badge + sync toggle) vs unconnected (disabled connect button + note). `googleCalendarSyncEnabled` toggle wired to `PATCH /settings/user`. Connect button pending backend P3 OAuth.

### P4 — Recall.ai Settings

- [x] **Recall.ai integration section:** `recallEnabled` toggle wired to `PATCH /settings/user`. API key input shown as disabled with "coming soon" note (backend P4 encryption not done). Instructional note about bot behavior.

---

## Phase 3 — Big Brain

- [ ] Global Ask AI / Big Brain chat interface

---

## Phase 4 — Standalone Tasks

- [ ] Standalone Tasks page (Todoist-style — `GET /tasks`, all tasks not scoped to a meeting)
- [ ] Task filters: by status, priority, due date, meeting source
- [ ] Tags on Tasks (extends universal Tag system)
