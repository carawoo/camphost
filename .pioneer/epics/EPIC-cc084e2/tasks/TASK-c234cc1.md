---
id: TASK-c234cc1
title: Level 4: Types/Domain Models 다이어그램 작성
type: task
task_type: docs
status: DONE
priority: medium
created: 2025-10-30T10:51:22Z
updated: 2025-10-30T11:00:22Z
assignee: developer
epic: EPIC-cc084e2
dependencies: []
---

# TASK-c234cc1: Level 4: Types/Domain Models 다이어그램 작성

## Description

Level 4 (Code) 레벨의 Types/Domain Models 다이어그램을 작성합니다. src/types/index.ts 파일의 모든 타입 정의를 PlantUML class diagram으로 표현합니다.

## Requirements

- [x] src/types/index.ts 분석 완료
- [x] PlantUML class diagram 형식으로 작성
- [x] 모든 타입의 속성 및 타입 명시
- [x] 타입 간 관계 화살표로 표현
- [x] enum, interface 구분하여 표현
- [x] 한글 주석으로 각 타입 설명 추가
- [x] 🔗 코드 경로 주석 포함
- [x] docs/c4-model/lv4-code/types/domain-models.puml 파일 생성

## Tech Spec

### 설계 개요
- 파일 위치: `docs/c4-model/lv4-code/types/domain-models.puml`
- 형식: PlantUML class diagram
- 기반 코드: `src/types/index.ts`

### 다이어그램 구조

**1. 공통 Base 타입**:
- BaseEntity: id, createdAt, updatedAt

**2. 도메인 엔티티** (BaseEntity 상속):
- User: 사용자 (name, email, phone, role)
- Campground: 캠핑장 (name, owner, contactInfo, status, subscriptionPlan 등)
- Reservation: 예약 (guest, campground, roomNumber, checkInDate, status 등)

**3. Enum 타입**:
- UserRole: super_admin, campground_owner, guest
- CampgroundStatus: active, pending, suspended, terminated
- SubscriptionPlan: basic, premium, enterprise
- ReservationStatus: confirmed, checked-in, checked-out, cancelled

**4. 복합 타입**:
- ContactInfo: phone, email

**5. API 관련 타입**:
- ApiResponse<T>: 제네릭 API 응답 (success, data, error, message)
- PaginatedResponse<T>: 페이지네이션 응답 (pagination 정보 포함)
- PaginationInfo: page, limit, total, totalPages

**6. UI 관련 타입**:
- FormState<T>: 폼 상태 관리 (data, errors, isSubmitting, isValid)
- FilterOptions: 필터/검색 옵션
- BaseComponentProps: className, children
- ModalProps: BaseComponentProps + isOpen, onClose, title
- TableColumn<T>: 테이블 컬럼 정의

**7. 상태 관리 타입**:
- AppState: user, campgrounds, reservations, isLoading, error
- Action<T>: type, payload

**8. 설정 타입**:
- AppConfig: apiBaseUrl, storageKeys, defaultPagination
- StorageKeys: user, campgrounds, reservations, campgroundInfo, superAdmin
- DefaultPagination: page, limit

### 타입 관계

**상속 관계**:
- User, Campground, Reservation → BaseEntity 상속
- ModalProps → BaseComponentProps 상속

**포함 관계**:
- Campground → User (owner), ContactInfo
- Reservation → User (guest), Campground
- PaginatedResponse → PaginationInfo
- AppState → User, Campground[], Reservation[]
- AppConfig → StorageKeys, DefaultPagination

**사용 관계**:
- User → UserRole
- Campground → CampgroundStatus, SubscriptionPlan
- Reservation → ReservationStatus
- FilterOptions → CampgroundStatus

**제네릭 관계**:
- ApiResponse<T>, PaginatedResponse<T>, FormState<T>, TableColumn<T>, Action<T>

### 스타일 가이드
- C4 PlantUML 템플릿 사용
- 각 타입 그룹별로 섹션 구분
- note로 한글 설명 추가
- legend로 전체 구조 및 사용 예시 설명
- 레이아웃 힌트로 가독성 향상

## Work Log

### 2025-10-30 10:51 - scrum-master
- Task created

### 2025-10-30 11:05 - developer
- Tech Spec 작성 완료
- src/types/index.ts 분석 완료
- docs/c4-model/lv4-code/types/ 디렉토리 생성
- domain-models.puml 파일 작성 완료
  - 10개 타입 그룹 정의
  - 4개 Enum 타입 정의
  - 타입 간 관계 명시 (상속, 포함, 사용)
  - 제네릭 타입 5개 정의
  - 한글 주석 및 사용 예시 추가

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 10:51 | TODO | scrum-master | Task created |
| 2025-10-30 10:57 | IN_PROGRESS | developer | Starting Level 4 Types/Domain Models diagrams |
| 2025-10-30 10:59 | READY_FOR_COMMIT | scrum-master | Level 4 Types/Domain Models 다이어그램 작성 완료 (docs task, 테스트 불필요) |
| 2025-10-30 11:00 | DONE | developer | Level 4 Types/Domain Models diagrams completed |

## Artifacts

- Branch: feature/EPIC-cc084e2
- Commit: (Scrum Master가 커밋)
- Files Modified:
  - docs/c4-model/lv4-code/types/domain-models.puml (새 파일)

## Checklist

- [x] Tech spec written (Developer)
- [x] Work completed (Developer)
- [x] PlantUML diagram created
- [x] Type relationships defined
- [x] Korean comments added

