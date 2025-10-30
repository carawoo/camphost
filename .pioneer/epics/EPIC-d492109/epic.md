---
id: EPIC-d492109
title: Service DSL 도입 및 코드 생성 시스템
type: epic
status: DONE
priority: high
created: 2025-10-30T04:48:32Z
updated: 2025-10-30T05:13:06Z
branch: "feature/EPIC-d492109"
pr_url: ""
---

# Epic: Service DSL 도입 및 코드 생성 시스템

## Description

Service 레이어 코드를 선언적 DSL로 정의하고, 이를 기반으로 TypeScript 코드를 생성하는 시스템을 도입합니다.

### 목표
- Service 스펙을 DSL로 작성 (`.service.dsl` 파일)
- DSL 파서 및 코드 생성기 구현
- 기존 `NotificationService`를 DSL로 마이그레이션
- 장기적으로 Scrum Master와 DSL 기반 워크플로우 연동

### DSL 주요 기능
- **선언적 Service 정의**: providers, state, methods
- **Preconditions**: 입력 검증 (require, validate)
- **Effects**: 비즈니스 로직 (log, call provider, state update)
- **Type-safe**: TypeScript 타입 정의 자동 생성

### 범위 (수정됨)
- **현재 Epic**: DSL 스펙 문서 작성 (코드 생성기는 보류)
- Phase 2: DSL 파서 + 코드 생성기 구현
- Phase 3: Scrum Master 워크플로우 연동

## Tasks

- [ ] ~~TASK-dbc665b: DSL 파서 및 AST 정의 [high] - CANCELLED~~
- [ ] ~~TASK-51e80b8: TypeScript 코드 생성기 구현 [high] - CANCELLED~~
- [ ] ~~TASK-aa43918: NotificationService DSL 파일 작성 [medium] - CANCELLED~~
- [ ] ~~TASK-2eb18d2: CLI 도구 및 빌드 스크립트 통합 [medium] - CANCELLED~~
- [x] TASK-1ee0156: DSL 시스템 문서화 [low] - DONE

**Note**: 코드 생성기 구현은 보류하고, DSL 스펙 문서만 먼저 작성

**Total**: 1/5 Tasks (20%)

## Checklist

- [ ] All Tasks completed (CANCELLED excluded)
- [ ] Build succeeded
- [ ] All tests passed
- [ ] PR created
- [ ] Code reviewed and approved
- [ ] PR merged to main

