# calendar-frontend — Task List

Last updated: 2026-05-30 (Phase 6 P9.a + P10 + P11 (all sub-chunks) + P12 shipped — Team Settings end-to-end + Internal booking modal (Meetings header) + content audit confirmed no client-side filter changes needed. P13 (WS-driven invite surfaces) is next.)

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

### 22. Ask AI Persistence ✅ Complete (Phase 4.2)

- [x] `queryKeys.sma.askHistory(meetingId)` added to `queryKeys.ts`
- [x] `AIChatMessage` type exported from `smaService.ts` (removed local definition)
- [x] `smaApi.getAskAIHistory(meetingId)` — `GET /sma/meetings/:id/ask/history`
- [x] `smaApi.clearAskAIHistory(meetingId)` — `DELETE /sma/meetings/:id/ask/history`
- [x] `useAskAIHistory(meetingId)` — `staleTime: Infinity`, `refetchOnMount: false`, `refetchOnWindowFocus: false`
- [x] `useClearAskAIHistory(meetingId)` — on success clears cache via `setQueryData([])`
- [x] `AskAITab` seeds `messages` from DB history on first mount (ref-based guard, no re-seed on background refetch)
- [x] Skeleton shown while history loads
- [x] Clear button (`Trash2`) in header — only visible when messages exist, clears local state + cache on success
- [x] Suggestion chips only shown when `messages.length === 0`

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

- [x] View toggle: List / Board (inbox + all views)
- [x] Board view — 3 Kanban columns (Todo / In Progress / Done), drag between columns
- [x] List drag-to-reorder — dnd-kit, persists via PATCH /sma/tasks/reorder (inbox view only)
- [x] Grouped view — Overdue / Today / Tomorrow / This Week / Later / No Date

### P4 — Global Quick-Add

- [x] Cmd+K quick-add from anywhere — natural language parsing (priority, due date, tags)
- [x] Contact-linked tasks on Card detail page

### P5 — Calendar Page

- [x] Tasks with `scheduledTime` appear on `TodayTimeline` as timed items
- [x] Tasks with only `dueDate` appear as "Due today" section at top of timeline
- [x] Toggle task complete directly from timeline
- [x] /calendar page — week/day view (GCal events + Crelyzor meetings + Tasks)
- [x] All-day task markers for dueDate-only tasks
- [x] Drag task to calendar time slot → sets scheduledTime

---

## Phase 3.2 — Polish, Enhancements & Power Features ← current

### P0 — Bugs & Embarrassing Gaps

- [x] **Fix "Reschedule meeting" button** (`ScheduledDetail`) — `RescheduleMeetingModal` with start + end datetime-local inputs, calls `PATCH /meetings/:id`, handles 409 conflict.
- [x] **Privacy Settings tab** — removed from Settings nav (was an empty placeholder). Rebuild properly in a future phase.

---

### P1 — Quick Wins

- [x] **Task count badges in sidebar nav** — live counts next to Inbox · Today · Upcoming. Badge query: `{ status: 'pending', limit: 500 }`, counts derived client-side. Upcoming capped to 7-day window to match backend view.

- [x] **Overdue tasks on home dashboard** — `OverdueTasksSection` above TodayTimeline. Shows up to 3 rows with neutral left border + count badge. Hidden when zero overdue. Overdue tasks excluded from todayTasks and otherTasks buckets.

- [x] **NL parsing in inline task create form** — `parseTaskInput` wired into handleCreate and live preview chips shown below input. PRIORITY_STYLES + PRIORITY_LABELS extracted to `src/constants/task.ts` (shared with CommandPalette).

- [x] **Task duration picker in detail panel** — `TaskDetailPanel`: add a "Duration" field below Due Date. Options: 15 / 30 / 45 / 60 / 90 / 120 min (select or segmented control). On change calls `updateTask({ durationMinutes })`. Requires `durationMinutes` backend field (P1 backend task).

- [x] **Calendar renders task duration correctly** — `CalendarGrid.tsx`: change the hardcoded `30 * 60 * 1000` end time for tasks to use `task.durationMinutes ?? 30`. `getChipPosition` already uses `endMs` so height auto-adjusts.

- [x] **Jump-to-date on calendar** — clicking the `"Apr 2 – Apr 8"` / `"Wednesday, April 2"` header label opens a small date-picker popover. Selecting a date sets `anchor` to the Monday of that week (week mode) or that exact date (day mode). Use a simple `<input type="date">` inside a popover or the shadcn Popover + Calendar component.

- [x] **Email signature generator** — new tab/section in `CardEditor` (or a standalone modal triggered from the card actions menu). Renders an HTML email signature from the card data (name, title, email, phone, card URL + QR code as inline image). Two outputs: (1) Copy HTML button (for Gmail/Outlook paste), (2) Copy plain text fallback. No backend needed — pure client-side render.

---

### P2 — Meaningful Features

