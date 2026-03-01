# calendar-frontend — Task List

Last updated: 2026-03-02

---

## In Progress

_Nothing in progress right now._

---

## Phase 1 — Pending (Priority Order)

### 1. Wire MeetingDetail to Real API (Highest Priority)

The `MeetingDetail.tsx` page currently shows mock/hardcoded data. Connect everything to real backend.

- [ ] Fetch and display real transcript (`TranscriptSegment[]` with speaker labels)
- [ ] Fetch and display real AI summary + key points
- [ ] Fetch and display real action items (with categories, owners)
- [ ] Fetch and display meeting notes
- [ ] Recording tab: show actual recording info (duration, file size, uploaded at)
- [ ] Add React Query hooks in `src/hooks/queries/useSMA.ts`
- [ ] Add query keys to `src/lib/queryKeys.ts`
- [ ] Add service functions to `src/services/meetingsService.ts`

### 2. Recording Upload UI

- [ ] Upload recording file (audio or video) from MeetingDetail recording tab
- [ ] Show upload progress bar
- [ ] Poll transcription status (`NONE → UPLOADED → PROCESSING → COMPLETED`)
- [ ] Show processing state (pulsing indicator while transcription runs)
- [ ] Show completion toast + auto-refresh transcript/summary

### 3. Action Items UI

- [ ] Mark action item as complete / incomplete (toggle)
- [ ] Create action item manually (inline form)
- [ ] Show action item owner, category, suggested dates
- [ ] Delete action item
- [ ] Mutations with optimistic updates

### 4. Meeting Notes UI

- [ ] Create note (textarea + submit)
- [ ] Delete note
- [ ] Show notes with author and timestamp
- [ ] Link note to transcript timestamp (optional, nice to have)

### 5. Edit Meeting Modal

- [ ] Edit title, description, time, location
- [ ] Add / remove participants
- [ ] Save with optimistic update + toast

### 6. Ask AI Chat Interface (Highest Impact Feature)

- [ ] Chat panel in MeetingDetail (new tab or side panel)
- [ ] Input field: "Ask anything about this meeting..."
- [ ] Display AI response (streaming preferred)
- [ ] Show conversation history (within session)
- [ ] Pre-loaded suggestions: "Summarize key decisions", "List action items", "What were the blockers?"
- [ ] Loading state (typing indicator)
- [ ] Requires backend Ask AI endpoint to be built first

### 7. Home Dashboard Polish

- [ ] Today's meetings widget (not just recent — filtered to today)
- [ ] Pending action items widget (from all recent meetings)
- [ ] Quick "Record a meeting" CTA
- [ ] Meeting SMA status indicators on home cards (has recording? has summary?)

---

## Phase 1 — Done

- [x] Meeting list page with search, filter, group by date
- [x] Meeting cards with SMA indicators
- [x] Home page with recent meetings widget
- [x] Default card widget (3D flip)
- [x] Start Meeting FAB (idle, menu, recording, review states)
- [x] Command palette (Cmd+K)
- [x] Google OAuth sign-in flow
- [x] Theme system (light/dark/system)
- [x] Toolbar with pins
- [x] Card editor page
- [x] Card analytics page
- [x] Card contacts page
- [x] Cards list page
- [x] Auth guard
- [x] Page transitions (PageMotion)
- [x] React Query setup
- [x] Zustand stores (auth, theme, ui, toolbar)

---

## Phase 1.2 — Future

- [ ] Availability settings page (recurring + custom overrides)
- [ ] Public booking page UI
- [ ] Online meeting bot activation flow (Recall.ai)
- [ ] Google Calendar sync settings

---

## Phase 2 — Future

- [ ] Big Brain chat interface (app-level, not per-meeting)
- [ ] "What should I focus on today?" home widget

---

## Phase 3 — Future

- [ ] Tasks page (Todoist-style)
- [ ] Task creation, editing, completion
- [ ] Task list with filters, priorities, due dates
