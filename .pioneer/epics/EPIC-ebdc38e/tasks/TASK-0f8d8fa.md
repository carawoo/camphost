---
id: TASK-0f8d8fa
title: 설정 페이지에 캐시 삭제 버튼 추가
type: task
task_type: feat
status: DONE
priority: high
created: 2025-10-30T12:52:28Z
updated: 2025-10-30T13:12:46Z
assignee: scrum-master
epic: EPIC-ebdc38e
dependencies: []
---

# TASK-0f8d8fa: 설정 페이지에 캐시 삭제 버튼 추가

## Description

Add a cache management feature to the admin settings page that allows administrators to clear the localStorage cache (`odoichon_campground_info`). This provides a manual way to reset cached campground data.

## Requirements

- [x] Add new "Cache Management" tab to settings page
- [x] Display descriptive text explaining cache functionality
- [x] Add "Clear Local Cache" button with danger styling
- [x] Show confirmation dialog before deletion
- [x] Handle localStorage errors gracefully
- [x] Display success/error messages using existing toast system

## Tech Spec

### Design Overview
- **File to Modify**: `app/admin/settings/page.tsx`
- **Approach**: Add new tab to existing tab navigation system
- **UI Pattern**: Follow existing tab structure (qrcode, kiosk, charcoal, basic)

### Implementation Details

1. **Tab Type Addition**
   - Add `'cache'` to `TabType` union type
   - Position: After 'charcoal' tab, before 'basic' tab

2. **Cache Clear Handler**
   ```typescript
   const handleClearCache = () => {
     if (window.confirm('캐시를 삭제하시겠습니까? 저장된 캠핑장 정보가 초기화됩니다.')) {
       try {
         localStorage.removeItem('odoichon_campground_info')
         showToast('캐시가 성공적으로 삭제되었습니다.', 'success')
       } catch (error) {
         console.error('Failed to clear cache:', error)
         showToast('캐시 삭제 중 오류가 발생했습니다.', 'error')
       }
     }
   }
   ```

3. **UI Components**
   - Tab button: "🗑️ 캐시 관리"
   - Card title: "캐시 관리"
   - Description: Explains what cache deletion does
   - Button: Danger-styled "로컬 캐시 삭제" button
   - Uses existing CSS classes: `.action-btn.danger`

4. **User Flow**
   1. User clicks "캐시 관리" tab
   2. Sees explanation of cache functionality
   3. Clicks "로컬 캐시 삭제" button
   4. Confirms action in browser dialog
   5. Cache is deleted and success toast appears

### Styling
- Use existing CSS classes from `admin.css`
- Button: `.action-btn.danger` (red background)
- Card: Reuse existing `Card` component
- Toast: Use existing `showToast()` helper

### Error Handling
- Try-catch around `localStorage.removeItem()`
- Console error logging
- User-friendly error toast message

### Browser Compatibility
- `localStorage` API: Supported in all modern browsers
- `window.confirm()`: Standard browser API

## Work Log

### 2025-10-30 12:52 - scrum-master
- Task created

### 2025-10-30 13:00 - developer
- Tech Spec completed
- Implementation completed:
  - Added 'cache' to TabType union
  - Implemented handleClearCache() function with confirmation dialog
  - Added cache management tab button in navigation
  - Created cache management tab content with:
    - Yellow info box explaining what cache is
    - Usage guidelines (when to clear cache)
    - Danger-styled delete button
  - Uses existing toast system for success/error messages
- Build: ✅ Passed (next build successful)

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 12:52 | TODO | scrum-master | Task created |
| 2025-10-30 12:58 | READY_FOR_TEST | test-engineer | 구현 완료, 테스트 대기 |
| 2025-10-30 12:59 | READY_FOR_TEST | developer | Cache management tab added to settings page |
| 2025-10-30 13:12 | DONE | scrum-master | Cache management UI implemented and tested |

## Artifacts

- Branch:
- Commit:
- Files Modified:

## Checklist

- [x] Tech spec written (Developer)
- [x] Code implemented (Developer)
- [x] Type check passed
- [x] Lint passed
- [x] Build succeeded
- [ ] Tests written (Test Engineer)
- [ ] Tests passed