- [x] **"New tasks from meeting" badge on home dashboard** — after a meeting's AI processing completes (`transcriptionStatus = COMPLETED`), surface a callout on the home page: _"X new tasks extracted from [meeting title]"_ with a link to that meeting's tasks. Implementation: `useAllTasks({ source: 'AI_EXTRACTED', status: 'pending' })` — check for tasks created in the last 24h. Show as a dismissible banner above the timeline. Dismiss stores meeting IDs in `localStorage`.

- [x] **Task bulk actions** — "Select" toggle in header (list mode only), checkbox on each task row in select mode, floating `BulkActionBar` with bulk complete / priority / delete. Escape or Cancel button exits. Uses `smaApi` in `Promise.all` with single `invalidateQueries` after.

- [x] **Card analytics improvement** — `CardAnalytics` page: pure SVG sparkline of daily views, trend indicator (TrendingUp/Down/Minus) on Total Views KPI, link click breakdown with progress bars, top countries with progress bars. No external chart deps. All colors neutral palette only.

- [x] **Onboarding flow for new users** — localStorage-gated overlay on Home for users with 0 cards + 0 meetings. Shows 3 action rows (Create card / Go to meetings / Connect calendar) with individual navigate buttons. "I'm all set" dismisses permanently. No wizard — single-view checklist. Guards against flash via loading state checks.

---

### P3 — Bigger Features

- [x] **Global search UI** — `/search?q=` page with 4 result sections (Meetings / Tasks / Cards / Contacts), 300ms debounce, `keepPreviousData`, skeleton + empty state. Route registered in App.tsx.

- [x] **Calendar month view** — "Month" added to toggle (left of Week/Day). 6-week grid, Monday-first. Each cell: day number (today highlighted), meeting chips (up to 2 + overflow), GCal dots (up to 3), task count badge. Clicking any cell switches to day view. Out-of-month days dimmed.

- [x] **Keyboard shortcuts** — J/K navigate, Enter opens panel, E edits title, D opens due-date picker, P cycles priority, Space toggles complete, Del deletes, Esc closes/deselects. `?` shortcut + footer button toggles a fixed-position shortcuts cheatsheet panel. Inbox+list excluded (DnD keyboard sensor conflict). `autoFocusField` prop on `TaskDetailPanel` triggers title focus or label `.click()` for due date.

- [x] **Schedule task → create GCal block** — in `TaskDetailPanel`: when `scheduledTime` is set and user has GCal connected, show a toggle _"Block time in Google Calendar"_ (default off). When enabled, calls `updateTask({ scheduledTime, blockInCalendar: true })`. Backend creates a GCal event. Show the GCal event ID as a small chip "Blocked in calendar ✓" when set.

- [x] **Meeting ↔ Card contact chips** — in `ScheduledDetail` participants section: when a participant's `card` field is populated (from backend auto-linking), show their card chip (avatar + name, clickable → `/cards/:cardId/edit`). On `CardEditor` contacts section: show a "Meetings" count chip per contact that opens a meeting list filtered by that contact. Requires backend P3 task.

---

### P4 — Major Feature ✅

- [x] **Recurring task UI** — `TaskDetailPanel`: "Repeat" button in metadata row. Options: Daily / Weekly / Monthly / Don't repeat. Stores as RRULE string via `updateTask({ recurringRule })`. Button turns dark when active. Completing a recurring task auto-spawns the next occurrence.

---

## Phase 3.3 — Close the Product Gaps

> Identified via full user-perspective product review (2026-04-04).

---

### P1 — Email Notification Preferences (Settings UI)

- [x] **Settings > Notifications tab** — new tab in Settings page (after Integrations). Show toggles for:
  - Email notifications master toggle (`emailNotificationsEnabled`)
  - Booking emails (`bookingEmailsEnabled`) — "Get an email when someone books you"
  - Meeting ready (`meetingReadyEmailEnabled`) — "Get an email when AI finishes processing"
  - Daily task digest (`dailyDigestEnabled`) — "Daily summary of tasks at 8am" (off by default)
- [x] Wire to `PATCH /settings/user` — same pattern as existing settings toggles

---

### P2 — Scheduling Completeness (EventType Editor)

The backend already supports these fields — we just need to expose them in the UI.

- [x] **EventType editor: Minimum notice** — add "Minimum notice" field (hours before booking). Dropdown: None / 1h / 2h / 4h / 12h / 24h / 48h. Maps to `minNoticeHours` on EventType.
- [x] **EventType editor: Buffer time** — add "Buffer before" + "Buffer after" dropdowns (0 / 5 / 10 / 15 / 30 min). Maps to `bufferBefore` / `bufferAfter` on EventType.
- [x] **EventType editor: Max bookings/day** — add "Max per day" number input (blank = unlimited). Maps to `maxPerDay` on EventType.
- [x] **Bookings list: Cancelled state** — show cancelled bookings with a strikethrough + "Cancelled" badge. Currently only active bookings shown.

---

### P3 — Connection Features

