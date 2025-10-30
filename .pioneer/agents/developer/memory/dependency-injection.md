# Dependency Injection 패턴

> tsyringe를 사용한 DI 패턴 가이드

## 핵심 원칙

**모든 서비스는 tsyringe를 사용한 DI 패턴을 따릅니다.**

## DI 패턴 구현

### 패턴 1: 구체 클래스 직접 주입 (권장)

가장 간단하고 명확한 방식입니다. **대부분의 경우 이 패턴을 사용하세요.**

**예시: UserService**

```typescript
// packages/sample-domain/src/user/user.service.ts
import 'reflect-metadata';
import { injectable, singleton } from 'tsyringe';
import { Logger } from '@pioncorp/shared-core';

@singleton()
@injectable()
export class UserService {
  constructor(private logger: Logger) {
    this.logger = logger.child('UserService');
  }

  async getAllUsers(): Promise<User[]> {
    this.logger.info('Getting all users');
    // ...
  }
}
```

**사용:**

```typescript
// apps/hono-api/src/app.ts
import { container } from 'tsyringe';
import { UserService } from '@pioncorp/sample-domain';

// DI 등록 불필요 - tsyringe가 자동으로 해결
const userService = container.resolve(UserService);
```

**특징:**
- ✅ DI 등록 코드 불필요
- ✅ 타입 안정성 보장
- ✅ 코드 간결
- ✅ 대부분의 경우 충분

### 패턴 2: 의존성이 있는 서비스

다른 서비스에 의존하는 경우에도 동일한 패턴을 사용합니다.

**예시: NotificationService**

```typescript
// packages/sample-domain/src/notification/notification.service.ts
import 'reflect-metadata';
import { injectable, singleton } from 'tsyringe';
import { Logger } from '@pioncorp/shared-core';
import { ConsoleEmailProvider } from './notification.types.js';

@singleton()
@injectable()
export class NotificationService {
  private logger: Logger;

  constructor(
    private readonly emailProvider: ConsoleEmailProvider,
    logger: Logger
  ) {
    this.logger = logger.child('NotificationService');
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    this.logger.info('Sending email', { to: params.to });
    return this.emailProvider.send(params);
  }
}
```

**EmailProvider 구현:**

```typescript
// packages/sample-domain/src/notification/notification.types.ts
export class ConsoleEmailProvider implements EmailProvider {
  async send(params: SendEmailParams): Promise<SendEmailResult> {
    console.log('[ConsoleEmailProvider]', params);
    return { success: true, messageId: randomUUID() };
  }
}
```

**사용:**

```typescript
// apps/hono-api/src/routes/notification.routes.ts
import { container } from 'tsyringe';
import { NotificationService } from '@pioncorp/sample-domain';

// DI 등록 불필요 - 자동 해결
const notificationService = container.resolve(NotificationService);
```

**특징:**
- ✅ 모든 의존성이 자동으로 해결됨
- ✅ NotificationService → ConsoleEmailProvider → Logger 순서로 주입
- ✅ 프로덕션에서 구현체 교체 가능 (아래 참조)

### 패턴 3: 프로덕션 구현체 교체 (고급)

개발 환경에서는 `ConsoleEmailProvider`를 사용하지만, 프로덕션에서는 실제 이메일 서비스를 사용해야 할 때 인터페이스 + 토큰 패턴을 사용할 수 있습니다.

**1단계: 인터페이스 + 토큰 정의**

```typescript
// packages/sample-domain/src/notification/notification.types.ts
export interface EmailProvider {
  send(params: SendEmailParams): Promise<SendEmailResult>;
}

// DI 토큰
export const EMAIL_PROVIDER_TOKEN = 'EmailProvider';
```

**2단계: 서비스에서 토큰으로 주입**

```typescript
import { inject, injectable, singleton } from 'tsyringe';
import { EMAIL_PROVIDER_TOKEN } from './notification.types.js';

@singleton()
@injectable()
export class NotificationService {
  constructor(
    @inject(EMAIL_PROVIDER_TOKEN) private emailProvider: EmailProvider,
    logger: Logger
  ) {}
}
```

**3단계: 환경별 구현체 등록**

```typescript
// apps/hono-api/src/app.ts
import { container } from 'tsyringe';
import {
  EMAIL_PROVIDER_TOKEN,
  ConsoleEmailProvider,
  SendGridEmailProvider,
} from '@pioncorp/sample-domain';

export function createApp() {
  // 환경에 따라 다른 구현체 등록
  if (process.env.NODE_ENV === 'production') {
    container.register(EMAIL_PROVIDER_TOKEN, {
      useClass: SendGridEmailProvider,  // 프로덕션: SendGrid
    });
  } else {
    container.register(EMAIL_PROVIDER_TOKEN, {
      useClass: ConsoleEmailProvider,   // 개발: 콘솔 출력
    });
  }

  // ...
}
```

**언제 사용할까?**
- ❌ **대부분의 경우**: 패턴 1 (구체 클래스 직접 주입)으로 충분
- ✅ **환경별 구현체 교체 필요**: 개발/프로덕션에서 다른 구현 사용
- ✅ **외부 의존성 Mock**: 테스트에서 외부 API를 Mock으로 교체

**현재 프로젝트:**
- UserService: 패턴 1 사용 (구현체 교체 불필요)
- NotificationService: 패턴 1 사용 (현재는 ConsoleEmailProvider만 사용)
- 프로덕션 이메일 필요 시 → 패턴 3으로 전환

## DI 규칙

### 1. 데코레이터 사용

- **모든 서비스**: `@singleton()` + `@injectable()` 데코레이터 필수
- **순서**: `@singleton()`이 위, `@injectable()`이 아래

```typescript
// ✅ 올바름
@singleton()
@injectable()
export class MyService { }

// ❌ 잘못됨 - 데코레이터 누락
export class MyService { }

// ❌ 잘못됨 - 순서 잘못됨
@injectable()
@singleton()
export class MyService { }
```

### 2. 생성자 주입

- **의존성은 생성자를 통해 주입**
- private/public 접근 제어자 사용

```typescript
// ✅ 올바름
constructor(private logger: Logger, private userRepo: UserRepository) { }

// ❌ 잘못됨 - 생성자 외부에서 주입
export class MyService {
  logger: Logger;

  setLogger(logger: Logger) {
    this.logger = logger;
  }
}
```

### 3. reflect-metadata import

- **모든 진입점에서 import 필수**
- 앱의 최상단 파일 (예: `index.ts`, `main.ts`)

```typescript
// ✅ apps/hono-api/src/index.ts
import 'reflect-metadata';
import { serve } from '@hono/node-server';
// ...
```

## 테스트에서 DI 활용

```typescript
// test-setup.ts
import 'reflect-metadata';
import { beforeEach } from 'vitest';
import { container } from 'tsyringe';

beforeEach(() => {
  // DI 컨테이너 초기화
  container.clearInstances();
});
```

## 관련 문서

- [코드 작성 규칙](./coding-rules.md)
- [패키지 개발 규칙](./package-guidelines.md)
- [테스트 전략](../../test-engineer/memory/testing-strategy.md)
