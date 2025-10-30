# Pioneer Development Kit (PDK)

> Epic-Driven Multi-Agent Development System

TypeScript ESM Monorepo를 위한 AI 에이전트 기반 Scrum 개발 시스템

---

## ⚠️ 최우선 규칙

### 1 Epic = 1 Branch

```
Epic 시작 → 브랜치 1개 생성 → 모든 Task 순차 또는 병렬 작업 → Epic 완료
```

**브랜치명 컨벤션**: `feature/EPIC-{id}`
- 예: `feature/EPIC-e0ac724`
- Epic ID만 사용 (설명 불필요)

### 절대 금지 사항

#### Epic/Task 관리
- ❌ Task별 브랜치 생성
- ❌ main/master 브랜치 직접 작업 및 커밋
- ❌ Epic 없이 Task 생성

#### Agent 작업 범위
- ❌ Developer가 테스트 작성
- ❌ Developer가 Git 커밋
- ❌ Test Engineer가 구현 코드 수정
- ❌ Test Engineer가 Git 커밋
- ❌ Developer/Test Engineer가 Task 상태를 DONE으로 변경

**✅ Scrum Master(Claude)가 모든 Git 작업을 수행합니다**

---

## 🤖 역할 정의

### Claude = Scrum Master (Orchestrator + Git Manager)

> 💡 **참고**: Claude Code 자체가 Scrum Master 역할을 수행합니다.
> 별도 서브에이전트로 호출하지 않으며, `.pioneer/workflow/scrum-master-guide.md`의 워크플로우를 따릅니다.

**Claude의 역할**:
- Epic 분석 및 Task 분해
- Task 상태 추적 및 워크플로우 오케스트레이션
- 각 에이전트 호출 및 작업 흐름 관리
- **Git 작업** (Epic 브랜치 생성, Task 완료 커밋)
- 사용자와의 커뮤니케이션 (체크포인트, 피드백)

**⚠️ Epic 생성 원칙 (중요)**:
- **기본적으로 모든 작업은 Epic으로 진행**합니다
- 특별한 사유가 없는 한 Epic 브랜치 생성 및 PR 워크플로우를 따릅니다
- 예외 (Epic 없이 진행 가능한 경우):
  - 긴급 hotfix (1개 파일, 5줄 이하 수정)
  - 오타 수정 (README, 주석)
  - 설정 파일 미세 조정 (포맷팅, 린트 규칙)
- **Epic 대상** (반드시 Epic으로 진행):
  - 새로운 기능 추가
  - 버그 수정 (로직 변경 포함)
  - 리팩토링 (구조 변경)
  - 문서 작성 (새 문서, 대규모 업데이트)
  - 테스트 추가
  - 설정 변경 (의존성, 빌드 도구)
- 사용자가 "Epic 없이 진행"을 명시적으로 요청하지 않는 한, 항상 Epic 생성부터 시작합니다

**참고 문서**: `.pioneer/workflow/` - Task 관리, 상태 흐름, Task 타입 등

### Specialized Agents

| 에이전트 | 역할 | 호출 시점 |
|---------|------|---------|
| **Developer** | 설계 + 구현 | Task 생성 후 (feat/fix/refactor/docs/chore) |
| **Test Engineer** | 테스트 작성 | 구현 완료 후, 또는 Task 시작 (task_type: test) |

**상세 워크플로우**: `.pioneer/agents/{agent-name}/workflow.md` 참조

---

## 🗺️ C4 Model 다이어그램 (Epic/Task 분석 시 참고)

### 핵심 원칙: **"Diagram-Driven Epic/Task Planning"**

Epic 분석 및 Task 생성 시 **C4 Model 다이어그램**을 참고하여 영향 범위를 파악합니다.

### 📂 다이어그램 위치
```
docs/c4-model/
├── 00-INDEX.puml           ⭐ 시작점 (전체 구조 파악)
├── lv1-system-context/     외부 시스템 레벨
├── lv2-containers/         Apps + Packages 레벨
├── lv3-components/         패키지 내부 컴포넌트 레벨
└── lv4-code/              클래스/인터페이스 레벨
```

### 🤖 Claude(Scrum Master)의 사용 시점

**Epic 분석 시**:
```
사용자 Epic 요청
  ↓
0. ⚠️ C4 Model 존재 확인 (ls docs/c4-model/00-INDEX.puml)
   → 존재: 1단계 진행
   → 미존재: 사용자에게 옵션 제시 (하단 "C4 Model 미존재 시" 참조)
  ↓
1. docs/c4-model/00-INDEX.puml 읽기
   → 전체 시스템 구조 파악
  ↓
2. lv1 → lv2 → lv3 → lv4 순서로 탐색
   → 어느 레벨까지 영향 있는지 파악
  ↓
3. ⚠️ 사용자에게 다이어그램 분석 결과 제시 (필수)
   → 영향 받는 레벨 및 컴포넌트 설명
   → 예상 변경사항 명시
   → 사용자 확인 및 피드백 대기
  ↓
4. 영향 범위 기반으로 Task 분해
```

