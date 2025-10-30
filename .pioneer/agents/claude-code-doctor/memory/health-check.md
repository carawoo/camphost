# Claude Code Health Check 체크리스트

## 개요

`.claude` 및 `.pioneer` 구조를 검증하고 Claude Code 규격 준수 여부를 확인하는 체크리스트입니다.

## 1. 디렉토리 구조 검증

### 1.1 기본 디렉토리 존재

```bash
# 필수 디렉토리 확인
[ -d ".claude" ] && echo "✅ .claude" || echo "❌ .claude missing"
[ -d ".claude/agents" ] && echo "✅ .claude/agents" || echo "❌ .claude/agents missing"
[ -d ".pioneer" ] && echo "✅ .pioneer" || echo "❌ .pioneer missing"
[ -d ".pioneer/agents" ] && echo "✅ .pioneer/agents" || echo "❌ .pioneer/agents missing"
[ -d ".pioneer/workflow" ] && echo "✅ .pioneer/workflow" || echo "❌ .pioneer/workflow missing"
[ -d ".pioneer/epics" ] && echo "✅ .pioneer/epics" || echo "❌ .pioneer/epics missing"
[ -d ".pioneer/scripts" ] && echo "✅ .pioneer/scripts" || echo "❌ .pioneer/scripts missing"
```

### 1.2 선택적 디렉토리

```bash
# 선택적 디렉토리
[ -d ".claude/commands" ] && echo "✅ .claude/commands" || echo "⚪ .claude/commands (optional)"
[ -f ".claude/CLAUDE.md" ] || [ -f "./CLAUDE.md" ] && echo "✅ Project memory" || echo "⚪ Project memory (optional)"
```

## 2. 서브에이전트 검증

### 2.1 에이전트 파일 존재

```bash
# 모든 에이전트 파일 찾기
find .claude/agents -name "*.md" -type f
```

**최소 요구사항**:
- [ ] developer.md
- [ ] test-engineer.md
- [ ] scrum-master.md

### 2.2 YAML 프론트매터 검증

각 에이전트 파일에 대해:

```bash
# YAML 프론트매터 추출 및 검증
for file in .claude/agents/*.md; do
  echo "Checking: $file"

  # YAML 추출
  yaml=$(sed -n '/^---$/,/^---$/p' "$file")

  # 필수 필드 확인
  echo "$yaml" | grep -q "^name:" && echo "✅ name" || echo "❌ name missing"
  echo "$yaml" | grep -q "^description:" && echo "✅ description" || echo "❌ description missing"
done
```

**체크리스트** (각 에이전트):
- [ ] YAML 프론트매터 존재 (`---` ... `---`)
- [ ] `name` 필드: 소문자 + 하이픈만 사용
- [ ] `description` 필드: 명확한 호출 시점 설명
- [ ] `tools` 필드: 유효한 도구 목록 (선택)
- [ ] `model` 필드: sonnet|opus|haiku|inherit (선택)

### 2.3 에이전트 이름 규칙

```bash
# 에이전트 이름 검증 (소문자 + 하이픈)
for file in .claude/agents/*.md; do
  name=$(basename "$file" .md)

  if [[ "$name" =~ ^[a-z][a-z0-9-]*$ ]]; then
    echo "✅ $name"
  else
    echo "❌ $name (invalid: use lowercase + hyphens only)"
  fi
done
```

### 2.4 프롬프트 내용 검증

각 에이전트 파일에 대해:

- [ ] 역할 정의 명확
- [ ] "작업 시작 전 필수 단계" 섹션 존재
- [ ] Workflow 문서 참조 (`.pioneer/agents/{name}/workflow.md`)
- [ ] Memory 폴더 참조 (`.pioneer/agents/{name}/memory/`)
- [ ] "핵심 책임" 또는 "작업 프로세스" 섹션 존재
- [ ] "제약사항" 섹션 존재
- [ ] Git 커밋 금지 명시 (Scrum Master 제외)

## 3. 워크플로우 문서 검증

### 3.1 에이전트별 워크플로우 존재

