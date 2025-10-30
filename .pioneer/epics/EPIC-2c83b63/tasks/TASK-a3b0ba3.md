---
id: TASK-a3b0ba3
title: REST API 엔드포인트 구현 (POST /api/notifications/email)
type: task
task_type: feat
status: DONE
priority: high
created: 2025-10-29T08:26:13Z
updated: 2025-10-29T09:09:58Z
assignee: test-engineer
epic: EPIC-2c83b63
dependencies: []
---

# TASK-a3b0ba3: REST API 엔드포인트 구현 (POST /api/notifications/email)

## Description

NotificationService를 REST API로 노출합니다. POST /api/notifications/email 엔드포인트를 구현하여 클라이언트가 HTTP 요청으로 이메일을 발송할 수 있도록 합니다.

Hono 프레임워크를 사용하여 구현하며, DI 패턴을 통해 NotificationService를 주입받아 사용합니다.

## Requirements

- [ ] POST /api/notifications/email 엔드포인트 구현
- [ ] Request Body: { to: string, subject: string, body: string }
- [ ] Response: { success: boolean, message: string }
- [ ] Request Body Validation (필수 필드 검증)
- [ ] NotificationService DI 연동
- [ ] 에러 처리 (400, 500)
- [ ] TypeScript ESM 규칙 준수 (.js 확장자)

## Expected Behavior

**Success Case (200)**:
```json
Request: POST /api/notifications/email
{
  "to": "user@example.com",
  "subject": "Welcome",
  "body": "Welcome to our service!"
}

Response: 200 OK
{
  "success": true,
  "message": "Email sent successfully"
}
```

**Validation Error (400)**:
```json
Request: POST /api/notifications/email
{
  "to": "user@example.com"
  // subject, body 누락
}

Response: 400 Bad Request
{
  "success": false,
  "message": "Missing required fields: subject, body"
}
```

**Server Error (500)**:
```json
Request: POST /api/notifications/email
{
  "to": "invalid-email",
  "subject": "Test",
  "body": "Test body"
}

Response: 500 Internal Server Error
{
  "success": false,
  "message": "Failed to send email"
}
```

## Tech Spec

### 파일 구조

```
apps/hono-api/src/
├── app.ts                          # 기존 파일 (라우트 추가)
└── routes/
    └── notification.routes.ts       # 신규 파일 (라우트 로직)
```

**파일 설명**:
- **notification.routes.ts**: POST /api/notifications/email 엔드포인트 구현
- **app.ts**: notification routes를 Hono 앱에 통합

### API 설계

**Endpoint**: `POST /api/notifications/email`

**Request**:
```json
{
  "to": "user@example.com",
  "subject": "Welcome",
  "body": "Welcome to our service!"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

**Response (400 Bad Request)** - Validation Error:
```json
{
  "success": false,
  "message": "Missing required fields: subject, body"
}
```

**Response (500 Internal Server Error)** - Service Error:
```json
{
  "success": false,
  "message": "Failed to send email"
}
```

### 타입 정의

타입은 `@pioncorp/sample-domain` 패키지의 기존 타입을 재사용합니다:

```typescript
// @pioncorp/sample-domain/src/notification/notification.types.ts
export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
```

**API Response 타입** (routes/notification.routes.ts에 정의):
```typescript
interface EmailApiResponse {
  success: boolean;
  message: string;
}
```

### 모듈 설계 (DI 패턴)

```typescript
// routes/notification.routes.ts
import 'reflect-metadata';
import { Hono } from 'hono';
import { container } from 'tsyringe';
import { Logger } from '@pioncorp/shared-core';
import { NotificationService } from '@pioncorp/sample-domain';
import type { SendEmailParams } from '@pioncorp/sample-domain';

interface EmailApiResponse {
  success: boolean;
  message: string;
}

