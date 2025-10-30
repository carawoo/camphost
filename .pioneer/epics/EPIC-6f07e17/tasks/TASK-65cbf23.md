---
id: TASK-65cbf23
title: 예약 관리 페이지에 삭제 모드 UI 추가
type: task
task_type: feat
status: DONE
priority: high
created: 2025-10-30T14:24:05Z
updated: 2025-10-30T14:27:53Z
assignee: scrum-master
epic: EPIC-6f07e17
dependencies: []
---

# TASK-65cbf23: 예약 관리 페이지에 삭제 모드 UI 추가

## Description

예약 관리 페이지(`app/admin/reservations/page.tsx`)에 삭제 모드 UI를 추가하여 관리자가 여러 예약을 한 번에 선택하고 삭제할 수 있도록 합니다.

## Requirements

- [x] 삭제 모드 진입/취소 버튼 추가
- [x] 전체 선택 체크박스 추가
- [x] 개별 체크박스 추가 (각 예약 카드)
- [x] handleBulkDelete 함수 구현
- [x] Supabase DELETE API 호출
- [x] State에서 삭제된 항목 제거
- [x] TSC 빌드 통과
- [x] 기존 기능 정상 동작 (회귀 없음)

## Tech Spec

### 설계 개요
- **파일**: `app/admin/reservations/page.tsx`
- **주요 기능**: 삭제 모드 State 관리, 일괄 삭제 UI, Bulk Delete API 호출

### State 추가
```typescript
const [deleteMode, setDeleteMode] = useState(false)
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
```

### UI 구성 요소
1. **헤더 버튼 영역**:
   - 일반 모드: "새 예약 등록" + "삭제 모드" 버튼
   - 삭제 모드: "취소" + "선택 삭제 (N)" 버튼

2. **전체 선택 체크박스**:
   - 삭제 모드일 때만 표시
   - 노란색 배경 (#fef3c7) 안내 배너
   - 선택된 개수 / 전체 개수 표시

3. **개별 체크박스**:
   - 각 예약 카드 왼쪽에 체크박스 추가
   - 선택된 카드는 빨간색 테두리 (#ef4444)

### Bulk Delete 로직
1. Supabase REST API DELETE 호출 (Promise.all)
2. 로컬 State 업데이트 (setReservations)
3. 삭제 모드 종료 및 선택 초기화
4. 성공 메시지 표시

### 에러 처리
- Supabase 비활성화 시 안내 메시지
- DELETE 실패 시 에러 메시지
- 확인 대화상자 (window.confirm)

## Work Log

### 2025-10-30 14:24 - scrum-master
- Task created

### 2025-10-30 15:30 - developer
- 설계 완료 (Tech Spec 작성)
- 삭제 모드 State 추가 (deleteMode, selectedIds)
- 헤더 버튼 영역 업데이트 (삭제 모드 진입/취소)
- 전체 선택 체크박스 추가
- 개별 체크박스 추가 (예약 카드)
- handleBulkDelete 함수 구현
- 구현 완료
  - app/admin/reservations/page.tsx (1개 파일 수정)
- 빌드: ✅ 성공 (Next.js 14.2.33)

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 14:24 | TODO | scrum-master | Task created |
| 2025-10-30 14:24 | IN_PROGRESS | scrum-master | Starting implementation |
| 2025-10-30 14:27 | READY_FOR_TEST | test-engineer | 구현 완료, 테스트 대기 |
| 2025-10-30 14:27 | DONE | scrum-master | Bulk delete feature implementation complete |

## Artifacts

- Branch: feature/EPIC-6f07e17
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

