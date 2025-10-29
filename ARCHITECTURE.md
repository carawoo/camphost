# 오도이촌 캠핑장 관리 시스템

캠핑장 운영을 자동화하는 종합 관리 시스템입니다.

## 🏗️ 아키텍처 개요

### 시스템 구조
- **슈퍼 어드민**: 전체 캠핑장 관리 (진행중/대기중/계약해지)
- **캠핑장별 어드민**: 각 캠핑장 사장님용 관리 페이지
- **키오스크**: 고객용 무인 체크인/체크아웃 시스템

### 폴더 구조
```
src/
├── types/           # 타입 정의
├── constants/       # 상수 및 설정
├── utils/           # 유틸리티 함수
├── services/        # 비즈니스 로직
├── hooks/           # 커스텀 훅
├── components/      # 재사용 가능한 컴포넌트
│   ├── common/      # 공통 컴포넌트
│   ├── admin/       # 어드민 전용 컴포넌트
│   └── kiosk/       # 키오스크 전용 컴포넌트
└── styles/          # 스타일 파일

app/
├── super-admin/     # 슈퍼 어드민 페이지
├── admin/           # 캠핑장별 어드민 페이지
├── kiosk/           # 키오스크 페이지
└── api/             # API 라우트
```

## 🚀 주요 기능

### 슈퍼 어드민
- 전체 캠핑장 현황 관리
- 캠핑장 상태 관리 (진행중/대기중/일시정지/계약해지)
- 새 캠핑장 등록 및 관리
- 통계 대시보드

### 캠핑장 어드민
- 예약 관리
- 무인 체크인/체크아웃 관리
- 캠핑장 정보 설정
- 수익 관리 (준비중)

### 키오스크
- 무인 체크인/체크아웃
- 예약 정보 확인
- 실시간 상태 업데이트

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Context
- **Storage**: localStorage (개발용)
- **Architecture**: Layered Architecture

## 📦 핵심 모듈

### 타입 시스템 (`src/types/`)
- 중앙화된 타입 정의
- API 응답 타입
- 컴포넌트 Props 타입
- 폼 상태 타입

### 서비스 레이어 (`src/services/`)
- 비즈니스 로직 분리
- 데이터 접근 추상화
- 캠핑장/예약/사용자 서비스

### 커스텀 훅 (`src/hooks/`)
- 상태 관리 로직 재사용
- 폼 관리
- 필터링 및 검색
- 인증 관리

### 공통 컴포넌트 (`src/components/common/`)
- 재사용 가능한 UI 컴포넌트
- 일관된 디자인 시스템
- 접근성 고려

## 🔧 개발 가이드

### 새로운 기능 추가
1. 타입 정의 (`src/types/`)
2. 서비스 로직 (`src/services/`)
3. 커스텀 훅 (`src/hooks/`)
4. 컴포넌트 (`src/components/`)
5. 페이지 (`app/`)

### 코드 스타일
- TypeScript strict 모드
- 함수형 컴포넌트 + Hooks
- 명명 규칙: PascalCase (컴포넌트), camelCase (함수/변수)
- 폴더명: kebab-case

### 상태 관리
- 로컬 상태: useState
- 전역 상태: Context API
- 서버 상태: 커스텀 훅

## 🚀 배포

### 개발 환경
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
npm start
```

## 📝 API 문서

### 인증
- 슈퍼 어드민: `admin` / `admin123`
- 캠핑장 어드민: 각 캠핑장별 계정

### 주요 엔드포인트
- `/super-admin` - 슈퍼 어드민 로그인
- `/super-admin/dashboard` - 슈퍼 어드민 대시보드
- `/admin` - 캠핑장 어드민 로그인
- `/admin/dashboard` - 캠핑장 어드민 대시보드
- `/kiosk` - 키오스크 페이지

## 🔄 리팩토링 가이드

### 장기적 확장성
1. **데이터베이스 연동**: localStorage → PostgreSQL/MongoDB
2. **API 서버**: Next.js API → 독립적인 백엔드 서버
3. **인증 시스템**: JWT 토큰 기반 인증
4. **실시간 통신**: WebSocket 또는 Server-Sent Events
5. **파일 업로드**: 이미지 및 문서 관리
6. **모바일 앱**: React Native 또는 Flutter

### 성능 최적화
- 코드 스플리팅
- 이미지 최적화
- 캐싱 전략
- SEO 최적화

## 🤝 기여 가이드

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 라이선스

MIT License