```bash
# 각 에이전트의 workflow.md 확인
for agent in .claude/agents/*.md; do
  name=$(basename "$agent" .md)

  if [ -f ".pioneer/agents/$name/workflow.md" ]; then
    echo "✅ .pioneer/agents/$name/workflow.md"
  else
    echo "❌ .pioneer/agents/$name/workflow.md missing"
  fi
done
```

### 3.2 워크플로우 내용 검증

각 `workflow.md` 파일에 대해:

- [ ] YAML 프론트매터 존재 (에이전트 정의 복사)
- [ ] "핵심 역할" 섹션
- [ ] "작업 프로세스" 섹션 (단계별)
- [ ] "중요 규칙" 섹션
- [ ] "제약사항" 섹션
- [ ] "출력 형식" 섹션
- [ ] "참고 문서" 섹션
- [ ] "예시 시나리오" 섹션

## 4. 메모리 파일 검증

### 4.1 에이전트별 메모리 디렉토리

```bash
# 각 에이전트의 memory/ 디렉토리 확인
for agent in .claude/agents/*.md; do
  name=$(basename "$agent" .md)

  if [ -d ".pioneer/agents/$name/memory" ]; then
    echo "✅ .pioneer/agents/$name/memory/"

    # 메모리 파일 개수
    count=$(find ".pioneer/agents/$name/memory" -name "*.md" -type f | wc -l)
    echo "   Files: $count"
  else
    echo "❌ .pioneer/agents/$name/memory/ missing"
  fi
done
```

### 4.2 프로젝트 메모리 파일

```bash
# 프로젝트 메모리 확인
if [ -f "./CLAUDE.md" ]; then
  echo "✅ ./CLAUDE.md"
elif [ -f "./.claude/CLAUDE.md" ]; then
  echo "✅ ./.claude/CLAUDE.md"
else
  echo "⚪ Project memory (optional)"
fi
```

### 4.3 메모리 Import 검증

```bash
# Import 구문 검증
find .pioneer/agents -path "*/memory/*.md" -type f | while read file; do
  echo "Checking: $file"

  # @ 구문 찾기
  imports=$(grep -E '^@' "$file" || true)

  if [ -n "$imports" ]; then
    echo "  Imports found:"
    echo "$imports" | while read import; do
      path="${import#@}"  # @ 제거

      # 상대 경로 해석 (간단 검증)
      if [ -f "$path" ]; then
        echo "    ✅ $import"
      else
        echo "    ⚠️ $import (file not found or relative path)"
      fi
    done
  fi
done
```

**체크리스트**:
- [ ] Import 구문 형식: `@path/to/file`
- [ ] 재귀 깊이 5단계 이하
- [ ] 순환 참조 없음
- [ ] 경로 유효성

## 5. 슬래시 커맨드 검증

### 5.1 커맨드 파일 존재

```bash
# 슬래시 커맨드 찾기
if [ -d ".claude/commands" ]; then
  find .claude/commands -name "*.md" -type f
else
  echo "⚪ No slash commands found (optional)"
fi
```

### 5.2 커맨드 파일 검증

각 커맨드 파일에 대해:

```bash
for cmd in .claude/commands/**/*.md; do
  echo "Checking: $cmd"

  # YAML 프론트매터 (선택)
  if grep -q "^---$" "$cmd"; then
    echo "  ✅ YAML frontmatter present"

    # allowed-tools 확인 (Bash 실행 시 필수)
    if grep -q "^!" "$cmd"; then
      if grep -q "allowed-tools:.*Bash" "$cmd"; then
        echo "  ✅ Bash in allowed-tools"
      else
        echo "  ❌ Bash execution found but not in allowed-tools"
      fi
    fi
  fi

  # 인자 사용 확인
  if grep -q '\$ARGUMENTS\|\$[0-9]' "$cmd"; then
    echo "  ✅ Arguments used"
  fi
done
```

**체크리스트**:
- [ ] YAML 프론트매터 형식 (선택)
- [ ] `description` 필드 (권장)
- [ ] `allowed-tools` 필드: Bash 실행 시 필수
- [ ] 인자 사용: `$ARGUMENTS`, `$1`, `$2` 등
- [ ] 파일 참조: `@` 접두사

