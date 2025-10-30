# 패키지 개발 규칙

> Monorepo 내 패키지 개발 시 준수해야 할 규칙

## 1. 패키지 구조

```
packages/<package-name>/
├── src/
│   ├── index.ts           # Barrel export (반드시 .js 확장자 포함)
│   ├── *.service.ts       # 서비스 클래스
│   ├── *.types.ts         # TypeScript 타입
│   └── *.ts               # 기타 모듈
├── dist/                  # 빌드 결과 (ESM)
├── package.json           # type: "module" 필수
├── tsconfig.json          # composite: true 필수
└── README.md
```

## 2. package.json 설정

```json
{
  "name": "@your-org/package-name",  // ← 조직명 변경 필요
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "sideEffects": false,
  "scripts": {
    "build": "tsc --build",
    "dev": "tsc --build --watch",
    "clean": "rm -rf dist *.tsbuildinfo"
  }
}
```

### 필수 필드

- `"type": "module"` - Pure ESM 패키지임을 명시
- `exports` - 모던 패키지 진입점 정의
- `sideEffects: false` - Tree-shaking 최적화

## 3. tsconfig.json 설정

```json
{
  "extends": "@your-org/shared-config/tsconfig.library.json",  // ← 조직명 변경 필요
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "composite": true
  },
  "references": [
    { "path": "../shared-core" }  // ← 의존하는 패키지 경로
  ]
}
```

### 필수 설정

- `composite: true` - TypeScript Project References 활성화
- `references` - 의존하는 다른 패키지 명시

## 4. Barrel Export 규칙

**⚠️ 중요**: index.ts에서 `.js` 확장자 필수

```typescript
// ✅ 올바름
export * from './user.service.js';
export * from './user.types.js';

// ❌ 잘못됨
export * from './user.service';
export * from './user.types';
```

### 이유

- TypeScript 소스는 `.ts`지만 빌드 후 `.js`가 생성됨
- Node.js ESM은 확장자 생략 불가
- 컴파일 타임에 `.js`를 명시해야 런타임에 정상 동작

## 파일 네이밍 규칙

- **Service**: `*.service.ts`
- **Types**: `*.types.ts`
- **Index**: `index.ts` (barrel export)
- **Utils**: `*.util.ts` 또는 `*.utils.ts`

## 관련 문서

- [Monorepo 구조](./monorepo-structure.md)
- [패키지 생성 체크리스트](./package-creation-checklist.md)
- [TypeScript & ESM](../tech-stack/typescript-esm.md)
- [빌드 시스템](../tech-stack/build-system.md)
