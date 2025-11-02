---
id: EPIC-e343463
title: 캠핑장 사장님 자가 회원가입 기능 추가
type: epic
status: TODO
priority: high
created: 2025-11-02T07:11:23Z
updated: 2025-11-02T07:11:23Z
branch: "feature/EPIC-e343463"
pr_url: ""
---

# Epic: 캠핑장 사장님 자가 회원가입 기능 추가

## Description

캠핑장 사장님이 슈퍼어드민의 승인 없이 직접 회원가입하여 바로 어드민 서비스를 이용할 수 있도록 자가 회원가입 기능을 추가합니다.

**현재 문제:**
- 슈퍼어드민이 수동으로 캠핑장을 등록해야 사장님이 로그인 가능
- 사장님이 바로 서비스를 시작할 수 없어 진입장벽이 높음

**목표:**
- 어드민 로그인 페이지에 회원가입 기능 추가
- 회원가입 즉시 active 상태로 서비스 이용 가능
- 회원가입 후 자동 로그인하여 대시보드로 이동

**핵심 기능:**
1. 회원가입 폼: 캠핑장 이름, 비밀번호, 담당자명, 연락처, 이메일
2. Supabase campgrounds 테이블에 자동 등록
3. 중복 캠핑장 이름 검증
4. 이메일 인증 (향후 추가 가능)

## Tasks

### Phase 1: UI/UX
- [ ] TASK-001: 어드민 로그인 페이지에 회원가입 탭/모달 추가 [high]

### Phase 2: Backend
- [ ] TASK-002: 회원가입 API 엔드포인트 구현 (/api/admin/register) [high]
- [ ] TASK-003: 캠핑장 이름 중복 검증 로직 추가 [medium]

### Phase 3: Integration
- [ ] TASK-004: 회원가입 성공 시 자동 로그인 및 대시보드 이동 [high]
- [ ] TASK-005: 에러 처리 및 사용자 피드백 개선 [medium]

### Phase 4: Testing
- [ ] TASK-006: 회원가입 API 테스트 작성 [medium]

**Total**: 0/6 Tasks (0%)

## Checklist

- [ ] All Tasks completed (CANCELLED excluded)
- [ ] Build succeeded
- [ ] All tests passed
- [ ] PR created
- [ ] Code reviewed and approved
- [ ] PR merged to main

