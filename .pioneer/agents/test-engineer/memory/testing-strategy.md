# 테스트 전략

> Vitest 기반 테스트 가이드

## 테스트 러너

이 프로젝트는 **Vitest**를 테스트 러너로 사용합니다.

## 테스트 유형

| 유형 | 파일 네이밍 | 대상 | Mock 사용 | 커버리지 목표 |
|-----|------------|------|----------|-------------|
| **Unit Test** | `*.test.ts` | Service, Repository, Utils, Middleware (단위) | O | 80% 이상 |
| **Spec Test** | `*.spec.ts` | API 엔드포인트 (통합) | 일부 | 선택적 |

**용어 정리**:
- **Unit Test**: 개별 함수, 클래스, 모듈의 동작을 독립적으로 테스트
- **Spec Test**: HTTP 요청/응답 사이클 전체를 테스트 (라우팅, 미들웨어, 비즈니스 로직 포함)

## 테스트 파일 네이밍

- **단위 테스트**: `*.test.ts` (예: `user.service.test.ts`, `trace.middleware.test.ts`)
- **통합 테스트 (Spec)**: `*.spec.ts` (예: `app.spec.ts`)

## 위치 규칙

테스트 파일은 테스트 대상 코드와 **동일한 위치**에 배치합니다:

```
packages/sample-domain/src/user/
├── user.service.ts
├── user.service.test.ts       # 단위 테스트
├── user.types.ts
└── index.ts

apps/hono-api/src/
├── app.ts
├── app.spec.ts                # API 엔드포인트 통합 테스트
├── middleware/
│   ├── trace.middleware.ts
│   └── trace.middleware.test.ts  # 미들웨어 단위 테스트
└── index.ts
```

## Vitest 설정

### 1. 의존성 추가

```json
{
  "devDependencies": {
    "vitest": "^1.2.0",
    "@vitest/coverage-v8": "^1.2.0"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 2. vitest.config.ts 설정

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'dist/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/test-setup.ts',
        '**/__tests__/**',
        '**/__mocks__/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

### 3. test-setup.ts 설정

DI 컨테이너 초기화 및 전역 설정:

```typescript
import 'reflect-metadata';
import { beforeEach } from 'vitest';
import { container } from 'tsyringe';

/**
 * Test setup file for Vitest
 *
 * This file is automatically loaded before each test file.
 */

beforeEach(() => {
  // Clear all singleton instances from DI container
  // This ensures each test starts with a fresh container state
  container.clearInstances();
});
```

## Hono API 테스트 가이드

### API 엔드포인트 Spec 테스트

Hono 앱을 테스트하려면 app을 별도 모듈로 분리하여 export해야 합니다.

**1. app을 별도 파일로 분리**:

```typescript
// src/app.ts
import { Hono } from 'hono';
import { container } from 'tsyringe';
// ... imports

export function createApp() {
  const app = new Hono();

  // middleware, routes 설정
  app.use('*', traceMiddleware);
  app.get('/health', (c) => c.json({ status: 'ok' }));
  // ...

  return app;
}
```

```typescript
// src/index.ts
import { serve } from '@hono/node-server';
import { createApp } from './app.js';

const app = createApp();
serve({ fetch: app.fetch, port: 3000 });
```

**2. Spec 테스트 작성**:

```typescript
// src/app.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { createApp } from './app.js';

describe('Hono API - Health Check', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    container.clearInstances();
    app = createApp();
  });

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      // Arrange & Act
      const res = await app.request('/health');

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('status', 'ok');
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      // Arrange
      const newUser = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      // Act
      const res = await app.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      // Assert
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('name', newUser.name);
    });
  });
});
```

### 미들웨어 Unit 테스트

```typescript
// src/middleware/trace.middleware.test.ts
import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { traceMiddleware } from './trace.middleware.js';