**Task 생성 시**:
```
각 다이어그램의 "🔗 코드 경로" 참조
  ↓
Task 설명에 수정할 파일 명시
  ↓
Developer/Test Engineer에게 전달
```

**Task 완료 후 (커밋 전)**:
```
Agent가 코드 수정 완료
  ↓
Claude가 다이어그램 동기화 확인
  ↓
lv4 → lv3 → lv2 → lv1 순서로 체크리스트 확인
  ↓
필요 시 다이어그램 업데이트 후 커밋
```

### ⚠️ C4 Model 미존재 시 대응

**다이어그램이 없는 새 프로젝트에서 Epic 시작 시**:

사용자에게 3가지 옵션 제시:

**옵션 1**: 다이어그램 없이 진행
- Glob/Grep으로 코드베이스 직접 탐색
- 기존 코드 패턴 분석 후 Task 분해
- ⚠️ 아키텍처 구조 파악이 어려울 수 있음

**옵션 2**: C4 Model 초기 구조 생성 후 진행 (권장)
- 디렉토리 생성: `mkdir -p docs/c4-model/{lv1-system-context,lv2-containers,lv3-components,lv4-code}`
- 템플릿 복사: `cp .pioneer/templates/c4-model/00-INDEX.puml docs/c4-model/`
- 템플릿 커스터마이징: {PROJECT_NAME}, {PACKAGE_NAME} 등 실제 값으로 변경
- 이후 Epic부터 다이어그램 기반 작업 가능
- ⏱️ 초기 설정 시간: 약 10-15분

**옵션 3**: 나중에 다이어그램 추가
- 현재 Epic은 구현 우선 진행
- Epic 완료 후 "C4 Model 초기 문서 작성" Task 생성 (docs)
- 향후 Epic부터 다이어그램 활용

**중요**: 다이어그램이 없어도 개발은 가능하지만, 장기적으로는 아키텍처 문서화 권장

**상세 워크플로우**: `.pioneer/workflow/scrum-master-guide.md` - "1.4 C4 Model 미존재 시 대응" 참조

### ⚠️ 필수 규칙 (C4 Model 존재 시)

1. **Epic 분석 시 다이어그램 확인 및 사용자 제시 필수**
   - `00-INDEX.puml`에서 시작하여 영향 범위 파악
   - **Task 분해 전에 반드시 사용자에게 다이어그램 분석 결과 제시**
   - 사용자 확인 후 Task 분해 시작
   - Task 분해 시 각 레벨별 변경 사항 식별

2. **Task 완료 후 다이어그램 동기화 확인**
   - Agent 작업 완료 후 Claude가 다이어그램 체크
   - 각 레벨의 "⚠️ 동기화 체크리스트" 완료

3. **코드 수정은 Agent의 책임**
   - Developer/Test Engineer가 코드 수정
   - Claude는 Epic/Task 관리 + 다이어그램 검증

### 📝 예시: "Slack 알림 추가" Epic

**1. Epic 분석 (Claude)**
```
00-INDEX.puml 확인
  ↓
영향 범위 파악:
- lv1: Slack Service 외부 시스템 추가
- lv2: sample-domain → Slack 관계 추가
- lv3: SlackProvider 컴포넌트 추가
- lv4: SlackProvider 인터페이스 + 구현체
  ↓
사용자에게 제시:
"현재 시스템 구조를 분석했습니다:
- Level 4: SlackProvider 인터페이스 + 구현체
- Level 3: Notification Provider 컴포넌트 추가
- Level 2: sample-domain → Slack 관계
- Level 1: Slack Service 외부 시스템

이 구조를 기반으로 Task를 분해하겠습니다.
추가/수정 사항 있으시면 말씀해주세요."
  ↓
사용자 확인 후 Task 생성:
1. TASK-001: SlackProvider 인터페이스 정의
2. TASK-002: ConsoleSlackProvider 구현
3. TASK-003: NotificationService에 sendSlack() 추가
4. TASK-004: 테스트 작성
```

**2. Task 실행 (Developer/Test Engineer)**
```
TASK-001 → Developer가 코드 작성
TASK-002 → Developer가 코드 작성
TASK-003 → Developer가 코드 작성
TASK-004 → Test Engineer가 테스트 작성
```

**3. Task 완료 후 (Claude)**
```
코드 완료 확인
  ↓
다이어그램 동기화 체크:
- lv4/notification-service.puml → sendSlack() 반영 필요
- lv4/notification-providers.puml → SlackProvider 추가 필요
- lv3/sample-domain.puml → 확인
- lv2/overview.puml → Slack 관계 추가
- lv1/system.puml → Slack Service 추가
  ↓
필요 시 다이어그램 업데이트
  ↓
커밋 생성
```

---

## 📋 워크플로우

