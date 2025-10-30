# 메모리 파일 구조 및 관리

> 참고: https://docs.claude.com/en/docs/claude-code/memory.md

## 개요

Claude Code는 4가지 계층적 메모리 시스템을 제공합니다. 상위 계층이 먼저 로드되며 우선순위를 갖습니다.

## 메모리 계층 구조

| 계층 | 경로 | 범위 | 우선순위 | 사용 목적 |
|------|------|------|---------|----------|
| **1. 엔터프라이즈 정책** | OS별 시스템 경로 | 조직 전체 | **최상위** | 보안, 규정 준수 |
| **2. 프로젝트 메모리** | `./CLAUDE.md` 또는 `./.claude/CLAUDE.md` | 프로젝트 | 상위 | 프로젝트별 규칙 |
| **3. 사용자 메모리** | `~/.claude/CLAUDE.md` | 모든 프로젝트 | 중간 | 개인 선호 설정 |
| **4. 로컬 메모리** | `./CLAUDE.local.md` | 프로젝트 (개인) | **하위** | deprecated |

**로드 순서**: 1 → 2 → 3 → 4 (상위부터)

## 프로젝트 메모리

### 저장 위치 선택

```bash
# 옵션 1: 프로젝트 루트
./CLAUDE.md

# 옵션 2: .claude 디렉토리 내부
./.claude/CLAUDE.md
```

**권장**: `./.claude/CLAUDE.md` (구조화된 관리)

### 기본 구조

```markdown
# Project Instructions

프로젝트 전체에 적용되는 규칙과 지침

## 워크플로우 Import

@.pioneer/workflow/scrum-master-guide.md
@.pioneer/workflow/task-management.md

## 프로젝트 규칙

### Epic/Task 관리
- 1 Epic = 1 Branch
- Scrum Master만 커밋 수행

### 코딩 규칙
- TypeScript ESM: `.js` 확장자 필수
- DI 패턴: `@singleton()`, `@injectable()`

## 추가 Import

@.pioneer/agents/developer/memory/typescript-esm.md
@.pioneer/agents/developer/memory/dependency-injection.md
```

## Import 구문

### 기본 문법

```markdown
@path/to/file
```

**지원 경로**:
- 상대 경로: `@./memory/rules.md`, `@../shared/guide.md`
- 절대 경로: `@/Users/name/project/file.md`

### Import 예시

```markdown
# 상대 경로 import
@./coding-rules.md
@.pioneer/workflow/guide.md

# 절대 경로 import
@/Users/name/.claude/global-rules.md
```

### 재귀 Import

메모리 파일 내에서 다른 파일을 import할 수 있습니다.

**최대 깊이**: 5단계

```markdown
# File: ./CLAUDE.md
@.pioneer/memory/base.md

# File: .pioneer/memory/base.md
@.pioneer/memory/typescript.md

# File: .pioneer/memory/typescript.md
@.pioneer/memory/esm.md

# ... (최대 5단계까지)
```

### 순환 참조 방지

```markdown
# ❌ 순환 참조 발생
# File: a.md
@./b.md

# File: b.md
@./a.md  # 순환!

# ✅ 계층 구조로 해결
# File: base.md
공통 규칙

# File: a.md
@./base.md
A 전용 규칙

# File: b.md
@./base.md
B 전용 규칙
```

## 사용자 메모리

### 저장 위치

```bash
~/.claude/CLAUDE.md
```

### 사용 목적

**개인 선호 설정**:
- 선호하는 코딩 스타일
- 개인 단축키 및 유틸리티
- 모든 프로젝트에 적용할 규칙

**예시**:

```markdown
# My Personal Claude Code Settings

## 선호 코딩 스타일
- 들여쓰기: 2 spaces
- 따옴표: single quotes
- 세미콜론: 생략

## 공통 규칙
- 주석은 한글로 작성
- 에러 메시지는 영어로 작성
```

## 에이전트별 메모리

### 디렉토리 구조

```bash
.pioneer/agents/{agent-name}/memory/
├── topic1.md
├── topic2.md
└── topic3.md
```

### 명명 규칙

**주제별 파일 분리**:
```bash
.pioneer/agents/developer/memory/
├── typescript-esm.md           # TypeScript ESM 규칙
├── dependency-injection.md     # DI 패턴
├── coding-rules.md             # 코딩 스타일
├── monorepo.md                 # Monorepo 구조
└── build-system.md             # 빌드 시스템
```