- [x] **Ask AI — meeting list shortcut** — add a small "Ask AI" ghost button on each meeting row in the meetings list (appears on hover). Clicking navigates to `/meetings/:id#ask-ai` and auto-opens the Ask AI panel. Makes the feature discoverable without drilling into the meeting.
- [x] **Ask AI — home dashboard** — add "Ask about your meetings" as an action in the home quick-actions or a subtle prompt on the TodayTimeline when meetings exist with transcripts.
- [x] **Meeting ↔ Card contact chips** — in `ScheduledDetail` participants section: when participant has `card` populated from backend, show card chip (avatar + name, clickable → `/cards/:cardId/edit`). In `CardEditor` contacts section: show "N meetings" count chip per contact. (Requires backend P3.3 auto-linking to be built first.)

---

### P4 — Recurring Tasks UI

_(Already in Phase 3.2 P4 — carry forward)_

- [x] **`TaskDetailPanel`:** Add "Repeat" field below Due Date. Dropdown: None / Daily / Weekly / Monthly / Custom. For Weekly: show day-of-week chip selector. Stores as RRULE string via `updateTask({ recurringRule })`. When task has recurringRule + isCompleted: show "Next occurrence: [date]" instead of struck-through title.

---

### P5 — Data Import UI

- [x] **Contacts CSV import** — button in `CardEditor` contacts section: "Import from CSV". File picker → uploads to `POST /cards/:cardId/contacts/import`. Shows progress + result summary (`N contacts added, N skipped`).
- [x] **Calendar .ics import** — button in Meetings page header: "Import from calendar". File picker → uploads to `POST /meetings/import/ics`. Shows how many meetings were created. Each imported meeting is a SCHEDULED type with no recording.

---

## Phase 3.4 — Global Tags ← next

> Builds the tag index page, tag detail page, and contact tagging. Depends on backend Phase 3.4 being done first.

---

### P0 — Service + Types + Query Keys

- [x] **Types** — add to `src/types/` or service file:
  - `TagWithCounts` — `Tag & { counts: { meetings: number, cards: number, tasks: number, contacts: number } }`
  - `TagItems` — `{ tag: Tag, meetings: MeetingItem[], cards: CardItem[], tasks: TaskItem[], contacts: ContactItem[], counts: {..., total: number } }`
  - `ContactItem` — `{ id, name, email, company, cardId }`
- [x] **`tagsService.ts`** — add:
  - `getTagsWithCounts(): TagWithCounts[]` — calls `GET /tags` (backend now returns counts)
  - `getTagItems(tagId): TagItems` — calls `GET /tags/:tagId/items`
  - `getContactTags(cardId, contactId): Tag[]` — calls `GET /cards/:cardId/contacts/:contactId/tags`
  - `attachTagToContact(cardId, contactId, tagId): void`
  - `detachTagFromContact(cardId, contactId, tagId): void`
- [x] **`queryKeys.ts`** — add:
  - `queryKeys.tags.withCounts()`
  - `queryKeys.tags.items(tagId)`
  - `queryKeys.tags.byContact(cardId, contactId)`

---

### P1 — Tags Index Page (`/tags`)

- [x] **New page:** `src/pages/tags/TagsPage.tsx` — wrapped in `<PageMotion>`
- [x] **Tag grid** — each tag as a card: color dot + name, counts row (`N meetings · N cards · N tasks · N contacts`), ⋯ menu (Rename / Delete)
- [x] **Empty state** — "No tags yet. Create one to start organizing." with inline create
- [x] **Inline create** — "New tag" button opens a small inline form: name input + color swatch picker (same 8 preset colors as existing tag editor). Calls `createTag`. Invalidates `tags.withCounts`.
- [x] **Rename** — inline input on the card or a small popover. Calls `updateTag`. Optimistic.
- [x] **Delete** — confirm dialog ("Delete #tag-name? It will be removed from all items."). Calls `deleteTag`. Optimistic.
- [x] **Skeleton** — grid of placeholder cards while loading
- [x] **Register route** in `App.tsx`: `/tags`
- [x] **Add "Tags" to sidebar/toolbar nav** — between Tasks and Cards (or after Cards). Tag icon (`Tag` from lucide).

---

### P2 — Tag Detail Page (`/tags/:tagId`)

- [x] **New page:** `src/pages/tags/TagDetailPage.tsx` — wrapped in `<PageMotion>`
- [x] **Header** — color dot + tag name + total count badge + back button
- [x] **4 sections** (show only if count > 0, always show with empty state if count = 0):
  - **Meetings** — rows: title + date + type icon. Click → `/meetings/:id`
  - **Cards** — rows: avatar + displayName + title. Click → `/cards/:cardId/edit`
  - **Tasks** — rows: checkbox + title + status chip + due date. Inline complete toggle (calls `updateTask`, invalidates tag items).
  - **Contacts** — rows: name + company + card name. Click → `/cards/:cardId/edit` (contacts tab)
