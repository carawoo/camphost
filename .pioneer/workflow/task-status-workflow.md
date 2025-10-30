# Task 상태 관리 워크플로우

> 각 에이전트가 Task 상태를 업데이트하는 책임과 시점

---

## 핵심 원칙

```
각 에이전트는 자신의 작업 시작/완료 시 Task 상태를 업데이트해야 합니다.
```

## Task 상태 흐름

### 일반 Task (feat, fix, refactor 등)
```
TODO
  ↓ (Scrum Master → Developer 할당)
IN_PROGRESS (Developer 작업 시작)
  ↓ (Developer 작업 완료)
READY_FOR_TEST (Test Engineer 작업 대기)
  ↓ (Test Engineer 작업 시작)
TESTING (Test Engineer 작업 중)
  ↓ (Test Engineer 작업 완료)
READY_FOR_COMMIT (Scrum Master 최종 커밋 대기)
  ↓ (Scrum Master 구현+테스트 한 번에 커밋)
DONE (Task 완료)
```

### Test 전용 Task (task_type: test)
```
TODO
  ↓ (Scrum Master → Test Engineer 할당, 즉시 상태 변경)
TESTING (Test Engineer 작업 시작)
  ↓ (Test Engineer 작업 완료)
READY_FOR_COMMIT (Scrum Master 커밋 대기)
  ↓ (Scrum Master 테스트 커밋 완료)
DONE (Task 완료)
```

**중요**: Scrum Master가 test Task 생성 시 TODO → TESTING으로 **즉시 변경**합니다.

### 문서 Task (task_type: docs)
```
TODO
  ↓ (Scrum Master → Developer 할당)
IN_PROGRESS (Developer 작업 시작)
  ↓ (Developer 작업 완료 - 테스트 불필요)
READY_FOR_COMMIT (Scrum Master 커밋 대기)
  ↓ (Scrum Master 문서 커밋 완료)
DONE (Task 완료)
```

**참고**: docs Task는 테스트가 불필요하므로 READY_FOR_TEST 단계를 건너뛰고 바로 READY_FOR_COMMIT으로 전환됩니다.

### 예외 흐름

#### 차단 (BLOCKED)
```
IN_PROGRESS (Developer 작업 중)
  ↓ (구현 불가능/요구사항 불명확)
BLOCKED (Scrum Master 개입 필요)
  ↓ (문제 해결)
IN_PROGRESS (작업 재개)
  또는
CANCELLED (해결 불가능 시)
```

```
TESTING (Test Engineer 작업 중)
  ↓ (구현 버그 발견)
IN_PROGRESS (Developer 버그 수정)
  또는
  ↓ (테스트 불가능한 구조)
BLOCKED (Scrum Master 개입 필요)
```

#### 취소 (CANCELLED)
```
TODO → CANCELLED
IN_PROGRESS → CANCELLED
BLOCKED → CANCELLED
```

**취소 사유 예시**:
- 요구사항 변경으로 불필요
- Epic 범위 축소
- 구현 불가능하며 대체 불가

---

## 에이전트별 책임

### 1. Scrum Master

**책임**:
- Task 생성 시 상태 초기화
- task_type에 따라 적절한 에이전트에게 할당
- Epic 내 모든 Task 완료 시 Epic 상태 업데이트

**상태 변경 (task_type별)**:
```
feat/fix/refactor: TODO → IN_PROGRESS (Developer 할당)
chore: TODO → IN_PROGRESS (Developer 할당)
test: TODO → TESTING (Test Engineer 할당)
docs: TODO → IN_PROGRESS (Developer 할당)
```

**워크플로우**:
1. Task 생성 (자동으로 TODO 상태)
2. Task 파일 읽기 (task_type 확인)
3. task_type에 따라 상태 업데이트:

   **feat/fix/refactor**:
   ```bash
   .pioneer/scripts/task-manager.sh update TASK-{id} IN_PROGRESS developer "구현 시작"
   ```

   **chore**:
   ```bash
   .pioneer/scripts/task-manager.sh update TASK-{id} IN_PROGRESS developer "설정 수정 시작"
   ```

   **test**:
   ```bash
   .pioneer/scripts/task-manager.sh update TASK-{id} TESTING test-engineer "테스트 작성 시작"
   ```

   **docs**:
   ```bash
   .pioneer/scripts/task-manager.sh update TASK-{id} IN_PROGRESS developer "문서 작성 시작"
   ```

4. Task 파일의 Description, Requirements 섹션 작성