### 에이전트 프롬프트에서 참조

```markdown
# Developer Agent

## 작업 시작 전 필수 단계

**2단계**: Memory 폴더의 모든 문서 확인
```bash
.pioneer/agents/developer/memory/*.md
```

**작업 방식**:
1. Glob으로 memory 폴더의 모든 `.md` 파일 찾기
2. 파일명을 보고 현재 Task에 관련된 문서 파악
3. 관련 문서들을 Read 도구로 읽어서 규칙 확인
4. 규칙을 따라 작업 수행
```

## 메모리 관리 명령어

### 빠른 추가

입력을 `#` 문자로 시작하면 메모리에 직접 추가됩니다.

```
# Remember: Always use single quotes for strings
```

### 메모리 편집

```bash
/memory
```

시스템 에디터에서 메모리 파일을 엽니다.

### 메모리 확인

```bash
/memory
```

현재 로드된 메모리 내용을 확인합니다.

## 초기화

### 프로젝트 초기화

```bash
/init
```

프로젝트 메모리를 부트스트랩합니다.

## 실전 예시

### 예시 1: Pioneer 프로젝트 메모리

**파일**: `./.claude/CLAUDE.md`

```markdown
# Pioneer Development Kit (PDK)

> Epic-Driven Multi-Agent Development System

## 최우선 규칙

### 1 Epic = 1 Branch

```
Epic 시작 → 브랜치 1개 생성 → 모든 Task 순차 또는 병렬 작업 → Epic 완료
```

## 워크플로우 참조

@.pioneer/workflow/scrum-master-guide.md
@.pioneer/workflow/task-management.md
@.pioneer/workflow/task-status-workflow.md
@.pioneer/workflow/task-types.md

## 에이전트 역할

| 에이전트 | 역할 | 호출 시점 |
|---------|------|---------|
| Developer | 설계 + 구현 | Task 생성 후 |
| Test Engineer | 테스트 작성 | 구현 완료 후 |
| Scrum Master | 커밋 생성 | Task 완료 시 |

## Git 규칙

- ❌ Developer/Test Engineer는 Git 커밋 금지
- ✅ Scrum Master만 모든 커밋 수행
```

### 예시 2: Developer 에이전트 메모리

**디렉토리**: `.pioneer/agents/developer/memory/`

**파일 1**: `typescript-esm.md`
```markdown
# TypeScript ESM 규칙

## Import 확장자

상대 경로 import 시 `.js` 확장자 필수:

```typescript
// ✅ 올바른 예시
import { Foo } from './foo.js';
import type { Bar } from '../types/bar.js';

// ❌ 잘못된 예시
import { Foo } from './foo';
import type { Bar } from '../types/bar';
```

## 이유

TypeScript는 컴파일 시 import 경로를 수정하지 않으므로, 런타임에서 `.js` 파일을 찾을 수 있도록 명시적으로 작성해야 합니다.
```

**파일 2**: `dependency-injection.md`
```markdown
# Dependency Injection 패턴

## TSyringe 사용

```typescript
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class EmailService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.child('EmailService');
  }
}
```

## 규칙

1. **@singleton()**: 애플리케이션 전체에서 하나의 인스턴스만 생성
2. **@injectable()**: DI 컨테이너에서 주입 가능하도록 표시
3. **생성자 주입**: 의존성을 생성자 파라미터로 받음
```

### 예시 3: 계층적 메모리 구조

**파일**: `./.claude/CLAUDE.md` (프로젝트)
```markdown
# Project Memory

@./memory/base-rules.md
@./memory/project-specific.md
```

**파일**: `./.claude/memory/base-rules.md`
```markdown
# Base Rules

@./typescript.md
@./testing.md
@./git.md
```

**파일**: `./.claude/memory/typescript.md`
```markdown
# TypeScript Rules

## 타입 정의
- `any` 사용 금지
- 모든 함수에 반환 타입 명시
```

**파일**: `./.claude/memory/project-specific.md`
```markdown
# Project Specific Rules

## API 규칙
- RESTful API 사용
- `/api/v1` prefix
```

## 모범 사례

### 1. 계층 구조 활용

```markdown
# ✅ 좋은 예시: 계층적 구조
./CLAUDE.md
  ├── @./memory/base.md
  │     ├── @./memory/typescript.md
  │     └── @./memory/testing.md
  └── @./memory/project-specific.md

# ❌ 나쁜 예시: 평면 구조
./CLAUDE.md
  ├── @./memory/typescript-rule-1.md
  ├── @./memory/typescript-rule-2.md
  ├── @./memory/testing-rule-1.md
  ├── @./memory/testing-rule-2.md
  └── ... (많은 파일)
```

### 2. 주제별 파일 분리

```bash
# ✅ 주제별 명확한 분리
memory/
├── typescript-esm.md
├── dependency-injection.md
├── testing-strategy.md
└── git-workflow.md

# ❌ 모든 내용을 하나의 파일에
memory/
└── all-rules.md  # 1000+ 줄
```

### 3. Import 순서

```markdown
# ✅ 공통 규칙 먼저, 구체적인 규칙 나중에
@./base-rules.md           # 공통
@./typescript-rules.md     # 언어별
@./project-specific.md     # 프로젝트별

# 이렇게 하면 구체적인 규칙이 공통 규칙을 덮어씁니다
```

### 4. 에이전트별 메모리 독립성

```bash
# ✅ 각 에이전트가 자신의 메모리만 관리
.pioneer/agents/
├── developer/memory/
│   ├── typescript-esm.md
│   └── dependency-injection.md
├── test-engineer/memory/
│   └── testing-strategy.md
└── scrum-master/memory/
    ├── epic-branch-rule.md
    └── commit-message-rule.md

# ❌ 공유 메모리로 혼란 발생
.pioneer/shared-memory/
└── all-rules.md  # 모든 에이전트가 참조
```

### 5. 버전 관리

```bash
# ✅ 프로젝트 메모리를 Git에 포함
git add .claude/CLAUDE.md
git add .pioneer/agents/*/memory/