- [x] **Section empty state** — only shown if that section has 0 items and total > 0 (i.e. other sections have items)
- [x] **Full empty state** — if tag has 0 items total: "Nothing tagged with #name yet."
- [x] **Skeleton** — section placeholder rows while loading
- [x] **Register route** in `App.tsx`: `/tags/:tagId`

---

### P3 — Tags on Contacts

- [x] **Tag chips on contact rows** — in the contacts table/list on `CardEditor` (or contacts page): render tag chips per contact (same `TagChip` component). Fetch via `useContactTags(cardId, contactId)`.
- [x] **Tag editor on contact** — popover tag editor on each contact row (same `TagsPopover` pattern used on meetings/cards). Add / remove tags. Calls `attachTagToContact` / `detachTagFromContact`.
- [x] **Tag filter on contacts list** — tag filter chips above the contacts table. Filter client-side (same pattern as meetings/voice notes).
- [x] **Query hook** — `useContactTags(cardId, contactId)` in `src/hooks/queries/useTagQueries.ts`

---

### P4 — Tag Chip Navigation

- [x] **`TagChip` component** — make every tag chip in the app a link to `/tags/:tagId`. Currently chips are display-only. Wrap in `<Link to={/tags/${tag.id}}>` (or `useNavigate` on click) with `stopPropagation`. Apply to: meeting detail, meeting list rows, voice note rows, card list rows, card editor, task detail panel, task rows, contact rows.

---

## Phase 4.1 — Billing & Monetization ✅ Complete

Full design: `docs/pricing-and-costs.md`

---

### P0 — Billing Service + Query Hook ✅ Done

- [x] `src/services/billingService.ts` — `getBillingUsage()`, `initiateUpgrade()` (⛔ payment stub)
- [x] `src/hooks/queries/useBillingQueries.ts` — `useBillingUsage()` (5min stale time)
- [x] `src/lib/queryKeys.ts` — `queryKeys.billing.usage()`
- [x] Types: `BillingUsage`, `UsageLimits`, `Plan`

---

### P1 — Settings > Billing Tab ✅ Done

- [x] "Billing" tab in `Settings.tsx`
- [x] Plan badge — `Free` (neutral) / `Pro` (gold) / `Business` (dark)
- [x] 4 usage meters with progress bars (transcription, AI credits, Recall hours, storage)
- [x] Reset date — `"Resets May 1"`
- [x] Upgrade CTA — ⛔ payment NOT DOING NOW — disabled/contact us
- [x] Skeleton loading state

---

### P2 — UpgradeModal + 402 Hard Wall ✅ Done

- [x] `src/components/billing/UpgradeModal.tsx` — reason-aware, shows what was hit + what Pro unlocks
- [x] 402 interceptor in `apiClient.ts` — auto-opens `UpgradeModal` on limit errors
- [x] `uiStore` — `billingError` state to trigger modal globally

---

### P3 — In-Context Usage Indicators ✅ Done

- [x] **Ask AI panel** — `"X credits remaining"` badge, amber when < 10
- [x] **Recording upload / FAB** — `"X min remaining this month"`
- [x] **Settings > Integrations (Recall toggle)** — `"X hrs remaining this month"`
- [x] **Content generation buttons** — `~Ncr` badge on each type card in type selector grid
- [x] **Free users trying content gen** — `UpgradeModal` with `reason="FEATURE_GATE"` on both Generate + Redo buttons

---

### P4 — Usage Warning Banner ✅ Done

- [x] `src/components/billing/UsageWarningBanner.tsx` — dismissible, shows at 80%+ (Free plan only)
- [x] Wired into `Layout.tsx`

---

### P5 — Dashboard Pricing Page ✅ Done

- [x] `/pricing` route in `App.tsx`
- [x] `src/pages/pricing/PricingPage.tsx` — plan comparison table, upgrade CTA (⛔ payment stub)

---

## Phase 4.2 — Ask AI Persistence ✅ Complete

See item 22 above for full checklist.

---

## Phase 4.3 — Two-way GCal Push Webhooks ✅ Complete

> Pull-based sync already works on every dashboard load. Phase 4.3 adds real-time push delivery on top.

- [x] `pushEnabled: boolean` added to `GCalConnectionStatus` type in `integrationsService.ts`
- [x] `registerGCalPushChannel()` API method added
- [x] `useRegisterGCalPushChannel()` mutation hook (fail-open, no error toast)
- [x] Settings > Integrations: auto-registers on mount when `connected && !pushEnabled`
- [x] Settings > Integrations: "Real-time sync active" badge when `pushEnabled === true`

---

## Phase 4.4 — Polish & First-Run Experience

> **Goal:** Fix the gaps a real user hits in their first week. Based on a full product audit (2026-04-19).

### P0 — Backend prerequisite (must ship first)

- [x] `CardContact` soft delete — add `isDeleted`/`deletedAt` to `CardContact` schema, `db:push`, update `cardService.ts` contact delete to soft delete instead of hard delete

### P1 — First-run & onboarding

