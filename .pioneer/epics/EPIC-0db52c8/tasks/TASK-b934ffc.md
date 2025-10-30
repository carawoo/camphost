---
id: TASK-b934ffc
title: .pioneer/scripts/README.md 작성
type: task
task_type: docs
status: CANCELLED
priority: high
created: 2025-10-30T08:44:14Z
updated: 2025-10-30T08:52:25Z
assignee: scrum-master
epic: EPIC-0db52c8
dependencies: []
---

# TASK-b934ffc: .pioneer/scripts/README.md 작성

## Description

Pioneer CLI 스크립트 (`epic-manager.sh`, `task-manager.sh`)의 종합 사용 가이드 문서를 작성합니다.

## Requirements

- [x] epic-manager.sh 전체 명령어 레퍼런스 작성
- [x] task-manager.sh 전체 명령어 레퍼런스 작성
- [x] 실전 워크플로우 예시 (Epic 생성 → Task 관리 → 완료)
- [x] 트러블슈팅 가이드 포함
- [x] 명령어별 인자 설명 및 예시 제공
- [x] 각 시나리오별 실제 사용 예시 제공

## Tech Spec

### 문서 구조

**파일**: `.pioneer/scripts/README.md`

**목차**:
1. 개요 (CLI 스크립트 소개)
2. epic-manager.sh (전체 명령어 레퍼런스)
3. task-manager.sh (전체 명령어 레퍼런스)
4. 실전 워크플로우 (6가지 시나리오)
5. 트러블슈팅 (8가지 일반적인 문제)

### 주요 내용

**명령어 레퍼런스**:
- 각 명령어별 사용법, 인자, 예시, 출력 형식
- epic-manager.sh: create, update, complete, block, set-branch, set-pr, list, show, help
- task-manager.sh: create, update, complete, reopen, list, show, help

**실전 워크플로우**:
1. 새 Epic 시작 (일반적인 흐름)
2. PR 피드백 반영 (Task Reopen)
3. Test Task 생성 (커버리지 개선)
4. Task 차단 및 해결
5. docs Task (테스트 불필요)
6. chore Task (테스트 필요/불필요 케이스)

**트러블슈팅**:
- Task 상태 업데이트 실패
- Epic 브랜치 설정 누락
- Task reopen 후 Epic 상태 문제
- test Task 중복 생성
- PR body 동기화
- Epic 완료 후 브랜치 삭제
- 스크립트 실행 권한
- Task 의존성 관리

### 참고 문서

- `epic-manager.sh help` 출력
- `task-manager.sh help` 출력
- `.pioneer/workflow/scrum-master-guide.md`
- `.pioneer/workflow/task-types.md`

## Work Log

### 2025-10-30 08:44 - scrum-master
- Task created

### 2025-10-30 (current) - developer
- Tech Spec 작성 완료
- CLI 문서 작성 완료
  - 전체 명령어 레퍼런스 (epic-manager.sh, task-manager.sh)
  - 실전 워크플로우 6가지 시나리오
  - 트러블슈팅 8가지 문제 및 해결책
- 파일 생성: `.pioneer/scripts/README.md`

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 08:44 | TODO | scrum-master | Task created |
| 2025-10-30 08:44 | IN_PROGRESS | developer | CLI 문서 작성 시작 |
| 2025-10-30 08:49 | READY_FOR_COMMIT | scrum-master | CLI 문서 작성 완료 |
| 2025-10-30 08:52 | CANCELLED | scrum-master | Doctor 검토 결과 Hybrid Approach로 전환 |

## Artifacts

- Branch:
- Commit:
- Files Modified:

## Checklist

- [x] Tech spec written (Developer)
- [x] Documentation completed (Developer)
- [x] Build succeeded (N/A - docs task)