# ❌ 로컬 메모리를 Git에 포함
git add CLAUDE.local.md  # deprecated, 개인용
```

## 주의사항

### 재귀 깊이 제한

```markdown
# ⚠️ 5단계 이상은 로드되지 않음
./CLAUDE.md
  @./a.md
    @./b.md
      @./c.md
        @./d.md
          @./e.md
            @./f.md  # ❌ 6단계, 로드 실패
```

### 상대 경로 기준

```markdown
# Import는 파일이 위치한 디렉토리 기준

# File: ./.claude/CLAUDE.md
@../memory/rules.md  # ./.claude/../memory/rules.md = ./memory/rules.md

# File: ./.claude/agents/developer.md
@../../memory/rules.md  # ./.claude/agents/../../memory/rules.md = ./memory/rules.md
```

### 메모리 크기

- **권장**: 전체 메모리 50KB 이하
- 너무 큰 메모리는 컨텍스트를 과도하게 소비
- 필요한 정보만 선별적으로 포함

## 디버깅

### 메모리 로드 확인

```bash
/memory
```

현재 로드된 메모리를 확인하여 import가 올바르게 동작하는지 검증합니다.

### Import 경로 오류

```markdown
# ❌ 파일을 찾을 수 없음
@./non-existent-file.md

# 해결: 경로 확인
ls -la .claude/memory/
```

### 순환 참조 감지

```bash
# 수동으로 import 체인 추적
# File: a.md imports b.md
# File: b.md imports c.md
# File: c.md imports a.md  # 순환!
```

## 마이그레이션

### CLAUDE.local.md (deprecated)

```bash
# CLAUDE.local.md는 deprecated
# CLAUDE.md로 마이그레이션

mv ./CLAUDE.local.md ./.claude/CLAUDE.md
```

### 기존 프로젝트에 메모리 추가

```bash
# 1. 디렉토리 생성
mkdir -p .claude/memory

# 2. 메모리 파일 작성
cat > .claude/CLAUDE.md <<EOF
# Project Memory

@./memory/coding-rules.md
@./memory/workflow.md
EOF

# 3. 세부 메모리 파일 작성
cat > .claude/memory/coding-rules.md <<EOF
# Coding Rules

- TypeScript ESM
- DI Pattern
EOF
```

## 참고 문서

- [Claude Code Memory 공식 문서](https://docs.claude.com/en/docs/claude-code/memory.md)
- [Claude Code 문서 맵](https://docs.claude.com/en/docs/claude-code/claude_code_docs_map.md)