- [x] **Setup page explanation** — add subtitle "Your public card lives at crelyzor.com/[username]" so user understands why this is required
- [x] **Onboarding re-trigger** — add "Getting started" option in UserMenu that clears the onboarding localStorage key and navigates home, re-opening the overlay. Works even if user has cards/meetings.
- [x] **Onboarding step tracking** — overlay shows when explicitly re-triggered (force flag) or when user has 0 cards + 0 meetings (new user)

### P2 — Error states with no recovery (user gets stuck)

- [x] **Cards page** — added "Try again" Retry button to error state
- [x] **Voice notes** — failed transcription items now show a Trash2 Delete button that stops propagation; user can clear stuck notes
- [x] **Meetings filter combo** — when filter combo produces 0 results, show active filter pills + "Clear filters" link
- [x] **Meeting detail — Generate tab** — already shows "Generate not available / A completed transcript is required" (done in earlier Phase)

### P3 — UX rough edges

- [x] **Meeting creation — upfront link validation** — show inline warning "No Meet link will be generated — connect Google Calendar" before the user clicks Create
- [x] **Bookings — timezone display** — all booking times now show the local timezone label (e.g. "2:00 PM – 3:00 PM IST") via `Intl.DateTimeFormat`
- [x] **Pricing page — Upgrade CTA** — already present from Phase 3.x (confirmed 2026-04-19)
- [x] **Home widgets — empty state CTAs** — "No recent meetings" has a "Schedule or import a meeting" link → `/meetings`
- [x] **Ask AI — low credits warning** — credits badge is now amber with ⚠ prefix when < 10 credits remain, making it visually distinct

---

## Phase 4.9 — In-App Notifications (Frontend)

> Bell icon in the app header + notification panel + real-time SSE updates. Backend delivers notifications via `GET /notifications/stream` (SSE). Frontend subscribes on mount, shows a badge, and lets the user open a panel to read/dismiss. All within the existing header + settings structure.

### P0 — Service + Query Layer ✅

- [x] `src/services/notificationService.ts`:
  - `listNotifications(cursor?, limit?)` — `GET /notifications`
  - `getUnreadCount()` — `GET /notifications/unread-count`
  - `markRead(id)` — `PATCH /notifications/:id/read`
  - `markAllRead()` — `PATCH /notifications/read-all`
  - `deleteNotification(id)` — `DELETE /notifications/:id`
- [x] `queryKeys.notifications.list()`, `queryKeys.notifications.unreadCount()` in `src/lib/queryKeys.ts`
- [x] Hooks in `src/hooks/queries/useNotificationQueries.ts`:
  - `useNotifications()` — `useInfiniteQuery` with cursor pagination
  - `useUnreadCount()` — `useQuery`, `staleTime: 60_000`, `refetchInterval: 60_000`
  - `useMarkRead()` — `useMutation`, optimistically sets `isRead: true` in cache
  - `useMarkAllRead()` — `useMutation`, invalidates `queryKeys.notifications.*`
  - `useDeleteNotification()` — `useMutation`, optimistically removes from list

### P1 — Notification Bell ✅

New component: `src/components/notifications/NotificationBell.tsx`

- [x] Bell icon (`Bell` from lucide) in app header, right side (alongside existing icons)
- [x] Badge overlay — red dot when `unreadCount > 0`, shows count when `< 100`, "99+" when ≥ 100. Badge: `text-[9px]`, `min-w-[16px] h-4`, `rounded-full`, `bg-red-500 text-white`
- [x] Click → opens `<NotificationPanel />`
- [x] Badge animates in with a small scale spring when count goes 0 → >0

### P2 — Notification Panel ✅

New component: `src/components/notifications/NotificationPanel.tsx`

- [x] Popover anchored to bell icon — `w-80`, `max-h-[480px]`, overflow scroll, `rounded-2xl`, glassmorphism (`bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl`)
- [x] Header: "Notifications" label + "Mark all read" button (ghost, `text-xs`) — hidden when no unread
- [x] **Skeleton:** 3 placeholder rows while `isLoading`
- [x] **Empty state:** Bell icon + "You're all caught up" text + `text-xs text-muted-foreground`
- [x] **Notification rows:** type icon + title/body/timestamp + unread dot
- [x] Click row → `markRead(id)` + navigate to entity (meeting detail, task, booking)
- [x] **Grouped sections:** "Today" / "Earlier" with date-based grouping
- [x] **"Clear read" button** at bottom — calls `deleteNotification` on each read notification
- [x] Infinite scroll via IntersectionObserver sentinel

### P3 — Real-time WebSocket Hook ✅

New hook: `src/hooks/useNotificationSocket.ts` (WebSocket, not SSE — backend uses WS)

- [x] Derives WS URL from `VITE_API_BASE_URL` (http→ws, strips `/api` path)
- [x] Sends AUTH message on open, handles CONNECTED / NOTIFICATION / PING
- [x] On NOTIFICATION: invalidates `queryKeys.notifications.all` + shows Sonner toast
- [x] Exponential backoff reconnect: 3s → 60s cap
- [x] Mounted in `Layout.tsx` — runs for whole authenticated session