## 6. 스크립트 실행 권한

### 6.1 Pioneer 스크립트

```bash
# 실행 권한 확인
[ -x ".pioneer/scripts/epic-manager.sh" ] && echo "✅ epic-manager.sh" || echo "❌ epic-manager.sh (not executable)"
[ -x ".pioneer/scripts/task-manager.sh" ] && echo "✅ task-manager.sh" || echo "❌ task-manager.sh (not executable)"
```

### 6.2 권한 수정

```bash
# 권한 부여
chmod +x .pioneer/scripts/*.sh
```

## 7. 일관성 검증

### 7.1 에이전트 정의 vs 워크플로우 동기화

```bash
# 에이전트 정의와 워크플로우의 name, description이 일치하는지 확인
for agent in .claude/agents/*.md; do
  name=$(basename "$agent" .md)
  workflow=".pioneer/agents/$name/workflow.md"

  if [ -f "$workflow" ]; then
    # name 필드 비교
    agent_name=$(grep "^name:" "$agent" | head -1)
    workflow_name=$(grep "^name:" "$workflow" | head -1)

    if [ "$agent_name" = "$workflow_name" ]; then
      echo "✅ $name: name field matches"
    else
      echo "❌ $name: name field mismatch"
      echo "   Agent:    $agent_name"
      echo "   Workflow: $workflow_name"
    fi
  fi
done
```

### 7.2 에이전트 간 책임 중복 검사

**수동 검토 항목**:
- [ ] 각 에이전트의 "핵심 책임"이 중복되지 않음
- [ ] Git 커밋은 Scrum Master만 수행
- [ ] 테스트 작성은 Test Engineer만 수행
- [ ] 코드 구현은 Developer만 수행

## 8. 베스트 프랙티스 검증

### 8.1 도구 권한 최소화

```bash
# tools 필드가 생략된 에이전트 찾기 (보안 위험)
for agent in .claude/agents/*.md; do
  if ! grep -q "^tools:" "$agent"; then
    echo "⚠️ $(basename "$agent" .md): no tools specified (inherits all tools)"
  fi
done
```

**권장**:
- [ ] 모든 에이전트에 `tools` 필드 명시 (필요한 도구만)
- [ ] 읽기 전용 에이전트: `Read, Glob, Grep`만
- [ ] 분석 에이전트: `Read, Grep, WebFetch`만

### 8.2 모델 선택

```bash
# model 필드 확인
for agent in .claude/agents/*.md; do
  model=$(grep "^model:" "$agent" | awk '{print $2}')

  if [ -z "$model" ]; then
    echo "⚪ $(basename "$agent" .md): model not specified (uses default)"
  else
    echo "✅ $(basename "$agent" .md): model=$model"
  fi
done
```

**권장**:
- [ ] 단순 작업: `model: haiku`
- [ ] 일반 작업: `model: inherit`
- [ ] 복잡한 작업: `model: opus`

### 8.3 자동 위임 최적화

```bash
# description에 "PROACTIVELY" 또는 "반드시" 포함 여부
for agent in .claude/agents/*.md; do
  desc=$(grep "^description:" "$agent")

  if echo "$desc" | grep -qi "PROACTIVELY\|반드시"; then
    echo "✅ $(basename "$agent" .md): auto-delegation optimized"
  else
    echo "⚪ $(basename "$agent" .md): consider adding PROACTIVELY/반드시 to description"
  fi
done
```

## 9. 문서화 품질

### 9.1 코드 예시 포함

각 메모리 파일에 대해:

- [ ] 코드 예시 존재
- [ ] 올바른 예시 (✅) / 잘못된 예시 (❌) 구분
- [ ] 이유 설명 포함

### 9.2 링크 유효성

```bash
# 마크다운 링크 추출 및 검증 (간단 버전)
find .pioneer -name "*.md" -type f | while read file; do
  # 상대 경로 링크 찾기
  grep -oE '\[.*\]\(\..*\.md\)' "$file" | while read link; do
    path=$(echo "$link" | sed -n 's/.*(\(.*\)).*/\1/p')

    # 링크 검증 (간단 구현)
    echo "  Link: $path in $file"
  done
done
```