describe('traceMiddleware', () => {
  it('should add X-Trace-ID header to response', async () => {
    // Arrange
    const app = new Hono();
    app.use('*', traceMiddleware);
    app.get('/test', (c) => c.json({ message: 'ok' }));

    // Act
    const res = await app.request('/test');

    // Assert
    expect(res.headers.get('X-Trace-ID')).toBeTruthy();
  });

  it('should use existing X-Trace-ID from request header', async () => {
    // Arrange
    const app = new Hono();
    app.use('*', traceMiddleware);
    app.get('/test', (c) => c.json({ message: 'ok' }));
    const existingTraceId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    // Act
    const res = await app.request('/test', {
      headers: { 'X-Trace-ID': existingTraceId },
    });

    // Assert
    expect(res.headers.get('X-Trace-ID')).toBe(existingTraceId);
  });
});
```

## DI 기반 Service 테스트

### 서비스 테스트 예시

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UserService } from './user.service.js';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    container.clearInstances();
    userService = container.resolve(UserService);
  });

  it('should create a user', async () => {
    // Arrange
    const input = {
      name: 'John Doe',
      email: 'john@example.com'
    };

    // Act
    const user = await userService.createUser(input);

    // Assert
    expect(user).toBeDefined();
    expect(user.name).toBe(input.name);
    expect(user.email).toBe(input.email);
  });
});
```

## 실행 명령어

```bash
# 모든 테스트
yarn test

# Watch 모드 (파일 변경 시 자동 재실행)
yarn test:watch

# 커버리지 포함
yarn test:coverage

# 특정 파일만
yarn test user.service

# 특정 패키지만 (Monorepo)
yarn workspace @pioncorp/hono-api test
```

## 커버리지 기준

### 목표

- **라인/함수/분기/구문 80% 이상** 필수

### 커버리지 제외

다음 파일들은 커버리지 측정에서 제외됩니다:

- `*.test.ts`, `*.spec.ts`
- `test-setup.ts`
- `__tests__/`, `__mocks__/`

## 테스트 작성 원칙

### 1. AAA 패턴

- **Arrange**: 테스트 준비
- **Act**: 동작 실행
- **Assert**: 결과 검증

```typescript
it('should return user by id', async () => {
  // Arrange
  const userId = '123';

  // Act
  const user = await userService.getById(userId);

  // Assert
  expect(user).toBeDefined();
  expect(user.id).toBe(userId);
});
```

### 2. 독립성

- 각 테스트는 독립적으로 실행 가능
- 테스트 간 상태 공유 금지

### 3. 명확한 테스트명

```typescript
// ✅ 올바름
it('should throw error when user not found', () => { });

// ❌ 잘못됨
it('test1', () => { });
```

### 4. 타입 안정성 (any 타입 금지)

**⚠️ 중요**: 테스트 코드에서도 `any` 타입 사용을 금지합니다.

API 응답 타입을 명시적으로 정의하여 타입 안정성을 확보합니다.

```typescript
// ❌ 잘못됨 - any 타입 사용
it('should return user', async () => {
  const res = await app.request('/users/123');
  const body = (await res.json()) as any;  // ❌ any 금지!
  expect(body.id).toBe('123');
});

// ✅ 올바름 - 명시적 타입 정의
interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

it('should return user', async () => {
  const res = await app.request('/users/123');
  const body = (await res.json()) as UserResponse;  // ✅ 명시적 타입
  expect(body.id).toBe('123');
});
```

**타입 정의 위치**:
```typescript
// 테스트 파일 상단에 응답 타입 정의
interface HealthCheckResponse {
  status: string;
  timestamp: string;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface ErrorResponse {
  error: string;
}

describe('API Tests', () => {
  it('should return health status', async () => {
    const res = await app.request('/health');
    const body = (await res.json()) as HealthCheckResponse;
    expect(body.status).toBe('ok');
  });
});
```

**장점**:
- 타입 안정성 확보
- IDE 자동완성 지원
- 리팩토링 시 타입 오류 조기 발견
- 테스트 코드 가독성 향상

## 관련 문서

- [Test Engineer 워크플로우](../../../../.claude/agents/test-engineer.md)
- [Dependency Injection](../../developer/memory/dependency-injection.md)
- [코드 작성 규칙](../../developer/memory/coding-rules.md)