### P4 — Settings: In-App Notification Preferences ✅

- [x] `src/pages/settings/Settings.tsx` — new "In-App" Card section in `NotificationsSection`
- [x] Master toggle (`inAppNotificationsEnabled`) + 3 per-type toggles (booking / meeting ready / task due)
- [x] Backed by `useUpdateSettings()` — persists all 4 `inApp*` fields
- [x] Toggles disabled when master is off (same opacity/pointer-events pattern as email section)
- [x] `src/types/settings.ts` — 4 `inApp*` fields added to `UserSettings` + `PatchUserSettingsPayload`

---

## Phase 5 — Encryption at Rest

> Full design spec: `../docs/superpowers/specs/2026-05-16-encryption-at-rest-design.md`
> Backend owns the encryption. Frontend just surfaces the trust story.

**What changes on the frontend:** almost nothing. API responses still return plaintext over TLS — encryption is at rest in the DB, decrypted server-side before the response is sent. The work here is trust-surface copy + handling the rare decrypt-fail error.

### P0 — Trust surfacing

- [ ] **Privacy section in Settings** — add (or expand) `/settings/privacy` with an "Encryption" subsection. Copy: _"Your meeting transcripts, notes, AI content, tasks, contacts, and booking PII are encrypted at rest using Google Cloud KMS. Crelyzor can decrypt for AI features and your own access; a leaked database alone cannot be read."_
- [ ] **"Encrypted" badge on meeting detail** — a small lock-icon badge near the transcript / notes section header (`text-[10px] text-muted-foreground uppercase tracking-wider`, neutral, no color). Pure trust signal, no interaction.
- [ ] **Account-deletion confirmation modal** — update copy to call out crypto-shredding: _"Deleting your account destroys your encryption key. Your data — including in our backups — becomes permanently unrecoverable. This cannot be undone."_

### P1 — Error handling

