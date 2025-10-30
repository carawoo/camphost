---
id: TASK-f68da92
title: Level 3: API 컴포넌트 다이어그램 작성
type: task
task_type: docs
status: DONE
priority: high
created: 2025-10-30T10:51:23Z
updated: 2025-10-30T11:04:03Z
assignee: developer
epic: EPIC-cc084e2
dependencies: []
---

# TASK-f68da92: Level 3: API 컴포넌트 다이어그램 작성

## Description

Level 3 API 컴포넌트 다이어그램을 작성합니다. REST API Container 내부의 주요 API 엔드포인트를 컴포넌트로 표현하고, 외부 서비스와의 관계를 명시합니다.

## Requirements

- [x] PlantUML C4_Component diagram 사용
- [x] Container(api) 내부에 Component 정의
- [x] Admin Login API 컴포넌트 표현
- [x] Email Notification APIs 컴포넌트 표현
- [x] Checkin Notification API 컴포넌트 표현
- [x] Dev Tools API 컴포넌트 표현
- [x] 각 API와 외부 서비스 연결 (Supabase, Resend)
- [x] 한글 설명 추가
- [x] 코드 경로 주석 포함

## Tech Spec

### 설계 개요

**파일**: `docs/c4-model/lv3-components/api.puml`

**다이어그램 타입**: C4_Component (Level 3)

**구조**:
- Container(api) 내부의 Component들을 표현
- 5개 주요 API 컴포넌트:
  1. Admin Login API - 관리자 인증
  2. Checkin Notification API - 체크인 이메일 알림
  3. Reset Password Email API - 비밀번호 재설정 이메일
  4. Help Email API - 회원정보 문의 이메일
  5. Dev Tools API - 개발용 유틸리티 API
- 외부 시스템과의 관계: Supabase, Resend

### 컴포넌트별 분석

**1. Admin Login API** (`app/api/admin/login/route.ts`):
- POST 메서드 지원
- Supabase에서 캠핑장 조회 및 비밀번호 검증
- 삭제된 캠핑장 로그인 차단
- 폴백: 하드코딩된 credential 목록

**2. Checkin Notification API** (`app/api/notify/checkin/route.ts`):
- POST 메서드 지원
- Resend로 체크인 알림 이메일 발송
- 환경 변수: RESEND_API_KEY, NOTIFY_EMAIL

**3. Reset Password Email API** (`app/api/admin/reset-email/route.ts`):
- POST 메서드 지원
- Resend로 비밀번호 재설정 요청 이메일 발송
- HTML 템플릿 사용

**4. Help Email API** (`app/api/admin/help-email/route.ts`):
- POST 메서드 지원
- Resend로 회원정보 문의 이메일 발송
- HTML 템플릿 사용

**5. Dev Tools API**:
- `app/api/dev/seed-reservation/route.ts`: GET 메서드, 테스트 예약 데이터 생성
- `app/api/dev/cascade-delete/route.ts`: GET 메서드, 캠핑장 및 관련 데이터 삭제

### 외부 서비스 관계

**Supabase**:
- Admin Login API: 캠핑장 조회 및 인증
- Dev Tools API: CRUD 작업

**Resend**:
- Checkin Notification API: 이메일 발송
- Reset Password Email API: 이메일 발송
- Help Email API: 이메일 발송

### 다이어그램 구조

```
System_Boundary(camphost) {
  Container_Boundary(api) {
    Component(adminLoginAPI)
    Component(checkinNotificationAPI)
    Component(resetPasswordEmailAPI)
    Component(helpEmailAPI)
    Component(devToolsAPI)
  }
}

System_Ext(supabase)
System_Ext(resend)

Relationships:
- adminLoginAPI → supabase (조회 및 인증)
- devToolsAPI → supabase (CRUD)
- checkinNotificationAPI → resend (이메일 발송)
- resetPasswordEmailAPI → resend (이메일 발송)
- helpEmailAPI → resend (이메일 발송)
```

## Work Log

### 2025-10-30 10:51 - scrum-master
- Task created

### 2025-10-30 11:05 - developer
- Tech Spec 작성 완료
- API 디렉토리 구조 분석 완료
  - app/api/admin/login/route.ts - 관리자 로그인 인증
  - app/api/notify/checkin/route.ts - 체크인 알림
  - app/api/admin/reset-email/route.ts - 비밀번호 재설정 이메일
  - app/api/admin/help-email/route.ts - 회원정보 문의 이메일
  - app/api/dev/seed-reservation/route.ts - 테스트 데이터 생성
  - app/api/dev/cascade-delete/route.ts - 캐스케이드 삭제
- Level 3 API 컴포넌트 다이어그램 작성 완료
  - docs/c4-model/lv3-components/api.puml
  - 5개 주요 API 컴포넌트 표현
  - 외부 시스템 관계 (Supabase, Resend) 명시
  - 한글 설명 및 코드 경로 주석 추가
- 작업 완료: READY_FOR_REVIEW

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 10:51 | TODO | scrum-master | Task created |
| 2025-10-30 11:00 | IN_PROGRESS | developer | Starting Level 3 API components |
| 2025-10-30 11:03 | READY_FOR_REVIEW | scrum-master | Level 3 API 컴포넌트 다이어그램 작성 완료 - 5개 API 컴포넌트 표현 |
| 2025-10-30 11:04 | DONE | developer | API components completed |

## Artifacts

- Branch: feature/EPIC-cc084e2
- Commit: (pending)
- Files Modified:
  - docs/c4-model/lv3-components/api.puml (created)

## Checklist

- [x] Work completed (Developer)
- [x] Tech Spec written
- [x] API structure analyzed
- [x] Level 3 diagram created (api.puml)
- [x] Components defined (5 APIs)
- [x] External system relationships mapped
- [x] Korean descriptions added
- [x] Code path comments included
- [x] Sync checklist added

