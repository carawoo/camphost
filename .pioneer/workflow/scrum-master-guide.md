# Scrum Master Guide

> Claude는 Scrum Master 역할을 수행하며, Epic 분석, Task 분해, 워크플로우 오케스트레이션을 담당합니다.

---

## Claude의 역할

**핵심 책임**:
- Epic 분석 및 Task 분해
- Task 상태 추적 및 관리
- 워크플로우 오케스트레이션 (에이전트 호출 순서)
- 사용자 커뮤니케이션 (체크포인트, 피드백)

---

## Epic 분해 프로세스

### 1. C4 Model 다이어그램 분석

**⚠️ 권장 단계**: Task 분해 전에 수행 (다이어그램 존재 시)

#### 1.0 다이어그램 존재 여부 확인

**첫 번째 단계**:
```bash
# C4 Model 디렉토리 확인
ls docs/c4-model/00-INDEX.puml
```

**케이스 A: 다이어그램 존재**
- 1.1 ~ 1.3 단계 수행
- 다이어그램 기반 Epic 분석

**케이스 B: 다이어그램 미존재**
- 사용자에게 알림 및 옵션 제시
- Epic 분석 진행 (코드베이스 직접 탐색)

#### 1.1 다이어그램 탐색 (다이어그램 존재 시)

```
1. docs/c4-model/00-INDEX.puml 읽기
   → 전체 시스템 구조 파악

2. lv1 → lv2 → lv3 → lv4 순서로 탐색
   → 어느 레벨까지 영향 있는지 파악

3. 영향 받는 컴포넌트/클래스 식별
```

#### 1.2 사용자에게 다이어그램 제시 (필수)

**반드시 사용자에게 보여줄 것**:

```markdown
현재 시스템 구조를 분석했습니다:

**영향 받는 레벨**:
- Level 4 (Code): UserService 클래스
- Level 3 (Components): User Management 컴포넌트
- Level 2, 1: 변경 없음

**관련 다이어그램**:
- docs/c4-model/lv4-code/sample-domain/user.service.puml
- docs/c4-model/lv3-components/sample-domain.puml

**현재 구조**:
[다이어그램 내용 요약 - 기존 메서드, 타입 등]

**예상 변경사항**:
- updateUser() 메서드 추가
- UpdateUserInput 타입 추가
- isNameDuplicate() 헬퍼 메서드

이 구조를 기반으로 Task를 분해하겠습니다. 추가/수정 사항 있으시면 말씀해주세요.
```

**장점**:
- 사용자가 영향 범위 시각적 확인
- Task 분해 전 요구사항 검증 가능
- "이것도 추가해주세요" 같은 조기 피드백 가능
- Task 분해 근거 명확히 제시

#### 1.3 사용자 확인 및 피드백

- 사용자가 추가 요구사항 제시 가능
- 방향 수정 가능
- 확인 후 다음 단계 진행

#### 1.4 C4 Model 미존재 시 대응 (Fallback)

**다이어그램이 없는 경우 사용자에게 알림**:

```markdown
⚠️ C4 Model 다이어그램을 찾을 수 없습니다 (docs/c4-model/).

다음 중 선택해주세요:

**옵션 1**: 다이어그램 없이 진행
- 코드베이스를 직접 탐색하여 Epic 분석
- Task 분해 및 구현 진행
- ⚠️ 아키텍처 구조 파악이 어려울 수 있음

**옵션 2**: C4 Model 초기 구조 생성 후 진행
- 기본 C4 Model 디렉토리 구조 생성
- 00-INDEX.puml 템플릿 생성
- 이후 Epic부터 다이어그램 기반 작업 가능
- ⏱️ 초기 설정 시간 필요 (약 10-15분)

**옵션 3**: 나중에 다이어그램 추가
- 지금은 구현 우선 진행
- Epic 완료 후 별도로 다이어그램 추가
- Task 타입: docs로 처리

어떻게 진행하시겠습니까?
```

**옵션별 처리**:

**옵션 1 선택 시**:
- Glob/Grep으로 코드베이스 구조 파악
- packages/ 디렉토리 탐색
- 기존 코드 패턴 분석
- Task 분해 진행 (다이어그램 참조 없이)

