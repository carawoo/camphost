---
id: EPIC-4f0644f
title: Skills 용어 통일 및 메모리 파일 정리
type: epic
status: DONE
priority: medium
created: 2025-10-30T09:48:51Z
updated: 2025-10-30T09:59:50Z
branch: "feature/EPIC-4f0644f"
pr_url: ""
---

# Epic: Skills 용어 통일 및 메모리 파일 정리

## Description

Doctor 검수 결과 발견된 Skills 마이그레이션 후 남은 용어 통일 작업:

1. **Memory 파일 이름 변경**: `.pioneer/agents/claude-code-doctor/memory/slash-commands.md` → `skills.md`
2. **claude-code-doctor Subagent 설명 업데이트**: "Slash Commands" → "Skills" 용어 통일
3. **health-check memory 파일 업데이트**: Skills 검증 로직 추가

## Acceptance Criteria

- [ ] `slash-commands.md` 파일이 `skills.md`로 변경됨
- [ ] `skills.md` 내용이 최신 Skills 구조 반영
- [ ] `.claude/agents/claude-code-doctor.md` description에서 "Skills" 용어 사용
- [ ] `.pioneer/agents/claude-code-doctor/workflow.md`에서 Skills 검증 프로세스 명시
- [ ] Build 성공
- [ ] 모든 Skills가 정상 작동

## Tasks

(Tasks will be added by Scrum Master)

**Total**: 2/3 Tasks (66%)

## Checklist

- [ ] All Tasks completed (CANCELLED excluded)
- [ ] Build succeeded
- [ ] All tests passed
- [ ] PR created
- [ ] Code reviewed and approved
- [ ] PR merged to main