export function createNotificationRoutes() {
  const app = new Hono();
  
  // DI Container에서 서비스 주입
  const logger = container.resolve(Logger).child('NotificationRoutes');
  const notificationService = container.resolve(NotificationService);

  app.post('/email', async (c) => {
    // 구현은 Developer가 담당
  });

  return app;
}
```

**app.ts 통합**:
```typescript
// app.ts에 추가
import { createNotificationRoutes } from './routes/notification.routes.js';

export function createApp() {
  // ... 기존 코드 ...

  // Notification routes 추가
  app.route('/api/notifications', createNotificationRoutes());

  return app;
}
```

### 구현 로직

**`createNotificationRoutes()` 함수 내 POST /email 핸들러**:

1. **Request Body 파싱**
   - `c.req.json()`으로 body 추출
   - `to`, `subject`, `body` 필드 확인

2. **입력 검증**
   - 필수 필드 존재 여부 확인
   - 누락된 필드가 있으면 400 에러 반환
   ```typescript
   const missingFields = [];
   if (!to) missingFields.push('to');
   if (!subject) missingFields.push('subject');
   if (!body) missingFields.push('body');
   
   if (missingFields.length > 0) {
     return c.json({
       success: false,
       message: `Missing required fields: ${missingFields.join(', ')}`
     }, 400);
   }
   ```

3. **NotificationService 호출**
   - `notificationService.sendEmail({ to, subject, body })` 실행
   - `SendEmailResult` 반환값 처리

4. **응답 처리**
   - **성공 케이스** (`result.success === true`):
     ```typescript
     return c.json({
       success: true,
       message: 'Email sent successfully'
     }, 200);
     ```
   
   - **실패 케이스** (`result.success === false`):
     ```typescript
     return c.json({
       success: false,
       message: result.error || 'Failed to send email'
     }, 500);
     ```

5. **예외 처리**
   - try-catch로 예상치 못한 에러 처리
   ```typescript
   try {
     // ... 로직 ...
   } catch (error) {
     logger.error('Unexpected error', { error });
     return c.json({
       success: false,
       message: 'Internal server error'
     }, 500);
   }
   ```

### 사용 기술

- **프레임워크**: Hono 4.x (기존 스택)
- **DI 컨테이너**: tsyringe (`container.resolve()`)
- **로깅**: `@pioncorp/shared-core` Logger
- **타입**: TypeScript strict mode
- **테스트**: Vitest (통합 테스트 포함)

### 파일별 상세 구현

**1. apps/hono-api/src/routes/notification.routes.ts** (신규):
```typescript
import 'reflect-metadata';
import { Hono } from 'hono';
import { container } from 'tsyringe';
import { Logger } from '@pioncorp/shared-core';
import { NotificationService } from '@pioncorp/sample-domain';
import type { SendEmailParams } from '@pioncorp/sample-domain';

interface EmailApiResponse {
  success: boolean;
  message: string;
}

