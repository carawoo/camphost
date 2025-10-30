# Task Types

> Conventional Commits와 동일한 Task Type 시스템

---

## Task Type 목록

| Type | 의미 | 워크플로우 | 예시 |
|------|------|-----------|------|
| `feat` | 새 기능 구현 (테스트 포함) | Developer → Test Engineer | "EmailService 구현" |
| `fix` | 버그 수정 (테스트 포함) | Developer → Test Engineer | "로그인 토큰 만료 버그 수정" |
| `test` | 기존 코드의 테스트 커버리지 개선 | Test Engineer만 | "UserService 커버리지 80% 달성" |
| `refactor` | 리팩토링 (테스트 포함) | Developer → Test Engineer | "DI 패턴 적용" |
| `docs` | 문서 작업만 | Developer (문서 작성) | "API 문서 작성" |
| `style` | 코드 스타일/포맷팅 | Developer만 | "Prettier 설정 적용" |
| `perf` | 성능 개선 (테스트 포함) | Developer → Test Engineer | "쿼리 최적화" |
| `chore` | 빌드, 설정 변경 | 상황별 (아래 참조) | "Vite 설정 업데이트" |

## ⚠️ 매우 중요한 규칙

### 1. 테스트 Task 중복 생성 절대 금지

**❌ 잘못된 예시**:
```bash
# feat Task 생성
.pioneer/scripts/task-manager.sh create "EmailService 구현" high EPIC-abc feat

# ❌ 별도 test Task 생성 (중복!)
.pioneer/scripts/task-manager.sh create "EmailService 테스트" medium EPIC-abc test
```

**✅ 올바른 예시**:
```bash
# feat Task만 생성 (구현 + 테스트 모두 포함)
.pioneer/scripts/task-manager.sh create "EmailService 구현" high EPIC-abc feat
```

### 2. feat/fix/refactor = 구현 + 테스트

- `feat`, `fix`, `refactor` Task는 **구현 코드 + 테스트 코드**를 모두 포함
- Developer가 구현 → Test Engineer가 테스트 작성
- **별도 test Task 생성 금지**

### 3. test Task는 기존 코드에만 사용

`type: test`는 **이미 존재하는 코드의 테스트 커버리지 개선**에만 사용:

**✅ 올바른 사용**:
```bash
# 기존 UserService의 테스트 커버리지가 낮을 때
.pioneer/scripts/task-manager.sh create "UserService 커버리지 80% 달성" medium EPIC-abc test
```

**❌ 잘못된 사용**:
```bash
# 새로 구현하는 기능에 test Task 생성
.pioneer/scripts/task-manager.sh create "새 기능 구현" high EPIC-abc feat
.pioneer/scripts/task-manager.sh create "새 기능 테스트" medium EPIC-abc test  # ❌ 중복!
```

## 워크플로우 상세

### feat (새 기능)

```
[Scrum Master] Task 생성 (type: feat)
    ↓
[Developer] 코드 구현 (상태: IN_PROGRESS → READY_FOR_TEST)
    ↓
[Test Engineer] 테스트 작성 (상태: TESTING → READY_FOR_COMMIT)
    ↓
[Scrum Master] Task 완료 커밋 (상태: DONE)
  - 구현 커밋 (feat)
  - 테스트 커밋 (test)
  - 메타데이터 커밋 (chore(pioneer))
```

### test (커버리지 개선)

```
[Scrum Master] Task 생성 (type: test)
    ↓
[Test Engineer] 기존 코드의 테스트만 추가 (상태: TESTING → READY_FOR_COMMIT)
    ↓
[Scrum Master] Task 완료 커밋 (상태: DONE)
  - 테스트 커밋 (test)
  - 메타데이터 커밋 (chore(pioneer))
```

### fix/refactor

```
[Scrum Master] Task 생성 (type: fix 또는 refactor)
    ↓
[Developer] 수정/리팩토링 (상태: IN_PROGRESS → READY_FOR_TEST)
    ↓
[Test Engineer] 테스트 작성/수정 (상태: TESTING → READY_FOR_COMMIT)
    ↓
[Scrum Master] Task 완료 커밋 (상태: DONE)
  - 커밋 (fix 또는 refactor)
  - 테스트 커밋 (test)
  - 메타데이터 커밋 (chore(pioneer))
```

### docs

```
[Scrum Master] Task 생성 (type: docs)
    ↓
[Developer] 문서 작성 (상태: IN_PROGRESS → READY_FOR_COMMIT)
    ↓
[Scrum Master] Task 완료 커밋 (상태: DONE)
  - 문서 커밋 (docs)
  - 메타데이터 커밋 (chore(pioneer))
```