**체크리스트 업데이트**: 없음 (Task 생성 시 task_type에 따라 자동 생성)

### 2. Developer

**책임**:
- 작업 시작 시 상태 확인 (IN_PROGRESS인지)
- 구현 완료 시 상태 업데이트 및 Test Engineer에게 할당
- 체크리스트 업데이트 (Tech spec, Code implemented, Build/Test 통과)

**상태 변경**:
```
IN_PROGRESS (유지) → READY_FOR_TEST (구현 완료 시)
```

**워크플로우**:
1. Task 파일 읽기 (status가 IN_PROGRESS인지 확인)
2. Tech Spec 작성 (Task 파일의 "## Tech Spec" 섹션)
3. 코드 구현
4. 빌드/타입 체크/린트 실행
5. **Task 파일의 Checklist 업데이트**:
   ```markdown
   - [x] Tech spec written (Developer)
   - [x] Code implemented (Developer)
   - [x] Type check passed
   - [x] Lint passed
   - [x] Build succeeded
   ```
6. Task 상태 업데이트:
   ```bash
   .pioneer/scripts/task-manager.sh update TASK-{id} READY_FOR_TEST test-engineer "구현 완료, 테스트 대기"
   ```
7. Work Log에 완료 기록 (Edit 도구로 Task 파일 수정)

**❌ 중요: Developer는 절대 Git 커밋을 하지 않습니다**

모든 커밋은 **Scrum Master만** 수행합니다. Developer는 코드 구현 후 상태만 변경합니다.

### 3. Test Engineer

**책임**:
- 작업 시작 시 상태 확인 (READY_FOR_TEST 또는 TESTING인지)
- 테스트 작성 완료 시 상태 업데이트 및 Scrum Master에게 할당
- 체크리스트 업데이트 (Tests written, Tests passed)

**상태 변경**:
```
READY_FOR_TEST → TESTING (테스트 시작 시)
TESTING (유지) → READY_FOR_COMMIT (테스트 완료 시)
```

**워크플로우**:
1. Task 파일 읽기 (status가 READY_FOR_TEST 또는 TESTING인지 확인)
2. task_type이 test인 경우: 이미 TESTING 상태 (추가 상태 변경 불필요)
3. task_type이 feat/fix/refactor인 경우: 이미 READY_FOR_TEST 상태
   ```bash
   # READY_FOR_TEST → TESTING 전환
   .pioneer/scripts/task-manager.sh update TASK-{id} TESTING test-engineer "테스트 작성 시작"
   ```
4. 기존 구현 코드 분석 (test Task의 경우 이미 존재하는 코드)
5. Unit Test 작성
6. 테스트 실행 (`yarn test`)
7. **Task 파일의 Checklist 업데이트**:
   ```markdown
   - [x] Tests written (Test Engineer)
   - [x] Tests passed
   ```
7. Task 상태 업데이트:
   ```bash
   .pioneer/scripts/task-manager.sh update TASK-{id} READY_FOR_COMMIT scrum-master "테스트 완료, 최종 커밋 대기"
   ```
8. Work Log에 완료 기록 (Edit 도구로 Task 파일 수정)

**❌ 중요: Test Engineer는 절대 Git 커밋을 하지 않습니다**

모든 커밋은 **Scrum Master만** 수행합니다. Test Engineer는 테스트 완료 후 상태만 변경합니다.

### 4. Scrum Master (Task 완료 커밋)

**✅ Scrum Master만 모든 커밋을 수행합니다**

**책임**:
- Test Engineer 완료 후 **Task 완료 시점에 모든 커밋 생성**
- Developer와 Test Engineer는 절대 커밋하지 않음
- Task 상태를 DONE으로 변경
- 필요한 모든 커밋 생성 및 메타데이터 커밋

**상태 변경**:
```
READY_FOR_COMMIT → DONE (커밋 완료 후)
```

**워크플로우**:
1. Task 파일 읽기 (status가 READY_FOR_COMMIT인지 확인)
2. git status, git diff로 모든 변경사항 확인
3. **구현 커밋 생성 및 즉시 push**:
   - 대상: src/**/*.ts 등 구현 코드
   - Type: feat/fix/refactor/docs/chore (Task의 task_type)
   - 생성 후 즉시 원격 push
4. **테스트 커밋 생성 및 즉시 push** (테스트가 있는 경우):
   - 대상: tests/**/*.spec.ts 등 테스트 코드
   - Type: test
   - 생성 후 즉시 원격 push