## 10. 보고서 형식

### Health Check 완료 후 생성

```markdown
# Claude Code Health Check Report

**검사 일시**: YYYY-MM-DD HH:MM
**검사자**: claude-code-doctor

## 요약

- ✅ 서브에이전트: {count}개 (모두 정상)
- ✅ 슬래시 커맨드: {count}개 (모두 정상)
- ⚠️ 메모리 파일: {count}개 ({issue_count}개 개선 필요)
- ❌ 워크플로우 문서: {count}개 ({missing_count}개 누락)

## 상세 결과

### 서브에이전트

| 이름 | YAML | 워크플로우 | 메모리 | 문제 |
|------|------|-----------|--------|------|
| developer | ✅ | ✅ | ✅ | - |
| test-engineer | ✅ | ✅ | ⚠️ | 메모리 파일 추가 필요 |
| scrum-master | ✅ | ✅ | ✅ | - |

### 슬래시 커맨드

| 커맨드 | YAML | Bash 권한 | 문제 |
|--------|------|-----------|------|
| /optimize | ✅ | N/A | - |
| /review | ✅ | ✅ | - |

### 메모리 파일

| 파일 | Import | 크기 | 문제 |
|------|--------|------|------|
| CLAUDE.md | ✅ | 5KB | - |
| developer/memory/typescript-esm.md | ✅ | 2KB | - |

## 개선 제안

1. {구체적 개선 사항 1}
2. {구체적 개선 사항 2}

## 작업 완료

- [x] 디렉토리 구조 검증
- [x] YAML 프론트매터 검증
- [x] 워크플로우 문서 검증
- [x] 메모리 파일 검증
- [ ] 개선 사항 적용 (다음 단계)
```

## 자동화 스크립트

### 전체 Health Check 실행

```bash
#!/bin/bash
# .pioneer/scripts/health-check.sh

echo "=== Claude Code Health Check ==="
echo ""

# 1. 디렉토리 구조
echo "1. Directory Structure"
[ -d ".claude/agents" ] && echo "  ✅ .claude/agents" || echo "  ❌ .claude/agents"
[ -d ".pioneer/agents" ] && echo "  ✅ .pioneer/agents" || echo "  ❌ .pioneer/agents"
echo ""

# 2. 서브에이전트
echo "2. Subagents"
agent_count=$(find .claude/agents -name "*.md" -type f | wc -l)
echo "  Total: $agent_count"

for agent in .claude/agents/*.md; do
  name=$(basename "$agent" .md)

  # YAML 검증
  if grep -q "^name:" "$agent" && grep -q "^description:" "$agent"; then
    yaml_status="✅"
  else
    yaml_status="❌"
  fi

  # 워크플로우 검증
  if [ -f ".pioneer/agents/$name/workflow.md" ]; then
    workflow_status="✅"
  else
    workflow_status="❌"
  fi

  # 메모리 검증
  if [ -d ".pioneer/agents/$name/memory" ]; then
    memory_status="✅"
  else
    memory_status="❌"
  fi

  echo "  $name: YAML=$yaml_status Workflow=$workflow_status Memory=$memory_status"
done
echo ""

# 3. 슬래시 커맨드
echo "3. Slash Commands"
if [ -d ".claude/commands" ]; then
  cmd_count=$(find .claude/commands -name "*.md" -type f | wc -l)
  echo "  Total: $cmd_count"
else
  echo "  None found"
fi
echo ""

# 4. 메모리 파일
echo "4. Memory Files"
if [ -f "./CLAUDE.md" ] || [ -f "./.claude/CLAUDE.md" ]; then
  echo "  ✅ Project memory found"
else
  echo "  ⚪ Project memory (optional)"
fi
echo ""

echo "=== Health Check Complete ==="
```

## 참고 문서

- [Sub-agents Structure](./subagent-structure.md)
- [Slash Commands](./slash-commands.md)
- [Memory Management](./memory-management.md)
- [Claude Code 문서 맵](https://docs.claude.com/en/docs/claude-code/claude_code_docs_map.md)
