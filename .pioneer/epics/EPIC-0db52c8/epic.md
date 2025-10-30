---
id: EPIC-0db52c8
title: Pioneer CLI 스크립트 사용법 문서화
type: epic
status: DONE
priority: medium
created: 2025-10-30T08:43:22Z
updated: 2025-10-30T09:40:49Z
branch: "feature/EPIC-0db52c8"
pr_url: "https://github.com/pioncorp/api-monorepo-starter/pull/34"
---

# Epic: Pioneer CLI 스크립트 사용법 문서화

## Description

**Hybrid Approach**: Claude Code Skills + CLI Scripts 통합으로 최상의 사용자 경험 제공

**Doctor 검토 결과**:
- Skills: 최고의 UX (자동 완성, 문맥 인식)
- Scripts: 최고의 DX (CI/CD, 자동화, 테스트)
- Hybrid: 두 장점 모두 활용 (Skills는 Scripts를 호출)

**구현 계획**:

**Phase 1: Documentation** (P0)
- `.pioneer/workflow/cli-reference.md` 생성 (워크플로우 중심)
- `CLAUDE.md`에 Skills 섹션 추가
- `.pioneer/scripts/README.md`는 기술 레퍼런스로 유지

**Phase 2: Claude Code Skills** (P1)
- `epic-management` - Epic 관리 (자동 호출)
- `task-management` - Task 관리 (자동 호출)
- `start-epic` - Epic 시작 워크플로우 (자동 호출)
- `health-check` - Claude Code 구조 검사 (자동 호출)

## Acceptance Criteria

**Phase 1 (Documentation)**:
- [ ] `.pioneer/workflow/cli-reference.md` 생성 (워크플로우 중심, ~200-300줄)
- [ ] `CLAUDE.md`에 "🔧 CLI 도구" 섹션 추가
- [ ] `.pioneer/scripts/README.md` 생성 (기술 레퍼런스, 전체 명령어)

**Phase 2 (Skills)**:
- [x] `.claude/skills/epic-management/SKILL.md` 생성
- [x] `.claude/skills/task-management/SKILL.md` 생성
- [x] `.claude/skills/start-epic/SKILL.md` 생성
- [x] `.claude/skills/health-check/SKILL.md` 생성

**검증**:
- [ ] Skills가 Scripts를 올바르게 호출
- [ ] 문서 링크 일관성 유지
- [ ] `/help`에서 Skills 목록 확인 가능

## Tasks

(Tasks will be added by Scrum Master)

**Total**: 0/0 Tasks (0%)

## Checklist

- [ ] All Tasks completed (CANCELLED excluded)
- [ ] Build succeeded
- [ ] All tests passed
- [ ] PR created
- [ ] Code reviewed and approved
- [ ] PR merged to main

