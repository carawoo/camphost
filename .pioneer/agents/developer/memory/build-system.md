# 빌드 시스템

> Turborepo 기반 빌드 관리 및 스크립트 규칙

## 빌드 스크립트 네이밍 (필수)

모든 패키지는 다음 스크립트를 표준으로 제공해야 합니다:

| 스크립트 | 용도 | 명령어 예시 |
|---------|------|------------|
| `build` | 프로덕션 빌드 | `tsc --build` |
| `dev` | 개발 모드 (Watch) | `tsc --build --watch` |
| `clean` | 빌드 산출물 삭제 | `rm -rf dist *.tsbuildinfo` |
| `type-check` | 타입 체크 | `tsc --noEmit` |
| `test` | 테스트 실행 | `vitest run` |

## Turborepo 태스크 오케스트레이션

Turborepo를 통해 모든 패키지의 빌드를 관리합니다:

```bash
# 전체 빌드 (의존성 순서 자동 처리)
yarn build

# 전체 타입 체크
yarn type-check

# 전체 클린
yarn clean
```

## turbo.json 설정

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

### 태스크별 설정

#### build

- `dependsOn: ["^build"]` - 의존하는 패키지를 먼저 빌드
- `outputs: ["dist/**"]` - 빌드 결과물 캐싱

#### dev

- `cache: false` - 개발 모드는 캐시하지 않음
- `persistent: true` - watch 모드로 계속 실행

#### test

- `dependsOn: ["build"]` - 빌드 후 테스트 실행
- `outputs: ["coverage/**"]` - 커버리지 결과 캐싱

## 빌드 산출물

### 라이브러리 (packages/)

```
packages/my-lib/
├── src/           # 소스 코드
├── dist/          # 빌드 결과 (.gitignore)
└── *.tsbuildinfo  # TypeScript 빌드 정보 (.gitignore)
```

- `dist/`, `.tsbuildinfo`는 `.gitignore`에 포함
- 빌드 시마다 재생성됨

### 애플리케이션 (apps/)

```
apps/my-app/
├── src/    # 소스 코드
└── dist/   # 빌드 결과 (배포 시 사용)
```

- `dist/`는 배포 시 사용
- 프로덕션 빌드 후 Docker 이미지에 포함

## 빌드 워크플로우

### 개발 중

```bash
# 전체 watch 모드
yarn dev

# 특정 패키지만 watch
cd packages/sample-domain
yarn dev
```

### 프로덕션 빌드

```bash
# 1. 클린
yarn clean

# 2. 전체 빌드
yarn build

# 3. 타입 체크
yarn type-check
```

## TypeScript Project References

### 빌드 순서 자동 처리

```json
{
  "references": [
    { "path": "../shared-core" },
    { "path": "../sample-domain" }
  ]
}
```

- TypeScript가 의존성 그래프를 파악
- 올바른 순서로 자동 빌드
- 변경된 패키지만 증분 빌드

## 빌드 최적화

### 1. 증분 빌드

- `composite: true` 설정으로 `.tsbuildinfo` 생성
- 변경된 파일만 재컴파일

### 2. 병렬 빌드

- Turborepo가 독립적인 패키지를 병렬로 빌드
- CPU 코어를 최대한 활용

### 3. 캐싱

- Turborepo가 빌드 결과를 캐싱
- 동일한 입력에 대해 재빌드 생략

## 문제 해결

### 빌드 오류 발생 시

```bash
# 1. 모든 빌드 산출물 삭제
yarn clean

# 2. node_modules 재설치
rm -rf node_modules
yarn install

# 3. 다시 빌드
yarn build
```

### 타입 오류 발생 시

```bash
# 개별 패키지에서 타입 체크
cd packages/sample-domain
yarn type-check
```

## 관련 문서

- [TypeScript & ESM](./typescript-esm.md)
- [Developer 워크플로우](../../../.claude/agents/pioneer/developer.md)
- [패키지 개발 규칙](../architecture/package-guidelines.md)
