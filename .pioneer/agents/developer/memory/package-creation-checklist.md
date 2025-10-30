# 신규 모듈 추가 체크리스트

> 새 패키지를 추가할 때 따라야 할 단계별 가이드

## 1. 디렉터리 및 파일 생성

```bash
# 라이브러리 패키지
mkdir -p packages/new-package/src

# 또는 애플리케이션
mkdir -p apps/new-app/src
```

## 2. package.json 작성

```json
{
  "name": "@your-org/new-package",  // ← 조직명 변경 필요
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "sideEffects": false,
  "scripts": {
    "build": "tsc --build",
    "dev": "tsc --build --watch",
    "clean": "rm -rf dist *.tsbuildinfo",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {},
  "devDependencies": {
    "@your-org/shared-config": "*",  // ← 조직명 변경 필요
    "typescript": "^5.3.3"
  }
}
```

### 필수 체크사항

- [ ] `"type": "module"` 설정
- [ ] `exports` 필드 정의
- [ ] `sideEffects: false` 설정
- [ ] 표준 스크립트 (`build`, `dev`, `clean`, `type-check`) 포함

## 3. tsconfig.json 작성

```json
{
  "extends": "@your-org/shared-config/tsconfig.library.json",  // ← 조직명 변경 필요
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "composite": true
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../shared-core" }  // ← 의존하는 패키지 경로
  ]
}
```

### 필수 체크사항

- [ ] `composite: true` 설정
- [ ] `references`에 의존 패키지 명시
- [ ] shared-config 확장

## 4. 소스 코드 작성

```typescript
// src/index.ts
export * from './service.js';  // ⚠️ .js 확장자 필수

// src/service.ts
import 'reflect-metadata';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class MyService {
  // ...
}
```

### 필수 체크사항

- [ ] 상대 경로 import에 `.js` 확장자 포함
- [ ] DI 데코레이터 (`@singleton()`, `@injectable()`) 사용
- [ ] barrel export (index.ts) 작성

## 5. 루트 설정 업데이트

### package.json (루트)

**이미 workspace 설정이 되어 있어야 함**:

```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

새 패키지가 `packages/` 또는 `apps/`에 있다면 자동으로 인식됩니다.

## 6. 검증

```bash
# 1. 의존성 설치
yarn install

# 2. 타입 체크
yarn type-check

# 3. 빌드 확인
yarn build

# 4. 개발 모드 테스트
yarn dev
```

### 체크리스트

- [ ] `yarn install` 성공
- [ ] `yarn type-check` 오류 없음
- [ ] `yarn build` 성공
- [ ] `dist/` 디렉터리 생성 확인
- [ ] `yarn dev` watch 모드 동작 확인

## 7. 다른 패키지에서 사용

### 의존성 추가

```bash
cd packages/other-package
yarn add @your-org/new-package@*  # ← 조직명 변경 필요
```

### tsconfig.json에 reference 추가

```json
{
  "references": [
    { "path": "../new-package" }
  ]
}
```

### 사용 예시

```typescript
import { MyService } from '@your-org/new-package';  // ← 조직명 변경 필요
```

## 문제 해결

### "Cannot find module" 오류

1. **빌드 확인**
   ```bash
   cd packages/new-package
   yarn build
   ```

2. **의존성 재설치**
   ```bash
   yarn install
   ```

### 타입 오류 발생

1. **references 확인**
   - tsconfig.json에 의존 패키지가 references에 있는지 확인

2. **composite 설정 확인**
   - `composite: true`가 설정되어 있는지 확인

## 관련 문서

- [패키지 개발 규칙](../architecture/package-guidelines.md)
- [Monorepo 구조](../architecture/monorepo-structure.md)
- [TypeScript & ESM](../tech-stack/typescript-esm.md)
- [빌드 시스템](../tech-stack/build-system.md)