### chore

**chore Task는 두 가지 유형이 있습니다**:

**유형 A: 코드 영향 있음** (테스트 필요)
```
[Scrum Master] Task 생성 (type: chore)
    ↓
[Developer] 설정 수정 (상태: IN_PROGRESS → READY_FOR_TEST)
    ↓
[Test Engineer] 영향받는 기능 테스트 (상태: TESTING → READY_FOR_COMMIT)
    ↓
[Scrum Master] Task 완료 커밋 (상태: DONE)
  - 설정 커밋 (chore)
  - 테스트 커밋 (test)
  - 메타데이터 커밋 (chore(pioneer))
```

**유형 B: 코드 영향 없음** (테스트 불필요)
```
[Scrum Master] Task 생성 (type: chore)
    ↓
[Developer] 설정 수정 (상태: IN_PROGRESS → READY_FOR_COMMIT)
    ↓
[Scrum Master] Task 완료 커밋 (상태: DONE)
  - 설정 커밋 (chore)
  - 메타데이터 커밋 (chore(pioneer))
```

**판단 기준**: Task 생성 시 Scrum Master가 다음 규칙으로 결정

### 기본 규칙: **테스트 필요** (Developer → Test Engineer)

chore Task는 **기본적으로 테스트가 필요**합니다. 아래 **모든 조건을 충족**할 때만 테스트 생략:

#### 테스트 생략 조건 (3가지 모두 충족 시)
1. ✅ **코드 실행에 영향 없음** (런타임 동작 변경 없음)
2. ✅ **빌드 동작에 영향 없음** (빌드 결과물 동일)
3. ✅ **의존성 동작에 영향 없음** (라이브러리 API 변경 없음)

#### 테스트 생략 가능 예시 (Developer → Scrum Master)

**문서 및 무해한 설정**:
- ✅ `.gitignore`, `.editorconfig`, `.prettierignore` 수정
- ✅ README.md, CONTRIBUTING.md 등 문서만 수정
- ✅ ESLint/Prettier 규칙만 변경 (코드 품질만 영향, 동작 영향 없음)
- ✅ package.json의 "description", "keywords", "author" 등 메타데이터만 변경

**의존성 (신중히 판단)**:
- ✅ 패치 버전 의존성 업데이트 (`^1.0.0` → `^1.0.1`, 버그 수정만, 빌드 성공 확인 필수)

#### 테스트 필수 예시 (Developer → Test Engineer)

**TypeScript/빌드 설정**:
- ❌ tsconfig.json의 "module" 변경 (예: `"ES2020"` → `"Node16"`)
- ❌ tsconfig.json의 "target" 변경 (예: `"ES2020"` → `"ES2022"`)
- ❌ tsconfig.json의 "paths" 변경 (모듈 해석 경로 변경)
- ❌ tsconfig.json의 "strict" 변경 (타입 체크 엄격도 변경)
- ❌ vite.config.ts, rollup.config.js 등 빌드 설정 변경
- ❌ package.json의 "type" 필드 변경 (`"module"` ↔ `"commonjs"`)

**의존성**:
- ❌ 메이저 버전 업데이트 (예: `^1.0.0` → `^2.0.0`, Breaking Changes)
- ❌ 마이너 버전 업데이트 (예: `^1.0.0` → `^1.1.0`, 새 기능 추가)
- ❌ 새 의존성 추가 (새 라이브러리 도입)
- ❌ 의존성 제거 (기존 라이브러리 제거)

**DI 및 런타임 설정**:
- ❌ DI 컨테이너 설정 변경 (tsyringe, inversify 등)
- ❌ 환경 변수 추가/변경 (`.env` 파일, `process.env` 사용)
- ❌ 미들웨어 설정 변경 (express, hono 등)
- ❌ 플러그인 추가/변경 (vite plugins 등)

**Scripts 및 명령어**:
- ❌ package.json의 "scripts" 변경 (빌드/실행 명령어 변경)
- ❌ package.json의 "exports" 변경 (모듈 진입점 변경)

### 판단이 애매한 경우

**원칙**: 의심스러우면 **테스트 필요**로 처리

**체크 질문**:
1. 이 변경으로 인해 코드 실행 결과가 달라질 수 있나요? → Yes면 테스트 필요
2. 이 변경으로 인해 빌드가 실패하거나 다른 결과물이 나올 수 있나요? → Yes면 테스트 필요
3. 이 변경으로 인해 런타임 에러가 발생할 수 있나요? → Yes면 테스트 필요