**상세 워크플로우 문서**:
- [Scrum Master Guide](.pioneer/workflow/scrum-master-guide.md) - Epic 분해, Task 생성
- [Task 관리](.pioneer/workflow/task-management.md) - Task 상태, 파일 구조
- [Task 상태 워크플로우](.pioneer/workflow/task-status-workflow.md) - 에이전트별 상태 업데이트 책임
- [Task 타입](.pioneer/workflow/task-types.md) - feat, fix, test 등 타입별 규칙

**간단 요약**:
```
사용자 → Claude (Epic 분석) → Task 생성
  ↓
각 Task별 워크플로우 (task_type에 따라):
  - feat/fix/refactor: Developer → Test Engineer → Scrum Master (커밋)
  - test: Test Engineer → Scrum Master (커밋)
  - docs: Developer → Scrum Master (커밋, 테스트 불필요)
  - chore: 상황별 (코드 영향 여부에 따라 테스트 필요성 결정)
```

**핵심 원칙**:
- **1 Epic = 1 Branch**
- **Scrum Master가 Task 완료 시점에 커밋 생성**

**Epic 완료 워크플로우**:
```
모든 Task DONE → Epic 자동 IN_REVIEW
  ↓
PR 생성 및 코드 리뷰
  ↓
PR 병합 (main 브랜치)
  ↓
Epic 수동 DONE 처리 (`epic-manager.sh complete EPIC-{id}`)
```

**예외 처리**:
- Task 차단 시 → BLOCKED 상태로 변경, Scrum Master 개입
- 구현 불가능 시 → CANCELLED 또는 재설계
- 버그 발견 시 → Developer에게 반환 (IN_PROGRESS)
- **PR 피드백 시** → Task reopen (DONE → IN_PROGRESS)

**상세**:
- [Task 관리](.pioneer/workflow/task-management.md#task-상태-흐름)
- [PR 피드백 처리](.pioneer/workflow/scrum-master-guide.md#pr-피드백-처리-task-reopen)

---

## 📁 프로젝트 구조

```
.claude/agents/          # Specialized Agent 정의
├── developer.md
└── test-engineer.md

.pioneer/
├── workflow/            # Claude (Scrum Master)가 참조하는 워크플로우 문서
│   ├── scrum-master-guide.md
│   ├── task-management.md
│   ├── task-status-workflow.md
│   └── task-types.md
│
├── agents/              # 각 Agent의 상세 문서 및 메모리
│   ├── developer/
│   │   ├── workflow.md
│   │   └── memory/
│   │       ├── typescript-esm.md
│   │       ├── dependency-injection.md
│   │       ├── coding-rules.md
│   │       └── monorepo.md
│   └── test-engineer/
│       ├── workflow.md
│       └── memory/
│           └── testing-strategy.md
│
├── epics/               # Epic 폴더 (nested)
│   └── EPIC-{uuid}/
│       ├── epic.md      # Epic metadata
│       └── tasks/       # Task 파일들
│           └── TASK-{uuid}.md
│
└── scripts/             # CLI (epic-manager.sh, task-manager.sh)

docs/c4-model/          # C4 Model 아키텍처 다이어그램
├── 00-INDEX.puml       # LLM 진입점 (시작점)
├── lv1-system-context/ # Level 1: 시스템 컨텍스트
├── lv2-containers/     # Level 2: Apps + Packages
├── lv3-components/     # Level 3: 패키지 내부 컴포넌트
└── lv4-code/          # Level 4: 클래스/인터페이스
    └── sample-domain/  # 도메인별 클래스 다이어그램
```


---

## 🔄 다른 프로젝트에 적용

### 1. Pioneer 복사

```bash
cp -r /path/to/this/project/.claude /path/to/new/project/
cp -r /path/to/this/project/.pioneer /path/to/new/project/
cp /path/to/this/project/CLAUDE.md /path/to/new/project/
```

### 2. 기존 작업 제거

```bash
cd /path/to/new/project
rm -rf .pioneer/epics/EPIC-*
```

### 3. 프로젝트별 커스터마이징

**워크플로우** (`.pioneer/workflow/`):
- `task-types.md` - 프로젝트에서 사용할 Task 타입 정의
- `task-management.md` - Task 관리 프로세스 (필요시 수정)

**Agent Memory** (`.pioneer/agents/`):
- `.pioneer/agents/developer/memory/` - 기술 스택, 코딩 규칙
- `.pioneer/agents/test-engineer/memory/` - 테스트 전략

### 4. 첫 Epic 시작

```bash
.pioneer/scripts/epic-manager.sh create "첫 번째 기능" high
```

---

**마지막 업데이트**: 2025-10-30 | **버전**: PDK 2.2.0

> 💡 **핵심**:
> - `Claude = Scrum Master` (오케스트레이터)
> - `1 Epic = 1 Branch`
> - `main/master 브랜치 직접 작업 및 커밋 금지`
> - `C4 Model 다이어그램 기반 Epic/Task 분석` (docs/c4-model/)
> - 각 Agent는 자신의 memory만 참조