**옵션 2 선택 시**:
```bash
# 기본 C4 Model 구조 생성
mkdir -p docs/c4-model/{lv1-system-context,lv2-containers,lv3-components,lv4-code}

# 00-INDEX.puml 템플릿 복사
cp .pioneer/templates/c4-model/00-INDEX.puml docs/c4-model/

# 템플릿 커스터마이징 (Read + Edit 도구)
# 1. docs/c4-model/00-INDEX.puml 파일 읽기
# 2. {PROJECT_NAME} → 실제 프로젝트명으로 변경
# 3. {PACKAGE_NAME} → 실제 패키지명으로 변경 (여러 개면 반복)
# 4. service-1.puml, service-2.puml → 실제 서비스명으로 변경
# 5. 사용하지 않는 레벨/카드 삭제 또는 간소화

# 생성 완료 후 1.1 단계로 복귀
```

**옵션 3 선택 시**:
- 현재 Epic 진행
- Epic 완료 후 "C4 Model 초기 문서 작성" Task 생성
- 향후 Epic부터 다이어그램 활용

**중요**:
- 다이어그램이 없어도 Epic/Task 작업은 진행 가능
- 하지만 다이어그램이 있으면 아키텍처 이해 및 영향 범위 파악이 훨씬 용이
- 장기적으로는 옵션 2 또는 3 권장

### 2. Epic 분석

Epic 파일 (`.pioneer/epics/EPIC-{id}/epic.md`) 읽기:
- Epic 목표 및 범위 파악
- Acceptance Criteria 확인
- 구현 우선순위 결정

### 3. Task 분해

**원칙**:
- 명확한 입력/출력 정의
- 독립적으로 테스트 가능
- C4 Model 다이어그램 기반

**Task 생성**:
```bash
.pioneer/scripts/task-manager.sh create "<제목>" <priority> <epic-id> <task_type>
```

**Task Type**: [task-types.md](task-types.md) 참조

### 4. Task 상세화

각 Task 파일에 상세 내용 추가 (Edit 도구):

```markdown
## Description
[Task의 목적과 범위]
[관련 다이어그램 참조: docs/c4-model/lv4-code/...]

## Requirements
- [ ] 기능 요구사항 1
- [ ] 기능 요구사항 2
- [ ] 에러 처리
- [ ] 엣지 케이스

## Acceptance Criteria
- 성공 조건 1
- 성공 조건 2
```

**다이어그램 참조 포함**:
- Task 설명에 관련 다이어그램 경로 명시
- Developer/Test Engineer가 구조 파악 용이

---

## Task 할당 및 오케스트레이션

### task_type별 워크플로우

**feat/fix/refactor**:
```bash
# 1. Developer 호출 (설계 + 구현)
.pioneer/scripts/task-manager.sh update TASK-{id} IN_PROGRESS developer "구현 시작"

# 2. Developer 완료 (Developer가 수행)
# Status: IN_PROGRESS → READY_FOR_TEST

# 3. Test Engineer 호출 (테스트 작성)
# Status: READY_FOR_TEST → TESTING → READY_FOR_COMMIT

# 4. Scrum Master 호출 (Task 완료 커밋)
# - 구현 커밋 (feat/fix/refactor)
# - 테스트 커밋 (test)
# - 메타데이터 커밋 (chore(pioneer))
# Status: READY_FOR_COMMIT → DONE
```

**chore** (상황별 처리):
```bash
# 코드 영향이 있는 경우 (테스트 필요):
# 1. Developer 호출 (설정 수정 + 구현)
.pioneer/scripts/task-manager.sh update TASK-{id} IN_PROGRESS developer "설정 수정 시작"

# 2. Developer 완료 (Developer가 수행)
# Status: IN_PROGRESS → READY_FOR_TEST

# 3. Test Engineer 호출 (테스트 작성)
# Status: READY_FOR_TEST → TESTING → READY_FOR_COMMIT

# 4. Scrum Master 호출 (Task 완료 커밋)
# Status: READY_FOR_COMMIT → DONE

# 코드 영향이 없는 경우 (테스트 불필요):
# 1. Developer 호출 (설정 수정만)
.pioneer/scripts/task-manager.sh update TASK-{id} IN_PROGRESS developer "설정 수정 시작"

# 2. Developer 완료 (Developer가 수행)
# Status: IN_PROGRESS → READY_FOR_COMMIT

# 3. Scrum Master 호출 (Task 완료 커밋)
# Status: READY_FOR_COMMIT → DONE
```