- [ ] **Decrypt-failure error path** — when the backend returns the new `DECRYPT_FAILED` error code (very rare; likely indicates a KMS/IAM issue or a row missing a DEK), render the empty-state pattern: _"This content couldn't be loaded. Contact support."_ No raw error text. Log to Sentry with full context.
- [ ] React Query global `onError` handler — handle `DECRYPT_FAILED` as a non-toast error (don't spam toasts on a content-render failure — the empty state inline is enough)

---

## Phase 6 — Teams (Frontend)

> Full design spec: `../docs/internal/superpowers/specs/2026-05-09-teams-design.md`
> Aesthetic: **Minimal. Precise. Alive.** — DM Sans, neutral grays only, spring physics, glassmorphism on floating surfaces. Match existing dashboard exactly. No new visual language.

---

### P0 — Team Store + API Layer

Foundation shipped 2026-05-30. Dev notes: `docs/dev-notes/phase-6-p9a-workspace-switcher.md`.

- [x] **`teamStore.ts`** (Zustand, `persist` + `sessionStorage`) — `activeTeamId: string | null`, `setActiveTeam(id)`.
- [~] **`teamService.ts`** — shipped `createTeam`, `listMyTeams`, `getTeam`. Remaining methods (member/invite/usage/booking) will land alongside the consuming UI chunks (P10 → P12).
- [~] **`useTeamQueries.ts`** — `useMyTeams`, `useTeam`, `useCreateTeam` shipped. Remaining hooks land with their consumers.
- [x] **`queryKeys.ts`** additions — `queryKeys.teams.{all, list, detail}()`. Additional sub-keys land with their domains.
- [x] **`apiClient.ts`** — injects `X-Team-Id` from `teamStore.getState()` into all three request fns (JSON, FormData, text).
- [ ] **WS handlers** — `TEAM_INVITE_RECEIVED`, `TEAM_MEMBER_*`, `TEAM_MEETING_BOOKED` invalidation routing. Deferred to P13 (invite UI infra).

---

### P1 — Workspace Switcher

Replaces existing `<UserMenu />` trigger. New component: `src/components/workspace-switcher/WorkspaceSwitcher.tsx`.

**Trigger button (32px tall):**

- Personal: 24px avatar + display name + `ChevronDown` (12px text-muted-foreground)
- Team: 24px team logo (`rounded-lg`) + team name + role pill (`text-[10px] text-muted-foreground` — `OWNER`/`ADMIN`/`MEMBER`) + chevron
- Hover: `bg-muted/40`
- Pending invites dot indicator (`bg-foreground h-1.5 w-1.5 rounded-full`) on the avatar/logo when `pendingInvites.count > 0`

**Dropdown panel** (`bg-[#1C1C1E] dark:bg-[#1C1C1E] border border-white/[0.06] rounded-[20px] shadow-2xl shadow-black/40 p-1.5 w-[280px]`, spring entry):

- [ ] **Pending invites section** (only if count > 0) — collapsible header "2 pending invitations" → list with Accept (primary xs) + Decline (ghost xs) per invite. Below: divider.
- [ ] **Workspaces label** — `text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-1.5`.
- [ ] **Personal row** — avatar + name + `Check` icon (12px) if active.
- [ ] **Team rows** — logo + name + role pill + right-side "6 members" (text-xs muted) + `Check` if active.
- [ ] **Divider** + **`+ Create team`** row — `Plus` (14px) + label. Disabled for Free users with tooltip "Teams are a Pro feature". Disabled for Pro users at team limit with tooltip "Upgrade to Business for more teams".
- [ ] **Divider** + account actions (Profile / Settings / Logout) — preserve existing `UserMenu` items.

**Behavior:**

- [x] Click team row → `teamStore.setActiveTeam(id)` → `queryClient.invalidateQueries()` (broad). Toast deferred — the cross-fade alone signals scope change clearly.
- [x] Click Personal → `teamStore.setActiveTeam(null)` → broad invalidate.
- [x] **Route outlet wrapper:** `<AnimatePresence mode="wait">` + `<motion.div key={scopeKey}>` in Layout.tsx — 220ms cross-fade on workspace switch.
- [ ] **P9.b — Command palette** "Switch workspace" command group + `Cmd+1..9` keybinds. Deferred.
- [ ] **P9.b — Pending invites surface** in switcher header. Deferred (waits for P13 infra).

---

### P2 — Team Creation + Plan Gate ✅ Complete (2026-05-30)

Dev notes: `docs/dev-notes/phase-6-p10-create-team-modal.md`.

- [x] **`<CreateTeamModal />`** at `src/components/teams/CreateTeamModal.tsx` + `<CreateTeam />` modal-as-page at `src/pages/create-team/CreateTeam.tsx`. Route `/teams/new` registered in App.tsx with AuthGuard + Layout.
- [x] Sparkles header + "Create your workspace" + subhead copy.
- [x] Team name (autofocus) + auto-derived slug with `crelyzor.app/t/` prefix + `slugManuallyEdited` flag to preserve user edits.
- [x] Optional description (textarea, max 500) + optional logo URL input.
- [x] Submit handles 4 outcomes: 201 → setActiveTeam + navigate / ; 402 → close + openUpgradeModal('FEATURE_GATE') ; 409 → inline slug error ; other 4xx → toast.
- [~] **Logo dropzone + slug-availability pre-check deferred** — dropzone waits for a backend team-logo upload endpoint; pre-check waits for a `GET /teams/check-slug` endpoint. Both ship with P11/P3 (team settings).
- [x] **`<UpgradeToProModal />` handled via existing `<UpgradeModal />` with `FEATURE_GATE` code** — no new component needed since the apiClient interceptor already routes 402 responses through the shared modal.

---

### P3 — Team Settings Page

Route: `/teams/:teamId/settings`. New page: `src/pages/teams/TeamSettingsPage.tsx`. Layout: vertical tab nav (left, w-[200px]) + content (flex-1). Wrap in `PageMotion`.

- [x] **General tab** — name / slug (Owner-only editable, disabled+hint for Admin/Member) / description / logo URL input. Save button disabled until dirty. 200/403/409 handling inline. Logo upload UX still needs a backend endpoint — URL input ships now. P11.a (2026-05-30). Dev notes: `docs/dev-notes/phase-6-p11a-team-settings-foundation.md`.
- [x] **Members tab** (P11.b — 2026-05-30) — header with `Invite member` (Admin+); roster: avatar + name/email + role badge or Owner-only inline `<select>` + relative joined date + kebab (Admin+, non-Owner, non-self) → Remove confirm Dialog. Empty state: "Just you for now". Dev notes: `docs/dev-notes/phase-6-p11b-team-members-invites.md`.
- [x] **Invite member modal** (P11.b) — email-mode only (chip input, Enter/comma/Backspace, 10-cap), role select (ADMIN | MEMBER), optional 200-char personal note. Toast distinguishes sent vs skipped. User-mode (typeahead) deferred — no user-search endpoint yet.
- [x] **Invites tab** (P11.b) — pending invites list with Resend + Cancel per row, expiry highlighted red when past. Members view is gated to "Only owners and admins can see pending invites." copy + no fetch.
- [x] **Usage tab** (P11.c — 2026-05-30) — 4 summary cards (Transcription / Recall / AI / Storage) vs owner-plan limits ("Unlimited" / "Not on this plan" / finite bar); per-member breakdown sorted by transcription desc; client-side CSV export (`<slug>-usage-<YYYY-MM-DD>.csv`); members see permission copy; empty-state card. Period selector deferred until backend supports `?period=`. Dev notes: `docs/dev-notes/phase-6-p11c-usage-billing.md`.
- [x] **Billing tab** (P11.c) — Owner sees "You're paying for this team's consumption" + "Manage billing" CTA → `/settings?tab=billing`. Admin/Member sees read-only attribution copy. FREE-plan Owner edge-case warning card.
- [x] **Danger zone tab** (P11.a — 2026-05-30):
  - Member view: `Leave team` (destructive) with confirm dialog.
  - Owner view: `Transfer ownership` (target member select via `useTeamMembers` + type team name to confirm) + `Delete team` (destructive, type team name to confirm).
  - Post-success: setActiveTeam(null) → navigate('/') so stale scope can't 403 the next request.
- [x] Handle non-member — auto-redirect to `/` (P11.a — 2026-05-30).

---

### P4 — Usage Tab (Owner + Admin only)

- [ ] **4 summary cards** in `grid-cols-2 md:grid-cols-4 gap-3`. Each card `rounded-xl border bg-card p-4`:
  - Micro-label uppercase tracking-wider (`text-[10px] text-muted-foreground`) e.g. "Transcription minutes"
  - Big number `text-2xl font-semibold` (e.g. "1,243")
  - Subtitle `text-xs muted` (e.g. "of 5,000")
  - `h-1 bg-muted rounded-full` with `bg-foreground` fill (only when quota exists)
    Cards: Transcription minutes / AI tokens / Storage GB / Meetings (no quota).
- [ ] **Period selector** (right-aligned above breakdown table) — `<Select>`: This month / Last month / Last 7 days / Custom range (opens date range picker).
- [ ] **Per-member breakdown table** — sortable columns. Right-align numerics. Subtle row hover.
- [ ] **`Export CSV`** (`text-xs` link, top-right of table) — downloads current period CSV.
- [ ] Empty state: "No usage yet this period. Activity will appear here once team members start working." (text-xs muted, centered, py-12).

---

### P5 — Team Context Indicator (subtle) ✅ Complete (2026-05-30)

P9.a workspace switcher already serves this role. Spec explicitly forbids a top-strip content indicator.

- [x] Workspace switcher trigger shows team logo/name/role in team scope; user identity in personal. (P9.a)
- [x] "Team settings" entry in the switcher dropdown only when in team scope, routing to `/teams/:teamId/settings`. (P9.a + P11.a)
- [x] No top-strip indicator added — per spec.

---

### P6 — Team-aware Content Pages ✅ Audit complete (2026-05-30)

P12 audit (dev notes: `docs/dev-notes/phase-6-p12-team-aware-content-internal-booking.md`) confirmed no client-side `userId` filters fight the server-side X-Team-Id scoping. Pages already pass through the header transparently — no per-page changes were needed.

- [x] **Meetings page** — verified no client-side actor filter. "Book teammate" button added to header in team scope (P12).
- [x] **Cards / Tasks / Calendar / Search / Tags / Voice notes / Card analytics / Card contacts** — all rely on apiClient header pass-through; no code change needed. Server enforces visibility.

---

### P7 — Internal Team Booking ✅ Complete (2026-05-30)

Dev notes: `docs/dev-notes/phase-6-p12-team-aware-content-internal-booking.md`.

- [x] **"Book teammate" button** in Meetings page header (team context only) — outline variant with `Users` icon.
- [x] **`<BookTeamMemberModal />`** — `rounded-2xl`, 520px wide, internal step state with back navigation + step indicator "Step N of 4".
  - **Step 1 — Pick member:** `useTeamMembers` list with avatars + emails. Self + username-less members excluded. Empty state if no other teammates.
  - **Step 2 — Pick event type:** fetches the member's team-scoped event types via `GET /public/scheduling/team/:slug/:username`. ONLINE/IN_PERSON icon + duration. Empty state if no team event types.
  - **Step 3 — Pick date + slot:** `<input type="date" min={today}>` + slot grid (3 cols, browser TZ). Empty state on zero availability.
  - **Step 4 — Confirm:** summary card + optional 500-char note + "Send booking". Pre-fills booker name/email/TZ.
- [x] On send: `POST /public/bookings` → toast "Booking sent — pending host approval" → invalidate meetings cache → close.
- [~] Backend `POST /teams/:teamId/bookings/internal` — NOT built; ships via the existing public-booking endpoint with pre-filled booker identity. Acceptable trade-off; documented.

---

### P8 — In-app Invite Surfaces

- [ ] **Workspace switcher pending invites section** (see P1).
- [ ] **Notifications panel** — render `TEAM_INVITE_RECEIVED` items inline with title "[Inviter] invited you to [Team] as [Role]" + subtitle (relative time) + Accept (primary xs) + Decline (ghost xs).
- [ ] **WS handler** wires `TEAM_INVITE_RECEIVED` → invalidate `pendingInvites` + toast `"You've been invited to [Team]"` (5s, with View action that opens the workspace switcher).

---

## Phase 7 — Razorpay ⛔ BLOCKED

Account blocked. Do not start.

---

## Phase 8 — Big Brain ⛔ BLOCKED

Requires vector infra + Phase 5 (Encryption at Rest) live in prod.

- [ ] Global Ask AI / Big Brain chat interface (RAG — requires vector infra first)
