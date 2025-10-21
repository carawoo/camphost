# 오도이촌 B2B 랜딩 페이지

캠핑장 운영 자동화 솔루션 '오도이촌'의 B2B 랜딩 페이지입니다.

## 시작하기

### 설치

```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
npm run start
```

## 주요 기능

- 무인 체크인
- 온담 (문의함)
- 위브 (리포트)

## 기술 스택

- Next.js 14 (App Router)
- TypeScript
- CSS

## 프로젝트 구조

```
오도이촌-B2B/
├── app/
│   ├── layout.tsx       # 루트 레이아웃
│   ├── page.tsx         # 메인 페이지
│   └── globals.css      # 전역 스타일
├── components/
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── PainSection.tsx
│   ├── SolutionSection.tsx
│   ├── BeforeAfterSection.tsx
│   ├── ImpactSection.tsx
│   ├── TestimonialSection.tsx
│   ├── FAQSection.tsx
│   ├── ApplySection.tsx
│   └── Footer.tsx
└── package.json
```

