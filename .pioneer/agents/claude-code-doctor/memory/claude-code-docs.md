# Claude Code 공식 문서 참조

> 항상 최신 Claude Code 규격을 숙지하고 개선 행동에 반영하세요.

## Claude Code 문서 맵

**문서 맵 URL**: https://docs.claude.com/en/docs/claude-code/claude_code_docs_map.md

이 문서는 모든 Claude Code 관련 문서의 목록과 링크를 제공합니다. 작업 전 반드시 확인하세요.

## 핵심 문서 카테고리

### 1. Build with Claude Code (확장 기능)

Claude Code 기능을 확장하고 커스터마이징하는 핵심 문서:

- **[Sub-agents](https://docs.claude.com/en/docs/claude-code/sub-agents.md)**
  - 특화된 에이전트 구성 및 관리
  - 자동 위임 vs 명시적 호출
  - 도구 권한 제어

- **[Plugins](https://docs.claude.com/en/docs/claude-code/plugins.md)**
  - 플러그인 개발 및 팀 워크플로우 설정
  - 매니페스트 스키마

- **[Skills](https://docs.claude.com/en/docs/claude-code/skills.md)**
  - 에이전트 스킬 작성, 테스트, 공유
  - 재사용 가능한 기능 모듈

- **[Hooks Guide](https://docs.claude.com/en/docs/claude-code/hooks-guide.md)**
  - 세션 이벤트 훅 구성
  - 동작 자동화

### 2. Configuration (설정 및 커스터마이징)

- **[Settings](https://docs.claude.com/en/docs/claude-code/settings.md)**
  - 설정 파일 및 환경 변수 관리

- **[Slash Commands](https://docs.claude.com/en/docs/claude-code/slash-commands.md)**
  - 커스텀 슬래시 명령어 생성

- **[Memory](https://docs.claude.com/en/docs/claude-code/memory.md)**
  - 프로젝트 및 조직 수준 메모리 설정

### 3. Reference (개발 참고 자료)

- **[Plugins Reference](https://docs.claude.com/en/docs/claude-code/plugins-reference.md)**
  - 플러그인 매니페스트 스키마 및 구조

- **[Hooks](https://docs.claude.com/en/docs/claude-code/hooks.md)**
  - 훅 이벤트, 입출력 형식, 구현 예제

## 작업 전 체크리스트

Claude Code Doctor로서 작업 수행 전 다음을 확인하세요:

### 서브에이전트 작업 시

1. [ ] [Sub-agents 공식 문서](https://docs.claude.com/en/docs/claude-code/sub-agents.md) 확인
2. [ ] YAML 프론트매터 필수 필드 (`name`, `description`) 확인
3. [ ] 도구 권한 최소화 원칙 적용
4. [ ] 자동 위임 최적화 (description에 "PROACTIVELY" 추가)
5. [ ] 프로젝트 에이전트를 `.claude/agents/`에 저장

### 슬래시 커맨드 작업 시

1. [ ] [Slash Commands 공식 문서](https://docs.claude.com/en/docs/claude-code/slash-commands.md) 확인
2. [ ] Bash 실행 시 `allowed-tools: Bash` 필수 확인
3. [ ] 인자 사용 방법 (`$ARGUMENTS`, `$1`, `$2`) 확인
4. [ ] 파일 참조 (`@`) 사용법 확인
5. [ ] 네임스페이싱 활용 검토

### 메모리 파일 작업 시

1. [ ] [Memory 공식 문서](https://docs.claude.com/en/docs/claude-code/memory.md) 확인
2. [ ] 메모리 계층 구조 (엔터프라이즈 > 프로젝트 > 사용자 > 로컬) 이해
3. [ ] Import 구문 (`@path/to/file`) 사용법 확인
4. [ ] 재귀 깊이 제한 (최대 5단계) 준수
5. [ ] 순환 참조 방지

### Health Check 수행 시

1. [ ] [문서 맵](https://docs.claude.com/en/docs/claude-code/claude_code_docs_map.md) 확인하여 최신 규격 반영
2. [ ] 모든 베스트 프랙티스 적용 여부 검증
3. [ ] 공식 문서와 현재 구조 비교
4. [ ] 개선 제안 시 공식 문서 근거 제시

## 문서 업데이트 확인

Claude Code는 지속적으로 업데이트됩니다. 작업 전 최신 문서를 확인하세요:

### WebFetch 도구 사용

```markdown
작업 시작 전, 다음 문서를 WebFetch로 확인:

- https://docs.claude.com/en/docs/claude-code/claude_code_docs_map.md
- https://docs.claude.com/en/docs/claude-code/sub-agents.md
- https://docs.claude.com/en/docs/claude-code/slash-commands.md
- https://docs.claude.com/en/docs/claude-code/memory.md
```

### 변경 사항 추적

새로운 기능이나 규격 변경 발견 시:

1. 현재 메모리 파일 업데이트
2. 영향받는 에이전트/커맨드 수정
3. Health Check 재실행
4. 변경 로그 작성

## 베스트 프랙티스 요약

### 공식 문서 기반 원칙

1. **규격 준수**
   - 모든 작업은 공식 문서 규격에 따라 수행
   - 추측하지 말고 문서 확인

2. **최신 정보 유지**
   - 작업 전 WebFetch로 최신 문서 확인
   - 문서 맵에서 관련 문서 링크 탐색

3. **근거 제시**
   - 개선 제안 시 공식 문서 URL 명시
   - 변경 이유를 공식 베스트 프랙티스와 연결

4. **일관성 유지**
   - 프로젝트 내 모든 에이전트/커맨드에 동일한 규격 적용
   - 문서화 스타일 통일

## 자주 참조하는 문서

### 서브에이전트 개발

```
https://docs.claude.com/en/docs/claude-code/sub-agents.md
```

**핵심 내용**:
- YAML 프론트매터 구조
- 도구 권한 제어
- 자동 위임 메커니즘
- 모델 선택 가이드

### 슬래시 커맨드 개발

```
https://docs.claude.com/en/docs/claude-code/slash-commands.md
```

**핵심 내용**:
- 기본 구조 및 저장 위치
- 인자 및 파일 참조
- Bash 실행 권한
- 네임스페이싱

### 메모리 관리

```
https://docs.claude.com/en/docs/claude-code/memory.md
```

**핵심 내용**:
- 계층적 메모리 구조
- Import 구문 및 재귀
- 메모리 관리 명령어

### 플러그인 개발

```
https://docs.claude.com/en/docs/claude-code/plugins.md
https://docs.claude.com/en/docs/claude-code/plugins-reference.md
```

**핵심 내용**:
- 플러그인 매니페스트
- 팀 워크플로우 통합

### 훅 시스템

```
https://docs.claude.com/en/docs/claude-code/hooks-guide.md
https://docs.claude.com/en/docs/claude-code/hooks.md
```

**핵심 내용**:
- 이벤트 훅 구성
- 입출력 형식
- 자동화 예제

## 문서 활용 워크플로우

### 1. 작업 요청 접수

```
사용자: "새 에이전트를 만들어주세요"
```

### 2. 관련 문서 확인

```markdown
WebFetch를 사용하여 최신 문서 확인:
- https://docs.claude.com/en/docs/claude-code/sub-agents.md
```

### 3. 규격에 따라 작업 수행

```markdown
공식 문서 기준:
- name: 소문자 + 하이픈
- description: 호출 시점 명확히 기술
- tools: 필요한 도구만 명시
```

### 4. 결과 검증

```markdown
Health Check 수행:
- YAML 프론트매터 검증
- 공식 베스트 프랙티스 적용 여부 확인
```

### 5. 문서 근거 제공

```markdown
생성 완료 보고:
- 에이전트 구조는 공식 문서 규격 준수
- 참고: https://docs.claude.com/en/docs/claude-code/sub-agents.md
```

## 개선 행동 원칙

### 항상 최신 문서 기반

```markdown
# ❌ 추측하지 마세요
"아마도 이렇게 하면 될 것 같습니다"

# ✅ 문서 확인하세요
"공식 문서(https://...)에 따르면, 다음과 같이 해야 합니다"
```

### 변경 사항 추적

```markdown
새로운 기능 발견 시:

1. 메모리 파일 업데이트
2. 영향받는 파일 수정
3. Health Check 재실행
4. 팀에 공유 (문서화)
```

### 지속적 개선

```markdown
정기적으로:

1. 문서 맵 확인
2. 새로운 베스트 프랙티스 발견
3. 현재 구조에 적용
4. Health Check로 검증
```

## 참고

Claude Code Doctor는 **항상** 공식 문서를 숙지하고, 최신 규격을 프로젝트에 반영하는 것이 핵심 책임입니다.

작업 전 문서 확인을 습관화하세요.
