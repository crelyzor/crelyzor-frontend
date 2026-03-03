# calendar-frontend — Task List

Last updated: 2026-03-03 (theme fix + refresh token added to P0)

> **Rule:** When you complete a task, change `- [ ]` to `- [x]` and move it to the Done section.
> **Legend:** `[ ]` Not started · `[~]` Has code but broken/incomplete · `[x]` Done and working

---

## P0 — Build Next (in order)

### Auth — Refresh Token

- [ ] Backend: `POST /auth/refresh` endpoint — exchange refresh token for new access token
- [ ] Backend: Issue refresh token on login (httpOnly cookie or response body), store hashed in DB
- [ ] Frontend: Axios interceptor — on 401, auto-call `/auth/refresh`, retry original request
- [ ] Frontend: On refresh failure (token expired/invalid), clear auth state and redirect to `/signin`
- [ ] No more "login again" on access token expiry

### Ask AI Chat Interface

- [ ] Chat panel inside MeetingDetail (available for RECORDED + VOICE_NOTE when transcript exists and SCHEDULED when meeting is live)
- [ ] Input: "Ask anything about this meeting..."
- [ ] Stream AI response
- [ ] Pre-loaded suggestions: "Summarize decisions", "List action items", "What were the blockers?"
- [ ] Conversation history within session
- [ ] Requires Ask AI backend endpoint first (`POST /sma/meetings/:id/ask`)

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

---

## Not Built Yet

### Delete Meeting

- [ ] Wire Delete button in VoiceNoteDetail (currently `toast.info('Delete coming soon')`)
- [ ] Wire Delete button in RecordedDetail (same)
- [ ] Confirm dialog before delete
- [ ] Navigate back to list after delete

### Home Dashboard

- [ ] Today's meetings widget (filtered to today, not just recent)
- [ ] Pending action items widget across all meetings

---

## Phase 1 — Done ✅

### MeetingDetail — 3 distinct layouts by type

- [x] VoiceNoteDetail: minimal header, flat scroll (player → transcript → summary), Delete only
- [x] RecordedDetail: compact header, speakers section with inline rename, tabs (Recording | Transcript | Summary | Action Items)
- [x] ScheduledDetail: full header with status badge, participants, quick actions, tabs (Overview | Transcript | Summary | Action Items | Recording)
- [x] MeetingDetail shell: thin router to 3 layout components, polling preserved

### Voice Notes — separate section

- [x] Add "Voice Notes" nav item in toolbar (Control Center + pinnable)
- [x] `/voice-notes` route → VoiceNotes page
- [x] Lists all VOICE_NOTE meetings, sorted by date desc
- [x] Meetings list page (`/meetings`) filters out VOICE_NOTE
- [x] Voice Note cards: minimal — title, date, duration, transcript status badge
- [x] Voice Notes quick-action bubble on home dashboard
- [x] Recent Voice Notes widget on home dashboard (right column, last 3, click → detail)

### Meetings List — type segregation + UX

- [x] Type toggle: All | Live | Recordings (filters SCHEDULED vs RECORDED)
- [x] RECORDED badge: Video icon only (no "REC" text)
- [x] Online SCHEDULED badge: Globe icon (detected by URL in location or meetingProvider)
- [x] Skeleton loading state while data fetches

### Home Dashboard

- [x] Recent Meetings filters out VOICE_NOTE
- [x] Recent Meetings skeleton loading (5 shimmer rows)
- [x] Cache shared with /meetings page (same useMeetingsAll query key — no duplicate fetch)
- [x] Recent Voice Notes widget added to right column

### Settings — fixed and wired

- [x] Appearance theme change actually works (connected to useThemeStore, was using local useState)
- [x] Profile shows @username below email
- [x] Username read-only field in profile form
- [x] URL-based tabs: `/settings?tab=profile`, `?tab=appearance`, `?tab=security` (bookmarkable, deep-linkable)
- [x] UserMenu: Profile above Settings
- [x] UserMenu: Profile button → `/settings?tab=profile`, Settings button → `/settings?tab=appearance`

### Cmd+K (Command Palette) — fixed

- [x] Navigate section sourced from TOOLBAR_ITEMS (single source of truth) — Voice Notes auto-included
- [x] Input focus ring removed (`[cmdk-input]:focus-visible { outline: none }` in CSS)
- [x] "New Meeting" goes to `/meetings` (not `/meetings/create` which doesn't exist)

### Skeleton loading states — all pages

- [x] Home — RecentMeetings skeleton (5 rows)
- [x] Meetings page — 6 card skeletons matching card layout
- [x] CardEditor — 2-column skeleton (header + template grid + field rows + preview panel)
- [x] Cards list — correct 1.586:1 aspect ratio shape + stats bar per card

### Global fixes

- [x] Light mode background softened: `#ffffff` → `#f5f5f5` (cards stay `#ffffff` for depth)
- [x] Theme flash on hard refresh eliminated: blocking inline script in `<head>` reads localStorage before first paint
- [x] MeetingProvider field added to DisplayMeeting for online meeting detection

### Previously done

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