export function createNotificationRoutes() {
  const app = new Hono();
  
  const logger = container.resolve(Logger).child('NotificationRoutes');
  const notificationService = container.resolve(NotificationService);

  app.post('/email', async (c) => {
    try {
      logger.info('POST /api/notifications/email');

      // 1. Request Body 파싱
      const body = await c.req.json<SendEmailParams>();
      const { to, subject, body: emailBody } = body;

      // 2. 입력 검증
      const missingFields: string[] = [];
      if (!to) missingFields.push('to');
      if (!subject) missingFields.push('subject');
      if (!emailBody) missingFields.push('body');

      if (missingFields.length > 0) {
        logger.warn('Validation failed', { missingFields });
        return c.json<EmailApiResponse>(
          {
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`,
          },
          400
        );
      }

      // 3. NotificationService 호출
      const result = await notificationService.sendEmail({
        to,
        subject,
        body: emailBody,
      });

      // 4. 응답 처리
      if (result.success) {
        logger.info('Email sent successfully', { messageId: result.messageId });
        return c.json<EmailApiResponse>(
          {
            success: true,
            message: 'Email sent successfully',
          },
          200
        );
      } else {
        logger.error('Failed to send email', { error: result.error });
        return c.json<EmailApiResponse>(
          {
            success: false,
            message: result.error || 'Failed to send email',
          },
          500
        );
      }
    } catch (error) {
      // 5. 예외 처리
      logger.error('Unexpected error', { error });
      return c.json<EmailApiResponse>(
        {
          success: false,
          message: 'Internal server error',
        },
        500
      );
    }
  });

  return app;
}
```

**2. apps/hono-api/src/app.ts** (수정):
```typescript
// 기존 import 아래에 추가
import { createNotificationRoutes } from './routes/notification.routes.js';

export function createApp() {
  // ... 기존 코드 ...

  // User endpoints
  // ... 기존 라우트 ...

  // Notification routes 추가
  app.route('/api/notifications', createNotificationRoutes());

  return app;
}
```

### Dependencies

**선행 작업**:
- TASK-f9e8c1a (NotificationService 구현) - 완료됨 ✅

**필수 패키지** (이미 설치됨):
- `hono`: ^4.0.0
- `@hono/node-server`: ^1.13.7
- `tsyringe`: ^4.8.0
- `@pioncorp/sample-domain`: * (workspace)
- `@pioncorp/shared-core`: * (workspace)

**환경 설정**:
- 없음 (NotificationService가 ConsoleEmailProvider 사용)

### 제약사항

1. **TypeScript ESM 규칙**
   - 모든 상대 경로 import는 `.js` 확장자 필수
   - 예: `import { foo } from './bar.js'`

2. **DI 패턴**
   - 서비스는 반드시 `container.resolve()`로 주입
   - 직접 `new NotificationService()` 금지

3. **타입 안정성**
   - `any` 타입 사용 금지
   - Request/Response 타입 명시

4. **에러 처리**
   - 모든 핸들러는 try-catch 필수
   - 적절한 HTTP 상태 코드 사용 (400, 500)

5. **로깅**
   - 모든 요청/응답/에러는 로깅 필수
   - 민감 정보(body 내용) 로깅 금지

### 테스트 요구사항

**통합 테스트 (Spec Test)**: `apps/hono-api/src/routes/notification.routes.spec.ts`

1. **Success Case (200)**
   - 모든 필드가 올바른 경우
   - 응답: `{ success: true, message: "Email sent successfully" }`

2. **Validation Error (400) - 모든 필드 누락**
   - Request: `{}`
   - 응답: `{ success: false, message: "Missing required fields: to, subject, body" }`

3. **Validation Error (400) - subject, body 누락**
   - Request: `{ "to": "user@example.com" }`
   - 응답: `{ success: false, message: "Missing required fields: subject, body" }`

4. **Server Error (500) - NotificationService 실패**
   - Mock NotificationService가 `{ success: false, error: "..." }` 반환
   - 응답: `{ success: false, message: "..." }` (500 상태 코드)

**커버리지 목표**: 85% 이상

### 검증 체크리스트

Developer 구현 완료 후 다음을 확인:

- [ ] `notification.routes.ts` 파일 생성됨
- [ ] `app.ts`에 라우트 통합됨
- [ ] 모든 import에 `.js` 확장자 포함
- [ ] DI 패턴 적용 (container.resolve)
- [ ] 입력 검증 로직 구현
- [ ] 에러 처리 (try-catch)
- [ ] 로깅 추가
- [ ] 타입 명시 (any 없음)
- [ ] 통합 테스트 작성
- [ ] 테스트 통과
- [ ] 타입 체크 통과 (`yarn type-check`)
- [ ] 빌드 성공 (`yarn build`)

## Work Log

### 2025-10-29 08:26 - scrum-master
- Task created

### 2025-10-29 08:35 - architect
- Tech spec 작성 완료
- 프레임워크 선택: Hono (기존 스택)
- 파일 구조 및 API 설계 완료
- Developer에게 할당

### 2025-10-29 08:39 - developer
- POST /api/notifications/email 엔드포인트 구현 완료
- 파일 생성: apps/hono-api/src/routes/notification.routes.ts
- 파일 수정: apps/hono-api/src/app.ts (라우트 통합)
- DI 패턴 적용 (NotificationService 주입)
- 입력 검증 로직 구현 (필수 필드 검증)
- 에러 처리 구현 (400, 500)
- ESM import 규칙 준수 (.js 확장자)
- 타입 체크 통과
- 빌드 성공
- Git Manager에게 커밋 요청 대기

## Status History

| Timestamp | Status | Agent | Note |
|-----------|--------|-------|------|
| 2025-10-29 08:26 | TODO | scrum-master | Task created |
| 2025-10-29 08:35 | READY_FOR_DEV | architect | Tech spec 작성 완료 |
| 2025-10-29 08:39 | IN_PROGRESS | developer | 코드 구현 완료, 검증 완료 |
| 2025-10-29 09:02 | IN_PROGRESS | jaehwankim | PoC: Epic 동기화 테스트 |
| 2025-10-29 09:09 | IN_PROGRESS | jaehwankim | 검증: Epic 단순화 후 동기화 테스트 |

## Artifacts

- Branch: feature/EPIC-2c83b63-notification-service
- Commit: c1a7b53 (feat: REST API 엔드포인트 구현)
- Files Modified:
  - apps/hono-api/src/routes/notification.routes.ts (신규)
  - apps/hono-api/src/app.ts (수정)

## Checklist

- [x] Tech spec written (Developer)
- [x] Code implemented (Developer)
- [x] Type check passed
- [x] Lint passed (설정 없음)
- [x] Build succeeded
- [x] Tests written (Test Engineer)
- [x] Tests passed (31/31)


### 2025-10-29 08:42 - git-manager
- REST API 구현 커밋 완료
- Commit: c1a7b53 (feat(notification): REST API 엔드포인트 구현)
- 파일 추가: apps/hono-api/src/routes/notification.routes.ts
- 파일 수정: apps/hono-api/src/app.ts
- 커밋 메시지: Conventional Commits 형식 (한글)
- Epic ID + Task ID 포함
- Test Engineer에게 테스트 작성 요청

### 2025-10-29 08:50 - test-engineer
- 통합 테스트 작성 완료
- 파일 생성: apps/hono-api/src/routes/notification.routes.spec.ts
- 파일 수정: apps/hono-api/src/app.spec.ts (DI 설정 추가)
- 테스트 통과: 31/31 (14개 notification routes 테스트 + 17개 기존 테스트)
- 커버리지: notification.routes.ts 86.15% (목표 85% 초과)
- 타입 체크: 통과
- 빌드: 성공

### Test Results
- [x] Success Case (200) - 이메일 발송 성공
- [x] Success Case (200) - 특수 문자 처리
- [x] Validation Error (400) - 모든 필드 누락
- [x] Validation Error (400) - subject, body 누락
- [x] Validation Error (400) - to 필드만 존재
- [x] Validation Error (400) - body 필드 누락
- [x] Validation Error (400) - 빈 문자열
- [x] Server Error (500) - EmailProvider 실패
- [x] Server Error (500) - 에러 메시지 없음
- [x] Server Error (500) - EmailProvider 예외 발생
- [x] Edge Case - 매우 긴 이메일 주소
- [x] Edge Case - 매우 긴 subject와 body
- [x] Edge Case - null 값 처리
- [x] Edge Case - X-Trace-ID 헤더 포함

### Coverage Report
```
File               | % Stmts | % Branch | % Funcs | % Lines
notification.routes.ts |   86.15 |     90.9 |     100 |   86.15
```

### Test Implementation Details
- Mock EmailProvider 사용 (NotificationService 의존성 해결)
- DI 컨테이너 적절히 설정 (Logger, EmailProvider, NotificationService)
- AAA 패턴 준수 (Arrange-Act-Assert)
- 타입 안정성 확보 (any 타입 없음)
- 명확한 테스트 네이밍
