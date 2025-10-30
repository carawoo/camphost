# 코드 작성 규칙

> 일관된 코드 스타일 및 품질을 위한 규칙

## 1. Import 규칙

**Import 순서 및 확장자 규칙은 [TypeScript & ESM 가이드](../tech-stack/typescript-esm.md#import-순서)를 참조하세요.**

## 2. 파일 네이밍

| 파일 유형 | 네이밍 규칙 | 예시 |
|----------|------------|------|
| Service | `*.service.ts` | `user.service.ts` |
| Types | `*.types.ts` | `user.types.ts` |
| Utils | `*.util.ts` 또는 `*.utils.ts` | `string.util.ts` |
| Index | `index.ts` | `index.ts` (barrel export) |
| Config | `*.config.ts` | `database.config.ts` |

## 3. 클래스 네이밍

### PascalCase 사용

```typescript
// ✅ 올바름
export class UserService { }
export class Logger { }
export class DatabaseConnection { }

// ❌ 잘못됨
export class userService { }
export class logger { }
```

## 4. 함수 및 변수 네이밍

### camelCase 사용

```typescript
// ✅ 올바름
const userName = 'John';
function getUserById(id: string) { }

// ❌ 잘못됨
const UserName = 'John';
function GetUserById(id: string) { }
```

## 5. 상수 네이밍

### UPPER_SNAKE_CASE 사용

```typescript
// ✅ 올바름
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'http://localhost:3000';

// ❌ 잘못됨
const maxRetryCount = 3;
const apiBaseUrl = 'http://localhost:3000';
```

## 6. 타입 정의

### Interface vs Type

- **Interface**: 확장 가능한 객체 타입
- **Type**: Union, Intersection 등 복잡한 타입

```typescript
// ✅ Interface 사용 (객체)
interface User {
  id: string;
  name: string;
}

// ✅ Type 사용 (Union)
type Status = 'pending' | 'active' | 'inactive';

// ✅ Type 사용 (Intersection)
type UserWithTimestamp = User & {
  createdAt: Date;
};
```

## 7. 비동기 처리

### async/await 사용

```typescript
// ✅ 올바름
async function getUser(id: string): Promise<User> {
  const user = await userRepository.findById(id);
  return user;
}

// ❌ 지양 (Promise chaining)
function getUser(id: string): Promise<User> {
  return userRepository.findById(id)
    .then(user => user);
}
```

## 8. 에러 처리

### try-catch 사용

```typescript
// ✅ 올바름
async function deleteUser(id: string): Promise<void> {
  try {
    await userRepository.delete(id);
    logger.info('User deleted', { id });
  } catch (error) {
    logger.error('Failed to delete user', { id, error });
    throw error;
  }
}
```

## 9. 주석 작성

### JSDoc 사용

```typescript
/**
 * 사용자를 생성합니다.
 *
 * @param input - 사용자 생성 입력 데이터
 * @returns 생성된 사용자 정보
 * @throws {ValidationError} 입력 데이터가 유효하지 않은 경우
 */
async function createUser(input: CreateUserInput): Promise<User> {
  // ...
}
```

## 10. 코드 스타일

### ESLint & Prettier

- **ESLint**: 코드 품질 규칙
- **Prettier**: 코드 포맷팅

```bash
# 린트 검사
yarn lint

# 자동 포맷팅
yarn format
```

## 관련 문서

- [TypeScript & ESM](../tech-stack/typescript-esm.md)
- [Dependency Injection](../architecture/dependency-injection.md)
- [Developer 워크플로우](../../../.claude/agents/pioneer/developer.md)
