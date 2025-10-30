---
name: health-check
description: Verify Claude Code project structure integrity including .claude/ and .pioneer/ directories, subagents, skills, memory files, workflow docs, and Epic/Task structures. Use when user asks to check project health, validate setup, or diagnose structure issues. Triggers include "health check", "verify structure", "check setup", "validate claude code", "diagnose issues".
allowed-tools: Bash, Read, Glob
---

# Claude Code 상태 점검

다음을 포함한 Claude Code 구조의 종합적인 상태 점검을 수행합니다:
- `.claude/` 디렉토리 구조
- `.pioneer/` 디렉토리 구조
- Subagent 정의
- Skills
- Memory 파일
- 워크플로우 문서

## 사용 시점

Claude가 다음과 같은 사용자 의도를 감지하면 자동으로 이 Skill을 호출합니다:
- "상태 점검 해줘"
- "Claude Code 구조 검증해줘"
- "프로젝트 셋업 문제 있는지 봐줘"
- "Pioneer 구조 확인해줘"
- "health check 실행해줘"

## 점검 항목

### .claude/ 디렉토리
- ✅ Subagent 정의 파일 (`.claude/agents/*.md`)
- ✅ YAML frontmatter 검증
- ✅ Tool 권한
- ✅ Model 구성

### .pioneer/ 디렉토리
- ✅ 워크플로우 문서 (`.pioneer/workflow/*.md`)
- ✅ Agent 문서 (`.pioneer/agents/*/workflow.md`)
- ✅ Memory 파일 (`.pioneer/agents/*/memory/*.md`)
- ✅ Epic 구조 (`.pioneer/epics/EPIC-*/`)
- ✅ Task 구조 (`.pioneer/epics/EPIC-*/tasks/TASK-*.md`)
- ✅ 스크립트 (`.pioneer/scripts/*.sh`)

### Skills
- ✅ Skill 파일 (`.claude/skills/*/SKILL.md`)
- ✅ YAML frontmatter
- ✅ 허용된 도구
- ✅ 파일 참조
- ✅ Bash 실행 문법

### Memory 파일
- ✅ Import 구조
- ✅ 재귀 깊이
- ✅ 파일 참조 유효성
- ✅ 콘텐츠 완전성

## 실행

claude-code-doctor subagent를 사용하여 .claude 및 .pioneer 디렉토리의 완전한 상태 점검을 수행합니다.

**claude-code-doctor를 위한 지침**:

1. **디렉토리 구조 점검**
   - 필수 디렉토리가 모두 존재하는지 확인
   - 파일 네이밍 규칙 점검
   - 디렉토리 계층 검증

2. **Subagent 검증**
   - 모든 `.claude/agents/*.md` 파일 읽기
   - YAML frontmatter 검증 (name, description, tools, model)
   - Tool 권한이 적절한지 점검
   - 워크플로우 문서 존재 확인

3. **Skills 검증**
   - 모든 `.claude/skills/*/SKILL.md` 파일 읽기
   - YAML frontmatter 검증 (name, description, allowed-tools)
   - Bash 실행 문법 점검 (! 접두사)
   - 파일 참조 확인 (@ 접두사)
   - 인자 처리 테스트 ($ARGUMENTS, $1, $2 등)

4. **Memory 파일 점검**
   - `.pioneer/agents/*/memory/*.md`의 모든 memory 파일 읽기
   - 순환 import 점검
   - import 깊이가 적절한지 확인
   - 파일 참조 검증

5. **워크플로우 문서**
   - 모든 워크플로우 파일 존재 확인:
     - `.pioneer/workflow/scrum-master-guide.md`
     - `.pioneer/workflow/task-management.md`
     - `.pioneer/workflow/task-status-workflow.md`
     - `.pioneer/workflow/task-types.md`
   - Agent 워크플로우 파일 확인:
     - `.pioneer/agents/developer/workflow.md`
     - `.pioneer/agents/test-engineer/workflow.md`
     - `.pioneer/agents/claude-code-doctor/workflow.md`

6. **Epic 및 Task 구조**
   - Epic 파일 구조 점검
   - Task 파일 YAML frontmatter 검증
   - 상태 이력 형식 확인
   - 의존성 형식 점검

7. **스크립트 검증**
   - 스크립트가 실행 가능한지 확인
   - Skills의 스크립트 경로 점검
   - 스크립트 도움말 출력 테스트

8. **보고서 생성**
   - 수행된 점검 요약
   - 발견된 문제 목록 (있는 경우)
   - 개선 권장사항
   - 모범 사례 제안

**보고서 형식**:

```markdown
# Claude Code 상태 점검 보고서

## 요약
- 총 점검 수: N
- 통과: N
- 경고: N
- 오류: N

## .claude/ 디렉토리
- ✅/⚠️/❌ Subagents: [세부 정보]
- ✅/⚠️/❌ Skills: [세부 정보]

## .pioneer/ 디렉토리
- ✅/⚠️/❌ 워크플로우: [세부 정보]
- ✅/⚠️/❌ Agent 문서: [세부 정보]
- ✅/⚠️/❌ Memory 파일: [세부 정보]
- ✅/⚠️/❌ Epics/Tasks: [세부 정보]
- ✅/⚠️/❌ 스크립트: [세부 정보]

## 발견된 문제
1. [문제 설명 및 위치]
2. ...

## 권장사항
1. [권장사항]
2. ...

## 모범 사례
1. [모범 사례 제안]
2. ...
```

## 출력

다음을 보여주는 상세 보고서가 생성됩니다:
- 전반적인 상태
- 발견된 문제 (위치 포함)
- 개선 권장사항
- 따라야 할 모범 사례
