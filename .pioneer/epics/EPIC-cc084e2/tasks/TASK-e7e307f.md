---
id: TASK-e7e307f
title: Level 4: Services 다이어그램 작성 (reservation, campground, notification)
type: task
task_type: docs
status: DONE
priority: high
created: 2025-10-30T10:51:22Z
updated: 2025-10-30T10:55:37Z
assignee: developer
epic: EPIC-cc084e2
dependencies: []
---

# TASK-e7e307f: Level 4: Services 다이어그램 작성 (reservation, campground, notification)

## Description

Level 4 (Code 레벨) Services 다이어그램 작성. CampHost의 핵심 서비스 레이어를 PlantUML 클래스 다이어그램으로 표현합니다.

## Requirements

- [x] reservation-service.puml: lib/reservations.ts 분석 및 다이어그램 작성
- [x] campground-service.puml: lib/campground.ts, lib/campgrounds.ts 분석 및 다이어그램 작성
- [x] notification-service.puml: app/api/notify/checkin/route.ts 분석 및 다이어그램 작성
- [x] 각 다이어그램에 클래스, 메서드, 속성, 타입 정보 포함
- [x] 외부 의존성 (Supabase, Resend, localStorage) 표시
- [x] 한글 주석으로 설명 추가
- [x] 코드 경로 주석 포함

## Tech Spec

### 설계 개요

Level 4 (Code 레벨)는 C4 Model의 가장 상세한 레벨로, 클래스/함수/인터페이스 수준의 코드 구조를 표현합니다.

### 다이어그램 구조

**1. reservation-service.puml** (lib/reservations.ts)
- Reservation 타입 정의
- 함수 기반 서비스 (Functional Programming)
- localStorage CRUD 연산
- 초기 샘플 데이터 관리
- 예약 검색 및 상태 업데이트

**2. campground-service.puml** (lib/campground.ts + lib/campgrounds.ts)
- 두 개의 독립적인 서비스 표현:
  - CampgroundInfoService: 단일 캠핑장 정보 관리
  - CampgroundsService: 전체 캠핑장 관리 + Super Admin
- Campground, CampgroundInfo, SuperAdmin 타입 정의
- localStorage + Supabase UUID 동기화
- 캠핑장 상태 및 구독 플랜 관리
- 검색 및 필터링 기능

**3. notification-service.puml** (app/api/notify/checkin/route.ts)
- Next.js API Route 구조
- Resend SDK 통합
- 환경 변수 설정
- 이메일 발송 흐름 및 에러 처리

### PlantUML 스타일

- C4 Model PlantUML 라이브러리 사용
- class diagram 형식
- package로 논리적 그룹화
- note로 상세 설명 추가
- legend로 사용 예시 및 설정 가이드 제공
- 🔗 코드 경로 주석 포함

### 외부 의존성

- **localStorage**: Browser Storage API (클라이언트 사이드)
- **Supabase**: PostgreSQL 데이터베이스 (UUID 동기화)
- **Resend**: 이메일 서비스 (체크인 알림)
- **Next.js**: App Router API Routes (서버 사이드)

## Work Log

### 2025-10-30 10:51 - scrum-master
- Task created

### 2025-10-30 19:50 - developer
- Tech Spec 작성 완료
- 코드 분석 완료:
  - lib/reservations.ts: 예약 데이터 관리 유틸리티 (함수 기반)
  - lib/campground.ts: 단일 캠핑장 정보 관리
  - lib/campgrounds.ts: 전체 캠핑장 관리 + Super Admin 인증
  - app/api/notify/checkin/route.ts: Next.js API Route (Resend 통합)
- PlantUML 다이어그램 작성 완료:
  - docs/c4-model/lv4-code/services/reservation-service.puml
  - docs/c4-model/lv4-code/services/campground-service.puml
  - docs/c4-model/lv4-code/services/notification-service.puml
- 각 다이어그램에 클래스, 메서드, 타입, 외부 의존성 포함
- 한글 주석 및 사용 예시 추가

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 10:51 | TODO | scrum-master | Task created |
| 2025-10-30 10:52 | IN_PROGRESS | developer | Starting Level 4 Services diagrams |
| 2025-10-30 10:54 | READY_FOR_COMMIT | scrum-master | Level 4 Services 다이어그램 작성 완료 (reservation, campground, notification) |
| 2025-10-30 10:55 | DONE | developer | Level 4 Services diagrams completed |

## Artifacts

- Branch: feature/EPIC-cc084e2
- Commit: (Scrum Master가 생성 예정)
- Files Modified:
  - docs/c4-model/lv4-code/services/reservation-service.puml (NEW)
  - docs/c4-model/lv4-code/services/campground-service.puml (NEW)
  - docs/c4-model/lv4-code/services/notification-service.puml (NEW)

## Checklist

- [x] Work completed (Developer)
- [x] Documentation written (PlantUML diagrams)