**의사결정 트리**:
```
변경사항이 있다
    ↓
코드 실행 결과가 달라질 수 있나? → Yes → 테스트 필요 ❌
    ↓ No
빌드 결과물이 달라질 수 있나? → Yes → 테스트 필요 ❌
    ↓ No
런타임 에러가 발생할 수 있나? → Yes → 테스트 필요 ❌
    ↓ No
테스트 생략 가능 ✅
```

**구체적 예시 판단**:

| 변경 사항 | 코드 실행 영향? | 빌드 영향? | 런타임 에러? | 결정 |
|-----------|----------------|-----------|-------------|------|
| tsconfig.json "strict": true → false | Yes | No | Yes | ❌ 테스트 필요 |
| package.json "description" 추가 | No | No | No | ✅ 생략 가능 |
| vite.config.ts 플러그인 추가 | No | Yes | Possible | ❌ 테스트 필요 |
| eslint.config.js "no-console" 추가 | No | No | No | ✅ 생략 가능* |
| package.json "type": "module" 추가 | Yes | Yes | Yes | ❌ 테스트 필요 |
| .gitignore에 "dist/" 추가 | No | No | No | ✅ 생략 가능 |
| README.md 오타 수정 | No | No | No | ✅ 생략 가능 |
| tsconfig.json "paths" 변경 | No | Yes | Possible | ❌ 테스트 필요 |
| 의존성 패치 버전 업데이트 | Possible | No | Possible | ⚠️ 빌드 확인** |

**주석**:
- *: ESLint 규칙 변경은 동작에 영향 없으나, 빌드 시 검증 필요
- **: 패치 버전은 보통 안전하나, 빌드 성공 확인은 필수

### style

```
[Scrum Master] Task 생성 (type: style)
    ↓
[Developer] 코드 포맷팅 적용 (상태: IN_PROGRESS → READY_FOR_COMMIT)
    ↓
[Scrum Master] Task 완료 커밋 (상태: DONE)
  - 스타일 커밋 (style)
  - 메타데이터 커밋 (chore(pioneer))
```

**참고**: style Task는 코드 로직 변경 없이 포맷팅만 수정하므로 테스트 불필요

### perf

```
[Scrum Master] Task 생성 (type: perf)
    ↓
[Developer] 성능 최적화 (상태: IN_PROGRESS → READY_FOR_TEST)
    ↓
[Test Engineer] 성능 테스트 + 기능 검증 (상태: TESTING → READY_FOR_COMMIT)
    ↓
[Scrum Master] Task 완료 커밋 (상태: DONE)
  - 성능 개선 커밋 (perf)
  - 테스트 커밋 (test)
  - 메타데이터 커밋 (chore(pioneer))
```

**참고**: 성능 개선은 로직 변경이므로 반드시 테스트 필요

## Task Type 선택 가이드

**질문**: 이 Task는 새로운 기능을 만드나요?
- Yes → `feat` (테스트 자동 포함)
- No → 다음 질문

**질문**: 버그를 고치나요?
- Yes → `fix` (테스트 자동 포함)
- No → 다음 질문

**질문**: 기존 코드를 리팩토링하나요?
- Yes → `refactor` (테스트 자동 포함)
- No → 다음 질문

**질문**: 이미 존재하는 코드의 테스트를 추가하나요?
- Yes → `test` (Test Engineer만 작업)
- No → 다음 질문

**질문**: 성능을 개선하나요?
- Yes → `perf` (테스트 자동 포함)
- No → 다음 질문

**질문**: 코드 스타일/포맷팅만 변경하나요?
- Yes → `style` (테스트 불필요)
- No → 다음 질문

**질문**: 문서만 작성하나요?
- Yes → `docs` (테스트 불필요)
- No → `chore` (빌드/설정, 상황별)

## 커밋 메시지와의 관계

Scrum Master는 Task의 `task_type` 필드를 사용하여 커밋 타입을 자동으로 결정합니다:

```bash
# Task type: feat
# → 구현 커밋: feat(scope): ...
# → 테스트 커밋: test(scope): ...

# Task type: test
# → 테스트 커밋: test(scope): ...

# Task type: fix
# → 수정 커밋: fix(scope): ...
# → 테스트 커밋: test(scope): ...
```

## 체크리스트

Task 생성 전 확인:

- [ ] Task가 새 기능/버그 수정/리팩토링인가? → feat/fix/refactor (테스트 포함)
- [ ] Task가 기존 코드의 테스트 개선인가? → test
- [ ] Task가 문서/설정만 다루는가? → docs/chore
- [ ] **feat/fix/refactor Task에 별도 test Task를 만들지 않았는가?** ✅

---

**버전**: PDK 2.2.0 | **업데이트**: 2025-10-30