5. Task 상태를 DONE으로 업데이트
6. Epic 파일 동기화 (Task 상태 업데이트)
7. **메타데이터 커밋 생성 및 즉시 push**:
   - 대상: .pioneer/epics/**/*.md (Pioneer 파일)
   - Type: chore(pioneer)
   - 생성 후 즉시 원격 push
8. Work Log 업데이트 (모든 커밋 정보 기록)
9. Artifacts 섹션에 커밋 정보 추가

**커밋 원칙**:
- Task 완료 시점에 커밋 (중간 커밋 없음)
- 각 커밋은 독립적으로 생성하고 **즉시 개별 push**
- 구현과 테스트를 논리적으로 분리
- 메타데이터는 별도 커밋으로 분리

## 상태 업데이트 타이밍

| 에이전트 | 이벤트 | 상태 변경 | 타이밍 |
|---------|-------|----------|--------|
| Scrum Master | Task 생성 | - → TODO | Task 생성 시 자동 |
| Scrum Master | Developer 할당 | TODO → IN_PROGRESS | Developer 호출 전 |
| Developer | 구현 완료 | IN_PROGRESS → READY_FOR_TEST | 코드 구현 + 빌드 완료 후 |
| Test Engineer | 테스트 시작 | READY_FOR_TEST → TESTING | 테스트 작성 시작 시 (선택) |
| Test Engineer | 테스트 완료 | TESTING → READY_FOR_COMMIT | 테스트 작성 + 실행 완료 후 |
| Scrum Master | Task 완료 커밋 | READY_FOR_COMMIT → DONE | Task 완료 시점에 모든 커밋 생성 |

## 체크리스트 업데이트 책임

### Developer가 업데이트
```markdown
- [x] Tech spec written (Developer)
- [x] Code implemented (Developer)
- [x] Type check passed
- [x] Lint passed
- [x] Build succeeded
```

### Test Engineer가 업데이트
```markdown
- [x] Tests written (Test Engineer)
- [x] Tests passed
```

## 예시: 전체 워크플로우

### Task TASK-abc1234 시작

**1. Scrum Master: Task 생성 및 할당**
```bash
# Task 생성 (자동으로 TODO 상태)
.pioneer/scripts/task-manager.sh create "로그인 API 구현" high EPIC-xyz7890 feat

# Developer에게 할당 (상태 변경: TODO → IN_PROGRESS)
.pioneer/scripts/task-manager.sh update TASK-abc1234 IN_PROGRESS developer "구현 시작"
```

**Task 파일 상태**:
```yaml
status: IN_PROGRESS
assignee: developer
```

**2. Developer: 구현 완료**
```markdown
## Checklist
- [x] Tech spec written (Developer)
- [x] Code implemented (Developer)
- [x] Type check passed
- [x] Lint passed
- [x] Build succeeded
- [ ] Tests written (Test Engineer)
- [ ] Tests passed
```

```bash
# 상태 업데이트 (IN_PROGRESS → READY_FOR_TEST)
.pioneer/scripts/task-manager.sh update TASK-abc1234 READY_FOR_TEST test-engineer "구현 완료, 테스트 대기"
```

**Task 파일 상태**:
```yaml
status: READY_FOR_TEST
assignee: test-engineer
```

**3. Test Engineer: 테스트 완료**
```markdown
## Checklist
- [x] Tech spec written (Developer)
- [x] Code implemented (Developer)
- [x] Type check passed
- [x] Lint passed
- [x] Build succeeded
- [x] Tests written (Test Engineer)
- [x] Tests passed
```

```bash
# 상태 업데이트 (READY_FOR_TEST → READY_FOR_COMMIT)
.pioneer/scripts/task-manager.sh update TASK-abc1234 READY_FOR_COMMIT scrum-master "테스트 완료, 최종 커밋 대기"
```

**Task 파일 상태**:
```yaml
status: READY_FOR_COMMIT
assignee: scrum-master
```

**4. Scrum Master: 최종 커밋**
```bash
# 구현 커밋 생성
git add packages/**/src/**/*.ts
git commit -m "feat(auth): 로그인 API 구현..."

# 테스트 커밋 생성
git add packages/**/tests/**/*.spec.ts
git commit -m "test(auth): 로그인 API 테스트..."

# 원격에 push
git push origin feature/EPIC-xyz7890

# Task 상태를 DONE으로 업데이트 및 Epic 동기화
# (Task 파일 및 Epic 파일 수정)

# 메타데이터 커밋 생성
git add .pioneer/epics/EPIC-xyz7890/**/*.md
git commit -m "chore(pioneer): update task metadata for TASK-abc1234..."

# 원격에 push
git push origin feature/EPIC-xyz7890
```

