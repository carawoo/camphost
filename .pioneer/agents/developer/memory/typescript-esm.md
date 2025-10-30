# TypeScript & ESM

> Pure ESM 기반 TypeScript 프로젝트 설정 및 규칙

## 핵심 원칙

- **Pure ESM**: `"type": "module"` 필수
- **Module System**: `Node16` 사용
- **확장자 필수**: 상대 경로 import 시 `.js` 확장자 반드시 포함

## Import 확장자 규칙

### ⚠️ 가장 중요한 규칙

**상대 경로 import는 반드시 `.js` 확장자를 포함해야 합니다.**

```typescript
// ✅ 올바름
import { Logger } from './logger.js';
export * from './utils.js';
import type { User } from './user.types.js';

// ❌ 잘못됨 - Node.js ESM에서 오류 발생
import { Logger } from './logger';
export * from './utils';
import type { User } from './user.types';
```

### 왜 .js를 사용하나요?

1. **TypeScript 소스는 `.ts`지만 빌드 후 `.js`가 생성됨**
2. **Node.js ESM은 확장자 생략을 허용하지 않음**
3. **TypeScript는 import 경로를 그대로 유지함** (변환하지 않음)
4. **따라서 소스에서 `.js`로 작성해야 런타임에 정상 동작**

## TypeScript 설정

### 기본 설정 (tsconfig.json)

```json
{
  "compilerOptions": {
    "module": "Node16",
    "moduleResolution": "Node16",
    "target": "ES2022",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### 주요 옵션 설명

| 옵션 | 값 | 설명 |
|------|-----|------|
| `module` | `Node16` | Node.js의 ESM/CJS 하이브리드 지원 |
| `moduleResolution` | `Node16` | package.json의 exports 필드 인식 |
| `target` | `ES2022` | 최신 JavaScript 기능 사용 |
| `experimentalDecorators` | `true` | 데코레이터 (@injectable 등) 사용 |
| `emitDecoratorMetadata` | `true` | DI를 위한 메타데이터 생성 |

## Import 순서

코드의 가독성을 위해 다음 순서로 import를 작성합니다:

```typescript
// 1. Node.js 내장 모듈 (reflect-metadata 포함)
import 'reflect-metadata';

// 2. 외부 패키지
import { injectable, singleton } from 'tsyringe';
import { Hono } from 'hono';

// 3. 내부 workspace 패키지
import { Logger } from '@pioncorp/shared-core';

// 4. 상대 경로 (반드시 .js 확장자 포함)
import type { User } from './user.types.js';
import { UserService } from './user.service.js';
```

## TypeScript References

### 패키지 간 의존성 명시

```json
{
  "compilerOptions": {
    "composite": true
  },
  "references": [
    { "path": "../shared-core" }
  ]
}
```

### 이점

- ✅ 빌드 속도 향상 (증분 빌드)
- ✅ IDE "Go to Definition"이 원본 소스로 이동
- ✅ 패키지 간 타입 체크 강화

## 자주 하는 실수

### 1. 확장자 생략

```typescript
// ❌ 런타임 오류 발생
import { foo } from './bar';

// ✅ 정상 동작
import { foo } from './bar.js';
```

### 2. .ts 확장자 사용

```typescript
// ❌ TypeScript 컴파일 오류
import { foo } from './bar.ts';

// ✅ 정상 동작 (.js 사용)
import { foo } from './bar.js';
```

### 3. package.json에 type 필드 누락

```json
// ❌ CommonJS로 인식됨
{
  "name": "my-package"
}

// ✅ ESM으로 인식됨
{
  "name": "my-package",
  "type": "module"
}
```

## 관련 문서

- [패키지 개발 규칙](./package-guidelines.md)
- [코드 작성 규칙](./coding-rules.md)
- [빌드 시스템](./build-system.md)
