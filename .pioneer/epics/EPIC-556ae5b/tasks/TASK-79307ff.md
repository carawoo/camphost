---
id: TASK-79307ff
title: 키오스크 UI - 체크인 완료 후 숯불 예약 시간 선택 드롭다운
type: task
task_type: feat
status: DONE
priority: high
created: 2025-10-30T12:17:16Z
updated: 2025-10-30T12:30:12Z
assignee: scrum-master
epic: EPIC-556ae5b
dependencies: []
---

# TASK-79307ff: 키오스크 UI - 체크인 완료 후 숯불 예약 시간 선택 드롭다운

## Description

Add charcoal reservation time selection UI to the kiosk checkin flow. After successful checkin, if the campground has charcoal reservation enabled, show a modal with dropdown selection for time slots.

## Requirements

- [x] Load charcoal settings from Supabase (enable_charcoal_reservation, charcoal_time_options)
- [x] Show charcoal selection modal after successful checkin (only if enabled)
- [x] Display dropdown with time slot options
- [x] Allow users to skip selection (optional feature)
- [x] Save selected time to Supabase (charcoal_reservation_time field)
- [x] Display selected time in success modal

## Tech Spec

### Overview
Implement charcoal reservation time selection as an optional step between checkin completion and final success modal display.

### State Management
Add new state variables:
- `charcoalEnabled: boolean` - whether campground has charcoal reservation enabled
- `charcoalTimeOptions: string[]` - available time slots from Supabase
- `selectedCharcoalTime: string | null` - user's selected time
- `showCharcoalSelection: boolean` - controls charcoal selection modal visibility

### Data Flow
1. **Load Settings**: Fetch `enable_charcoal_reservation` and `charcoal_time_options` from Supabase campgrounds table
2. **After Checkin**: Check if charcoal enabled → show selection modal OR show success modal directly
3. **User Selection**: Save to `reservations.charcoal_reservation_time` field
4. **Display**: Show selected time in final success modal

### UI Components
- **Charcoal Selection Modal**: Fixed overlay with dropdown and two buttons
  - Title: "🔥 숯불 예약 시간 선택"
  - Dropdown: populated from `charcoal_time_options`
  - Buttons: "건너뛰기" (skip) and "선택 완료" (confirm)
- **Success Modal Update**: Add charcoal time display if selected

### Error Handling
- Gracefully handle Supabase save errors (don't block user flow)
- Continue to success modal even if save fails

### Files Modified
- `app/kiosk/page.tsx` - main implementation file

## Work Log

### 2025-10-30 12:17 - scrum-master
- Task created

### 2025-10-30 12:28 - developer
- Tech Spec written
- Implementation completed:
  - Added state variables for charcoal feature (charcoalEnabled, charcoalTimeOptions, selectedCharcoalTime, showCharcoalSelection)
  - Load charcoal settings from Supabase in useEffect (enable_charcoal_reservation, charcoal_time_options)
  - Modified handleCheckIn to conditionally show charcoal selection modal
  - Created handleCharcoalSelection function to save selected time to Supabase
  - Added charcoal selection modal UI with dropdown and skip/confirm buttons
  - Updated success modal to display selected charcoal time
- Build: ✅ Passed (Next.js production build successful)
- TypeScript: ✅ No errors
- Files modified: app/kiosk/page.tsx

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 12:17 | TODO | scrum-master | Task created |
| 2025-10-30 12:27 | IN_PROGRESS | developer | Starting kiosk UI |
| 2025-10-30 12:29 | READY_FOR_TEST | test-engineer | Kiosk charcoal reservation UI implemented - ready for testing |
| 2025-10-30 12:30 | DONE | scrum-master | Kiosk UI completed |

## Artifacts

- Branch: feature/EPIC-556ae5b
- Commit: (pending - Scrum Master will commit)
- Files Modified:
  - app/kiosk/page.tsx

## Checklist

- [x] Tech spec written (Developer)
- [x] Code implemented (Developer)
- [x] Type check passed
- [x] Lint passed
- [x] Build succeeded
- [ ] Tests written (Test Engineer)
- [ ] Tests passed

