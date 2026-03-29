# calendar-frontend — Task List

Last updated: 2026-03-29 (Phase 3 P1+P2 complete — P3 Board View next)

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

- [x] **Recall.ai integration section:** API key input (password-masked, show/hide toggle) wired to `PUT /settings/recall-api-key`. `recallEnabled` toggle wired to `PATCH /settings/user`. "API key saved" confirmation after save. Instructional link to app.recall.ai.

---

---

## Phase 1.3 — Google Calendar Deep Integration

Design doc: `docs/dev-notes/phase-1.3-gcal.md`

> **What already exists from Phase 1.2:**
>
> - Settings > Integrations > Google Calendar section — connect button + `googleCalendarSyncEnabled` toggle (skeleton wired)
> - `PATCH /settings/user` wired for sync toggle

### P0 — Types + Service Layer

- [x] Add `CalendarEvent` type to `src/services/integrationsService.ts` (types live in service file, not a separate integrations.ts)
- [x] Add `meetLink?: string | null` to `Meeting` type in `src/types/meeting.ts`
- [x] `googleEventId?: string` already existed in Meeting type
- [x] `src/services/integrationsService.ts` — `getGoogleCalendarStatus()` + `getGoogleCalendarEvents(start, end)` + `CalendarEvent` + `GCalConnectionStatus` types
- [x] Query keys: `queryKeys.integrations.google.status()`, `queryKeys.integrations.google.events(start, end)` in `src/lib/queryKeys.ts` (replaced legacy `queryKeys.sync`)
- [x] `useGoogleCalendarStatus()` + `useGoogleCalendarEvents(start, end)` hooks in `src/hooks/queries/useIntegrationQueries.ts`

### P1 — Meet Link UX in Meeting Detail

- [x] **ScheduledDetail:** When `meeting.meetLink` is set → "Join Meeting" button (primary) + copy icon button in quick-actions area
- [x] **RecordedDetail + VoiceNoteDetail:** Inline "Join meeting →" link in header when meetLink present
- [x] Meeting creation form: "Add to Google Calendar with a Meet link" switch (shown only if GCal connected, on by default). Passes `addToCalendar: true` to backend.

### P2 — Unified Timeline on Home Dashboard

- [x] **`TodayTimeline` component** (`src/pages/home/TodayTimeline.tsx`) — replaces the "Today's meetings" widget. Shows Crelyzor meetings + GCal events for today in a chronological unified list.
  - Crelyzor meetings: same card style, navigates to /meetings/:id
  - GCal events: muted bg, CalendarDays icon, "Google Calendar" label — clickable when meetLink present, display-only otherwise
  - Empty state: "No events today"
  - Loading: skeleton rows (waits for both queries)
  - Gated behind gcalStatus?.connected — no API call for disconnected users
- [x] Wired into Home dashboard replacing TodaysMeetings
- [x] GCal events are display-only — no ⋯ menu, no AI actions. Non-interactive div when no meetLink.

### P3 — Settings > Integrations Wiring

- [x] **Google Calendar status:** `useGoogleCalendarStatus()` wired in `IntegrationsSection`. Shows connected email badge or "Not connected" state. Live data from `GET /integrations/google/status`. Replaces static skeleton.
- [x] **Connect flow:** "Connect Google Calendar" button already wired from Phase 1.2. On OAuth return, `queryKeys.integrations.google.status()` + `queryKeys.settings.all` both invalidated so UI refreshes.
- [x] **Disconnect:** `useDisconnectGoogleCalendar` mutation wired. Ghost "Disconnect" button next to email badge. Calls `DELETE /integrations/google/disconnect`, invalidates status + settings caches, shows toast.
- [x] **Sync toggle:** `googleCalendarSyncEnabled` wired via `PATCH /settings/user`. Inline `onSuccess`/`onError` toast feedback added.

---

## Phase 1.4 — Recall.ai Platform Integration ✅ Complete

Design doc: `docs/dev-notes/phase-1.4-recall-platform.md`

Simplify Settings > Integrations — remove API key management, keep toggle.

### P0 — Types + services cleanup

- [x] Replace `hasRecallApiKey` with `recallAvailable: boolean` in `UserSettings` type
- [x] Remove `settingsApi.saveRecallApiKey()` from `settingsService.ts`
- [x] Remove `useSaveRecallApiKey` hook from `useSettingsQueries.ts`

### P1 — Settings UI simplification

- [x] Remove API key input, save button, show/hide toggle, "API key saved" badge
- [x] Toggle shown only when `settings.recallAvailable === true`
- [x] Disabled state: "Recording bot not available on this instance" when `!recallAvailable`
- [x] Label: "Auto-record online meetings" (vendor name hidden)
- [x] Card title: "Meeting Recording Bot"
- [x] Removed unused `Eye`/`EyeOff` icon imports

---

## Phase 2 — Standalone Tasks

- [x] Standalone Tasks page (Todoist-style — filter chips, sort bar, inline create, toggle complete)
- [x] Task filters: by status, priority, source + sort by createdAt/dueDate/priority
- [x] Tags on Tasks (tag chips on task rows + tag filter bar, extends universal Tag system)

---

## Phase 3 — Todoist-Level Tasks + Calendar View

Full design doc: `docs/dev-notes/phase-3-tasks-calendar.md`

### P0 — Backend schema done ✅ (crelyzor-backend)

### P1 — Task Detail Panel + Row Redesign ✅
- [x] Task detail slide-over panel (right side, stays open alongside list)
  - Inline-editable title, description
  - Due date picker
  - Priority selector, status toggle (TODO/IN_PROGRESS/DONE)
  - Tags multi-select, linked meeting chip
  - Subtasks list with inline add
- [x] Task row redesign
  - Left priority border (red HIGH, amber MEDIUM)
  - Due date turns red + "Overdue" when past due
  - Meeting chip (click → navigate)
  - Click row → opens detail panel

### P2 — Sidebar Nav + Views ✅
- [x] Sidebar nav within /tasks: Inbox · Today · Upcoming · All · From Meetings
- [x] Today view — overdue at top + due today below, section headers
- [x] Upcoming view — 7 days, grouped under date headers
- [x] From Meetings view — tasks grouped by meeting name

### P3 — Board View + Drag and Drop
- [ ] View toggle: List / Board / Grouped
- [ ] Board view — 3 Kanban columns (Todo / In Progress / Done), drag between columns
- [ ] List drag-to-reorder — dnd-kit, persists via PATCH /tasks/reorder
- [ ] Grouped view — Overdue / Today / Tomorrow / This Week / Later

### P4 — Global Quick-Add
- [ ] Cmd+K quick-add from anywhere — natural language parsing (priority, due date, tags)
- [ ] Contact-linked tasks on Card detail page

### P5 — Calendar Page
- [x] Tasks with `scheduledTime` appear on `TodayTimeline` as timed items
- [x] Tasks with only `dueDate` appear as "Due today" section at top of timeline
- [x] Toggle task complete directly from timeline
- [ ] /calendar page — week/day view (GCal events + Crelyzor meetings + Tasks)
- [ ] All-day task markers for dueDate-only tasks
- [ ] Drag task to calendar time slot → sets scheduledTime

---

## Phase 4 — Big Brain

- [ ] Global Ask AI / Big Brain chat interface (RAG — requires vector infra first)