**test**:

⚠️ **test Task의 특별한 워크플로우**: test Task는 생성 시 TODO 상태이지만, Scrum Master가 **즉시 TESTING 상태로 전환**하여 Test Engineer에게 할당합니다.

상세 워크플로우는 [Task 상태 워크플로우 - Test 전용 Task](task-status-workflow.md#test-전용-task-task_type-test) 참조

```bash
# 1. Task 생성 후 즉시 TESTING 상태로 변경하여 Test Engineer에게 할당
.pioneer/scripts/task-manager.sh update TASK-{id} TESTING test-engineer "테스트 작성 시작"

# 2. Test Engineer 완료 후 Scrum Master 호출
# Status: TODO (즉시 전환) → TESTING → READY_FOR_COMMIT → DONE
```

**docs**:
```bash
# 1. Developer 호출 (문서 작성)
.pioneer/scripts/task-manager.sh update TASK-{id} IN_PROGRESS developer "문서 작성 시작"

# 2. Developer 완료 (Developer가 수행)
# Status: IN_PROGRESS → READY_FOR_COMMIT

# 3. Scrum Master 호출 (Task 완료 커밋)
# - 문서 커밋 (docs)
# - 메타데이터 커밋 (chore(pioneer))
# Status: READY_FOR_COMMIT → DONE
```

**상세**: [task-status-workflow.md](task-status-workflow.md)

---

## Task 분해 가이드

### 좋은 Task 예시

✅ **명확한 범위**:
- "로그인 API 엔드포인트 구현 (POST /auth/login)"
- "EmailService Unit Test 작성"

✅ **적절한 크기**:
- 1일 이내 완료
- 단일 책임

### 나쁜 Task 예시

❌ **범위가 너무 큼**:
- "사용자 인증 시스템 구현" → Epic이어야 함

❌ **모호한 제목**:
- "버그 수정" → 어떤 버그인지 명시 필요

❌ **여러 책임**:
- "로그인 API 구현 및 테스트" → Developer와 Test Engineer로 분리

---

## Task 차단 및 예외 처리

### BLOCKED Task 처리 절차

Task가 차단된 경우 다음 프로토콜을 따릅니다:

#### 1. 차단 발생 (Developer 또는 Test Engineer)

Agent가 작업 중 진행 불가능한 상황 발견 시:

```bash
# Work Log에 상세 기록 (Edit 도구)
## Work Log
### 2025-10-30 15:00 - developer
- ❌ 차단 사유: [구체적인 문제 설명]
- 시도한 방법: [대안 1], [대안 2]
- 제안: [해결 방안 제안]

# Task 상태를 BLOCKED로 변경
.pioneer/scripts/task-manager.sh update TASK-{id} BLOCKED scrum-master "차단 사유 요약"
```

#### 2. Scrum Master 판단 (48시간 이내)

Scrum Master가 Task 파일의 Work Log를 검토하고 **48시간 이내** 결정:

##### 옵션 A: 해결 가능 → 작업 재개

```bash
# 1. Requirements 또는 Tech Spec 수정 (Edit 도구)
# 2. Work Log에 해결 방안 기록
# 3. Task 상태를 IN_PROGRESS로 되돌림
.pioneer/scripts/task-manager.sh update TASK-{id} IN_PROGRESS developer "문제 해결: [해결 방법 요약]"
```

**해결 가능한 경우**:
- Tech Spec 수정으로 구현 가능
- 요구사항 명확화로 진행 가능
- 의존 Task 완료로 차단 해제
- 대체 기술/라이브러리로 구현 가능

##### 옵션 B: 해결 불가 → Task 취소

```bash
# 1. Task 상태를 CANCELLED로 변경
.pioneer/scripts/task-manager.sh update TASK-{id} CANCELLED scrum-master "취소 사유: [구체적 이유]"

# 2. 대체 Task 필요 여부 판단
# 필요하면 새 Task 생성 (수정된 요구사항)
.pioneer/scripts/task-manager.sh create "대체 Task 제목" high EPIC-{id} feat
```

**취소가 필요한 경우**:
- 기술적으로 구현 불가능 (대안 없음)
- 요구사항이 Epic 범위를 벗어남
- 비용/시간 대비 효과가 없음
- Epic의 Acceptance Criteria와 무관한 Task로 판명

#### 3. 특수 케이스

**케이스 A: 의존성 차단**
```bash
# Task 파일에 dependencies 기록
---
dependencies: [TASK-abc1234, TASK-def5678]
---

# BLOCKED 상태 유지, 의존 Task 완료 대기
# 의존 Task 완료 시 자동 또는 수동으로 IN_PROGRESS 복귀
```

**케이스 B: 버그 발견 (Test Engineer → Developer)**
```bash
# Test Engineer가 구현 버그 발견 시
# 자동으로 IN_PROGRESS 상태로 복귀 (BLOCKED 아님)
.pioneer/scripts/task-manager.sh update TASK-{id} IN_PROGRESS developer "버그 수정 필요: [버그 설명]"
```

**케이스 C: 테스트 불가능한 구조**
```bash
# Option A: 리팩토링 Task 생성 후 현재 Task 대기
.pioneer/scripts/task-manager.sh create "코드 구조 개선" high EPIC-{id} refactor
# 현재 Task는 BLOCKED 유지

# Option B: 현재 Task CANCELLED 후 새 Task 생성
.pioneer/scripts/task-manager.sh update TASK-{id} CANCELLED scrum-master "테스트 불가능 - 재설계"
.pioneer/scripts/task-manager.sh create "재설계된 Task" high EPIC-{id} feat
```

### BLOCKED vs CANCELLED 결정 가이드

| 상황 | 결정 | 이유 |
|------|------|------|
| Tech Spec 수정으로 해결 가능 | BLOCKED → IN_PROGRESS | 해결 가능 |
| 외부 API 장애 (일시적) | BLOCKED (대기) | 시간 지나면 해결 |
| 요구사항이 Epic 범위 초과 | CANCELLED | Epic 범위 문제 |
| 기술적 불가능 (대안 없음) | CANCELLED | 해결 불가 |
| 의존 Task 완료 대기 | BLOCKED (대기) | 의존성 해소 필요 |
| 요구사항 불명확 | BLOCKED (48h 대기) | 명확화 후 재개 |

### Task 취소 후 처리

```bash
# Task 취소 후 고려사항 체크리스트
```

- [ ] Epic의 Acceptance Criteria를 여전히 충족할 수 있는가?
- [ ] 대체 Task 생성이 필요한가?
- [ ] Epic 범위 조정이 필요한가?
- [ ] 다른 Task에 영향을 주는가?

**Epic 파일 업데이트**:
- CANCELLED Task는 Epic 진행률 계산에서 제외됨
- Task 리스트에 ~~취소선~~ 표시 (선택)

---

## Epic 완료 프로세스

### 체크리스트

모든 Task 완료 후 확인:
- [ ] 모든 Task status가 DONE (CANCELLED 제외)
- [ ] 빌드 성공 (`yarn build`)
- [ ] 모든 테스트 통과 (`yarn test`)
- [ ] Epic 파일의 Tasks 체크리스트 완료

### Epic 완료 워크플로우 (PR 필수)

**이 프로젝트는 PR 워크플로우를 사용합니다. main 브랜치 직접 병합은 금지됩니다.**

```bash
# 1. Epic 상태는 자동으로 IN_REVIEW로 전환됨 (모든 Task DONE 시)

# 2. PR 생성 (Scrum Master 호출 또는 gh CLI 사용)
gh pr create --base main --head feature/EPIC-{id} \
  --title "Epic 제목" \
  --body-file .pioneer/epics/EPIC-{id}/epic.md

# 3. PR URL을 Epic 파일에 기록
.pioneer/scripts/epic-manager.sh set-pr EPIC-{id} "https://github.com/.../pull/XX"

# 4. 코드 리뷰 진행 및 피드백 반영

# 5. 리뷰 승인 후 PR 병합

# 6. PR 병합 완료 후 Epic 완료 처리
.pioneer/scripts/epic-manager.sh complete EPIC-{id}
```

**Epic Checklist**:
- [ ] All Tasks completed (CANCELLED excluded)
- [ ] Build succeeded
- [ ] All tests passed
- [ ] PR created
- [ ] Code reviewed and approved
- [ ] PR merged to main

---

## PR 피드백 처리 (Task Reopen)

PR 리뷰 중 특정 Task에 대한 수정 요청이 있는 경우:

### 상황 1: 단순 수정 요청 (Task 재작업)

코드 수정이 필요하지만 Task 범위 내 수정인 경우:

```bash
# 1. Task를 IN_PROGRESS로 되돌림
.pioneer/scripts/task-manager.sh reopen TASK-{id} "PR 피드백: {구체적 수정 사항}"

# 예시
.pioneer/scripts/task-manager.sh reopen TASK-abc1234 "PR 피드백: 에러 처리 로직 개선 필요"
```

**자동 수행 사항**:
- Task 상태: DONE → IN_PROGRESS
- Epic 상태: IN_REVIEW → IN_PROGRESS (자동)
- Epic 진행률 재계산

**다음 단계**:
1. Developer에게 Task 할당 (수정 작업)
2. Developer 완료 후 기존 워크플로우 진행 (READY_FOR_TEST → TESTING → READY_FOR_COMMIT)
3. Scrum Master가 수정 사항 커밋
4. 모든 Task 완료 시 Epic 상태 자동 IN_REVIEW 전환

### 상황 2: 새로운 Task 생성 필요

PR 피드백이 원래 Task 범위를 벗어나는 경우:

```bash
# 새 Task 생성
.pioneer/scripts/task-manager.sh create "PR 피드백: {추가 요구사항}" high EPIC-{id} {task_type}

# 예시
.pioneer/scripts/task-manager.sh create "PR 피드백: 로깅 추가" medium EPIC-abc1234 feat
```

**언제 사용?**:
- 원래 Task에 없던 새로운 기능 추가 요청
- 별도 테스트가 필요한 대규모 수정
- 다른 파일/모듈 수정이 필요한 경우

### 상황 3: Epic 범위 변경

PR 피드백이 Epic 전체에 영향을 미치는 경우:

```bash
# Epic을 IN_PROGRESS로 되돌림 (필요시)
.pioneer/scripts/epic-manager.sh update EPIC-{id} IN_PROGRESS

# 필요한 Task들을 reopen
.pioneer/scripts/task-manager.sh reopen TASK-{id1} "PR 피드백: Epic 수준 변경"
.pioneer/scripts/task-manager.sh reopen TASK-{id2} "PR 피드백: Epic 수준 변경"
```

### 체크리스트

Task reopen 전:
- [ ] PR 피드백이 해당 Task 범위 내인가?
- [ ] 단순 수정인가, 새 기능 추가인가?
- [ ] 다른 Task에도 영향을 미치는가?

Task reopen 후:
- [ ] Epic 상태가 IN_PROGRESS로 변경되었는가?
- [ ] Work Log에 reopen 사유가 기록되었는가?
- [ ] Developer에게 명확한 수정 요청 사항이 전달되었는가?

---

## 참고 문서

- [Task 관리](task-management.md) - Task 시스템 개요
- [Task 상태 워크플로우](task-status-workflow.md) - 에이전트별 책임
- [Task 타입](task-types.md) - task_type 정의
- Git 브랜치 규칙 - 1 Epic = 1 Branch (CLAUDE.md 참조)

---

## 예시: Epic 분해

**Epic**: "사용자 알림 서비스"

**Task 분해**:
1. **TASK-1** (feat): NotificationService 구현 (DI 패턴)
2. **TASK-2** (feat): REST API 엔드포인트 구현
3. **TASK-3** (feat): EmailProvider 구현
4. **TASK-4** (feat): SmsProvider 구현
5. **TASK-5** (docs): API 문서 작성

**Phase별 그룹화** (Epic 파일에):
```markdown
## Tasks

### Phase 1: Core Service
- [ ] TASK-1: NotificationService 구현

### Phase 2: REST API
- [ ] TASK-2: REST API 엔드포인트

### Phase 3: Providers
- [ ] TASK-3: EmailProvider
- [ ] TASK-4: SmsProvider

### Phase 4: Documentation
- [ ] TASK-5: API 문서
```

---

**버전**: PDK 2.2.0 | **업데이트**: 2025-10-30
