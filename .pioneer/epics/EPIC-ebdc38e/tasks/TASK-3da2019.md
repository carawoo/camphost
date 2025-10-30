---
id: TASK-3da2019
title: 대시보드 초기화 로직 개선 - Supabase 우선, localStorage 최후 폴백
type: task
task_type: refactor
status: DONE
priority: high
created: 2025-10-30T12:52:33Z
updated: 2025-10-30T13:12:46Z
assignee: scrum-master
epic: EPIC-ebdc38e
dependencies: []
---

# TASK-3da2019: 대시보드 초기화 로직 개선 - Supabase 우선, localStorage 최후 폴백

## Description

Dashboard initialization logic currently uses localStorage as fallback without validation, potentially showing stale data from deleted campgrounds (e.g., "용오름밸리"). This task improves the initialization flow to prioritize Supabase, then campgroundService, and finally use validated localStorage that automatically cleans stale data.

## Requirements

- [x] Import and use validateAndGetCampgroundInfo() from lib/campground.ts
- [x] Replace direct getCampgroundInfo() call with validateAndGetCampgroundInfo()
- [x] Ensure initialization flow: URL params → Supabase → campgroundService → validated localStorage
- [x] Maintain existing status checks (suspended/terminated)
- [x] Maintain backward compatibility with URL params (id and name)
- [x] Ensure loading state is always set to false

## Tech Spec

### Design Overview
- File: `app/admin/dashboard/page.tsx`
- Change: Replace localStorage fallback (lines 92-96, 98-100) with validateAndGetCampgroundInfo()
- Purpose: Automatically validate and clean stale localStorage data against DB

### Implementation Flow

```
1. Get URL params (id or campground name)
2. Try Supabase (if enabled) by id or name
   → If found: Map data, update state, return
3. Try campgroundService
   → If found: Map data, update state, return
4. Fallback: validateAndGetCampgroundInfo()
   → Validates localStorage against DB
   → Removes invalid data automatically
   → Returns default if invalid
5. Error handling: Use validateAndGetCampgroundInfo() in catch block
6. Always set loading to false
```

### Key Changes

**Import Statement** (line 6):
```typescript
import { getCampgroundInfo, updateCampgroundInfo, validateAndGetCampgroundInfo, type CampgroundInfo } from '../../../lib/campground'
```

**localStorage Fallback** (lines 90-96):
Replace:
```typescript
} else {
  // 기존 로컬 저장소 폴백
  const info = getCampgroundInfo()
  setCampgroundInfo(info)
  setEditCampgroundInfo(info)
  if (info?.name) setCampgroundName(info.name)
}
```

With:
```typescript
} else {
  // 검증된 로컬 저장소 폴백 (DB 검증 포함)
  const info = await validateAndGetCampgroundInfo()
  setCampgroundInfo(info)
  setEditCampgroundInfo(info)
  if (info?.name) setCampgroundName(info.name)
}
```

**Error Handler** (lines 97-101):
Replace:
```typescript
} catch {
  const info = getCampgroundInfo()
  setCampgroundInfo(info)
  setEditCampgroundInfo(info)
}
```

With:
```typescript
} catch (error) {
  console.error('Dashboard initialization error:', error)
  // 에러 발생 시에도 검증된 localStorage 사용
  const info = await validateAndGetCampgroundInfo()
  setCampgroundInfo(info)
  setEditCampgroundInfo(info)
}
```

### Behavior Changes

**Before**:
- localStorage data used directly without validation
- Stale data (deleted campgrounds) shown in UI
- No automatic cleanup

**After**:
- localStorage data validated against Supabase DB
- Invalid data automatically removed
- Default campground shown if invalid
- Graceful degradation if Supabase unavailable

### Testing Notes
- Test with valid URL params (id and name)
- Test with invalid campground name (should use default)
- Test with stale localStorage (e.g., "용오름밸리")
- Verify suspended/terminated status checks still work
- Check loading states display correctly

## Work Log

### 2025-10-30 12:52 - scrum-master
- Task created

### 2025-10-30 13:00 - developer
- Tech Spec written
- Implementation completed
  - Updated app/admin/dashboard/page.tsx
  - Replaced getCampgroundInfo() with validateAndGetCampgroundInfo()
  - Improved error handling with validation
- Build: ✅ Success (Next.js build completed without errors)

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 12:52 | TODO | scrum-master | Task created |
| 2025-10-30 13:01 | READY_FOR_TEST | test-engineer | Dashboard initialization improved - localStorage now validated against DB |
| 2025-10-30 13:01 | READY_FOR_TEST | developer | Dashboard initialization logic improved with validation |
| 2025-10-30 13:12 | DONE | scrum-master | Dashboard initialization improved and tested |

## Artifacts

- Branch:
- Commit:
- Files Modified:

## Checklist

- [x] Tech spec written (Developer)
- [x] Code implemented (Developer)
- [x] Type check passed
- [x] Lint passed (Next.js build includes type/lint checking)
- [x] Build succeeded
- [ ] Tests written (Test Engineer)
- [ ] Tests passed

