# Monorepo 구조

> Monorepo 패키지 구조 및 의존성 관리

## 디렉터리 분류

| 디렉터리 | 목적 | 예시 |
|----------|------|------|
| **packages/** | 재사용 가능한 라이브러리 | shared-config, shared-core, domain 패키지 |
| **apps/** | 실행 가능한 애플리케이션 | API 서버, 웹 앱 |

## 일반적인 패키지 패턴

### packages/shared-config

**목적**: 모든 패키지가 공유하는 개발 설정 제공

- TypeScript 설정 (`tsconfig.*.json`)
- ESLint 설정 (`eslint.base.js`)
- Prettier 설정 (`.prettierrc.js`)
- **특징**: 코드 없음, 설정 파일만 제공

### packages/shared-core

**목적**: 공통 유틸리티 및 기반 기능 제공

- Logger 클래스 (DI 지원)
- 유틸리티 함수 (sleep, env helpers)
- **특징**: 다른 패키지의 의존성 없음 (기반 계층)

### packages/domain-*

**목적**: 비즈니스 로직 캡슐화 (도메인 계층)

- 도메인 서비스 (CRUD 로직)
- 도메인 타입 정의
- **의존성**: shared-core
- **특징**: HTTP와 무관한 순수 비즈니스 로직

### apps/*

**목적**: 애플리케이션 실행 (프레젠테이션 계층)

- REST API 엔드포인트
- 프레임워크 라우팅 및 미들웨어
- **의존성**: domain 패키지, shared-core
- **특징**: 실행 가능한 애플리케이션

## 의존성 그래프 예시

```
apps/api-server
    ↓
packages/domain-layer
    ↓
packages/shared-core
    ↓
packages/shared-config
```

## 아키텍처 원칙

- **단방향 의존성**: 상위 계층은 하위 계층에만 의존
- **계층 분리**: 하위 계층은 상위 계층을 알지 못함
- **재사용성**: packages는 여러 apps에서 공유 가능

## 프로젝트별 구조

구체적인 패키지 구성은 프로젝트마다 다를 수 있습니다.

## 관련 문서

- [패키지 개발 규칙](./package-guidelines.md)
- [패키지 생성 체크리스트](./package-creation-checklist.md)
- [Dependency Injection 패턴](./dependency-injection.md)
