---
id: TASK-ab844f1
title: Level 1: System Context 다이어그램 개선 및 재작성
type: task
task_type: docs
status: DONE
priority: high
created: 2025-10-30T10:51:23Z
updated: 2025-10-30T11:08:19Z
assignee: developer
epic: EPIC-cc084e2
dependencies: []
---

# TASK-ab844f1: Level 1: System Context 다이어그램 개선 및 재작성

## Description

Level 1 System Context 다이어그램을 개선합니다. Level 2, 3 다이어그램의 상세 정보를 반영하여:
- CampHost 시스템 설명 강화 (기능, 기술 스택)
- 사용자(Actor) 역할 명확화
- 외부 시스템 설명 상세화
- 관계 설명 개선

## Requirements

- [x] CampHost 시스템 설명 강화 (주요 기능, 기술 스택, 아키텍처)
- [x] Actor 역할 구체화 (Super Admin, Campground Admin, Camper)
- [x] 외부 시스템 설명 상세화 (Supabase 테이블, Resend 이메일 종류)
- [x] 관계 설명 개선 (사용자-시스템, 시스템-외부 시스템)
- [x] Notes 섹션 업데이트
- [x] 동기화 체크리스트 업데이트

## Tech Spec

### 작업 대상 파일
- `docs/c4-model/lv1-system-context/system.puml`

### 개선 방향

**1. CampHost 시스템 설명 강화**
- Level 2의 Container 정보 반영
  - Web Application (Next.js 14.2, React 18, TypeScript)
  - REST API (Next.js API Routes)
  - Browser Storage (localStorage)
- 주요 기능 명시
  - 무인 체크인/체크아웃 자동화
  - 예약 관리 및 매출 통계
  - QR 코드 기반 인증
  - 이메일 알림
- 아키텍처 특징 추가
  - Next.js App Router
  - SSR/SSG/CSR 하이브리드

**2. Actor 역할 명확화**
- Super Admin
  - 전체 캠핑장 CRUD
  - 시스템 모니터링
  - QR 코드 생성 및 배포
  - 개발 도구 사용
- Campground Admin
  - 예약 조회/수정/삭제
  - 매출 통계 확인
  - 문의 관리
  - 캠핑장 설정 관리
- Camper
  - QR 코드 스캔 체크인/체크아웃
  - 예약 정보 조회
  - 문의 작성

**3. 외부 시스템 상세화**
- Supabase
  - 역할: PostgreSQL 데이터베이스
  - 주요 테이블: campgrounds, reservations, inquiries, dashboard_metrics (view)
  - 접근 방식: REST API + Row Level Security
  - 폴백: localStorage (오프라인)
- Resend
  - 역할: 이메일 발송 서비스
  - 이메일 종류: 체크인 알림, 비밀번호 재설정, 회원정보 문의
  - API: REST API (POST /emails)

**4. 관계 설명 개선**
- 사용자 → CampHost: 각 역할별 주요 활동 명시
- CampHost → Supabase: CRUD 작업 상세화
- CampHost → Resend: 이메일 종류별 용도 명시

**5. Notes 업데이트**
- CampHost: 주요 페이지 및 아키텍처 특징 추가
- Supabase: 테이블별 역할 설명
- Resend: 이메일 템플릿 종류

**6. 동기화 체크리스트**
- 외부 시스템 추가 시 절차
- 사용자 역할 변경 시 절차
- 시스템 기능 추가 시 절차
- Level 2 동기화 확인 사항

## Work Log

### 2025-10-30 10:51 - scrum-master
- Task created

### 2025-10-30 11:10 - developer
- Tech Spec 작성 완료
- Level 1 System Context 다이어그램 개선 완료
- 개선 사항:
  1. CampHost 시스템 설명 강화
     - 핵심 기능 명시 (무인 체크인/체크아웃, 예약 관리, QR 코드 인증, 이메일 알림, 오프라인 지원)
     - 기술 스택 명시 (Next.js 14.2, React 18.3, TypeScript 5.4, Supabase, Resend)
     - 아키텍처 특징 추가 (SSR/SSG/CSR, REST API, Browser Storage)
  2. Actor 역할 명확화
     - Super Admin: 캠핑장 CRUD, 시스템 모니터링, QR 코드 생성, 개발 도구
     - Campground Admin: 예약 관리, 매출 통계, 문의 관리, 설정 관리
     - Camper: QR 체크인/체크아웃, 예약 조회, 문의 작성
  3. 외부 시스템 설명 상세화
     - Supabase: 테이블 구조, RLS, localStorage 폴백 전략
     - Resend: 이메일 템플릿 종류, 수신자, 에러 처리
  4. 관계 설명 개선
     - 각 Actor의 주요 기능 및 페이지 명시
     - CampHost-Supabase CRUD 작업 상세화
     - CampHost-Resend 이메일 종류별 용도 명시
  5. Notes 섹션 업데이트
     - CampHost: 주요 페이지, 아키텍처 특징, 주요 컨테이너
     - Supabase: 테이블 상세, 보안, 폴백 전략
     - Resend: 이메일 템플릿, 수신자, 에러 처리
  6. 동기화 체크리스트 강화
     - 외부 시스템, 사용자 역할, 시스템 기능, 기술 스택, 외부 통합 변경 시 절차
     - Level 2 동기화 확인 사항 추가
- 작업 완료: docs/c4-model/lv1-system-context/system.puml

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-30 10:51 | TODO | scrum-master | Task created |
| 2025-10-30 11:04 | IN_PROGRESS | developer | Starting Level 1 System Context improvement |
| 2025-10-30 11:06 | READY_FOR_REVIEW | scrum-master | Level 1 System Context 다이어그램 개선 완료 - 리뷰 요청 |
| 2025-10-30 11:08 | DONE | developer | Level 1 System Context improved |

## Artifacts

- Branch: feature/EPIC-cc084e2
- Commit: (pending)
- Files Modified:
  - docs/c4-model/lv1-system-context/system.puml

## Checklist

- [x] Work completed (Developer)
- [x] Build succeeded (N/A - Documentation task)

