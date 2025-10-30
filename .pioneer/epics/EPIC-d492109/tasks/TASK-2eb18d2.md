---
id: TASK-2eb18d2
title: CLI 도구 및 빌드 스크립트 통합
type: task
task_type: feat
status: CANCELLED
priority: medium
created: 2025-10-30T04:49:07Z
updated: 2025-10-30T04:59:58Z
assignee: scrum-master
epic: EPIC-d492109
dependencies: ["TASK-dbc665b", "TASK-51e80b8"]
---

# TASK-2eb18d2: CLI 도구 및 빌드 스크립트 통합

## Description

DSL 파일을 읽어 TypeScript 코드를 생성하는 CLI 도구를 만들고, 빌드 프로세스에 통합합니다.

CLI 도구 요구사항:
- `dsl-gen <input.dsl> --output <output-dir>`
- `.service.dsl` 파일을 읽어 `.service.ts`, `.types.ts` 생성
- watch 모드 지원 (선택)

빌드 통합:
- `package.json`에 `dsl:generate` 스크립트 추가
- `prebuild` 또는 `predev`에서 자동 실행
- monorepo 각 패키지에서 사용 가능하도록 설정

## Requirements

- [ ] CLI 엔트리 포인트 구현 (`src/cli.ts`)
- [ ] 파일 시스템 I/O (DSL 읽기, TS 쓰기)
- [ ] CLI 옵션 파싱 (입력, 출력, watch 등)
- [ ] 에러 핸들링 및 로깅
- [ ] `package.json` 스크립트 추가
- [ ] 빌드 프로세스에 통합 (prebuild)
- [ ] README에 사용법 추가
- [ ] 의존성: TASK-dbc665b (파서), TASK-51e80b8 (코드 생성기)

## Tech Spec

[Tech spec will be added by Developer]

## Work Log

### 2025-10-30 04:49 - scrum-master
- Task created

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 04:49 | TODO | scrum-master | Task created |
| 2025-10-30 04:59 | CANCELLED | scrum-master | 코드 생성기 구현 불필요, 문서 작성만 진행 |

## Artifacts

- Branch:
- Commit:
- Files Modified:

## Checklist

- [ ] Tech spec written (Developer)
- [ ] Code implemented (Developer)
- [ ] Type check passed
- [ ] Lint passed
- [ ] Build succeeded
- [ ] Tests written (Test Engineer)
- [ ] Tests passed

