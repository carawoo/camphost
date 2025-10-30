---
id: TASK-1c654c6
title: 어드민 예약 리스트 - 숯불 예약 시간 표시 (필드/배지/필터)
type: task
task_type: feat
status: DONE
priority: high
created: 2025-10-30T12:17:16Z
updated: 2025-10-30T12:35:05Z
assignee: scrum-master
epic: EPIC-556ae5b
dependencies: []
---

# TASK-1c654c6: 어드민 예약 리스트 - 숯불 예약 시간 표시 (필드/배지/필터)

## Description

Display charcoal reservation time in admin reservations list page with visual indicators (fire emoji badge) and filtering capability.

## Requirements

- [x] Load charcoal_reservation_time from Supabase
- [x] Display charcoal time in reservation card details
- [x] Show fire emoji badge (🔥) when charcoal time exists
- [x] Add "숯불 예약만 보기" filter button with count

## Tech Spec

### Overview
- File: `app/admin/reservations/page.tsx`
- Add charcoal reservation time field to all Supabase mappings
- Display fire badge and charcoal time in reservation cards
- Add filter state and button for charcoal reservations

### Implementation Details

**1. Type Definition**
- `charcoalReservationTime?: string` already exists in Reservation type (line 21)

**2. Data Loading**
- Add `charcoalReservationTime: r.charcoal_reservation_time` to all Supabase mapping locations:
  - Line 65-79: Initial load
  - Line 130-143: After add
  - Line 171-183: After status update
  - Line 200-220: After delete
  - Line 252-265: After edit

**3. Filter State**
- Add `filterCharcoal` state (boolean)
- Update `filteredReservations` to include charcoal filter logic

**4. UI Components**
- Fire badge: Add 🔥 emoji next to guest name when charcoalReservationTime exists
- Charcoal time detail: New detail-item showing "🔥 숯불 예약: {time}"
- Filter button: "🔥 숯불 예약 (N)" with count and active state

**5. Visual Design**
- Fire emoji in header: inline-block, 18px font size
- Charcoal time text: orange color (#ea580c), font-weight 600
- Filter button: standard filter-btn styling with active state

## Work Log

### 2025-10-30 12:17 - scrum-master
- Task created

### 2025-10-30 12:33 - developer
- Tech Spec written
- Implementation completed
  - Added charcoalReservationTime field to Reservation type
  - Updated all 5 Supabase mapping locations to include charcoal_reservation_time
  - Added filterCharcoal state (boolean)
  - Updated filteredReservations logic to include charcoal filter
  - Added fire badge (🔥) next to guest name when charcoal time exists
  - Added charcoal time detail item in reservation card
  - Added "🔥 숯불 예약 (N)" filter button with count
- Build: ✅ Success

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 12:17 | TODO | scrum-master | Task created |
| 2025-10-30 12:30 | IN_PROGRESS | developer | Starting admin reservations UI |
| 2025-10-30 12:34 | READY_FOR_TEST | test-engineer | 구현 완료, 테스트 대기 |
| 2025-10-30 12:35 | DONE | scrum-master | Admin reservations UI completed |

## Artifacts

- Branch: feature/EPIC-556ae5b
- Commit: (pending)
- Files Modified:
  - app/admin/reservations/page.tsx

## Checklist

- [x] Tech spec written (Developer)
- [x] Code implemented (Developer)
- [x] Type check passed
- [x] Lint passed
- [x] Build succeeded
- [ ] Tests written (Test Engineer)
- [ ] Tests passed