**Task 파일 상태**:
```yaml
status: DONE
assignee: scrum-master
```

### 예시 2: Test 전용 Task

**Task TASK-def5678 시작** (task_type: test)

**1. Scrum Master: Task 생성 및 Test Engineer 할당**
```bash
# Task 생성 (자동으로 TODO 상태)
.pioneer/scripts/task-manager.sh create "NotificationService 테스트 커버리지 개선" medium EPIC-xyz7890 test

# Test Engineer에게 직접 할당 (상태 변경: TODO → TESTING)
.pioneer/scripts/task-manager.sh update TASK-def5678 TESTING test-engineer "테스트 작성 시작"
```

**Task 파일 상태**:
```yaml
status: TESTING
assignee: test-engineer
task_type: test
```

**체크리스트** (test Task는 간소화됨):
```markdown
## Checklist
- [ ] Tests written (Test Engineer)
- [ ] Tests passed
```

**2. Test Engineer: 테스트 완료**
```markdown
## Checklist
- [x] Tests written (Test Engineer)
- [x] Tests passed
```

```bash
# 상태 업데이트 (TESTING → READY_FOR_COMMIT)
.pioneer/scripts/task-manager.sh update TASK-def5678 READY_FOR_COMMIT scrum-master "테스트 완료, 커밋 대기"
```

**Task 파일 상태**:
```yaml
status: READY_FOR_COMMIT
assignee: scrum-master
```

**3. Scrum Master: 테스트 커밋 및 완료**
```bash
# 테스트 커밋 생성 및 push
git add .
git commit -m "test(notification): NotificationService 테스트 커버리지 개선..."
git push origin feature/EPIC-xyz7890

# Task 완료 (READY_FOR_COMMIT → DONE)
.pioneer/scripts/task-manager.sh complete TASK-def5678
```

**Task 파일 상태**:
```yaml
status: DONE
assignee: scrum-master
```

**핵심 차이점**:
- Developer 단계를 건너뜀 (Test Engineer가 직접 시작)
- 체크리스트가 간소화됨 (테스트 관련 항목만)
- 커밋이 1개만 생성됨 (test 커밋만)

## 자주 발생하는 실수

### ❌ Developer가 DONE으로 변경
```bash
# 잘못됨
.pioneer/scripts/task-manager.sh update TASK-abc1234 DONE developer
```

**올바른 방법**: Developer는 READY_FOR_TEST 또는 READY_FOR_COMMIT으로만 변경

### ❌ Test Engineer가 DONE으로 변경
```bash
# 잘못됨
.pioneer/scripts/task-manager.sh update TASK-abc1234 DONE test-engineer
```

**올바른 방법**: Test Engineer는 READY_FOR_COMMIT으로만 변경

### ❌ 체크리스트를 업데이트하지 않음
```markdown
# 잘못됨: Developer가 구현 완료했는데 체크리스트 업데이트 안 함
- [ ] Tech spec written (Developer)
- [ ] Code implemented (Developer)
```

**올바른 방법**: 각 에이전트는 자신의 작업 완료 시 체크리스트를 반드시 업데이트

### ❌ 상태를 업데이트하지 않고 다음 에이전트 호출
```bash
# 잘못됨: Developer가 구현 완료 후 상태 업데이트 없이 Scrum Master에게 반환
```

**올바른 방법**: 각 에이전트는 작업 완료 후 반드시 상태를 업데이트하고 Scrum Master에게 반환

## 체크포인트

각 에이전트 작업 완료 후:
- [ ] Task 파일의 status가 업데이트되었는가?
- [ ] Task 파일의 assignee가 다음 담당자로 변경되었는가?
- [ ] Task 파일의 Checklist가 업데이트되었는가?
- [ ] Task 파일의 Work Log에 작업 기록이 추가되었는가?
- [ ] Status History에 상태 변경 기록이 추가되었는가?

## 참고 문서

- [Task 관리](task-management.md) - Task 관리 전체 프로세스
- [Developer Workflow](../agents/developer/workflow.md) - Developer 워크플로우
- [Test Engineer Workflow](../agents/test-engineer/workflow.md) - Test Engineer 워크플로우

---

**버전**: PDK 2.2.0 | **업데이트**: 2025-10-30
