# 배포 가이드: camphost.real-e.space

## 1. Vercel 배포

### 방법 A: Vercel CLI 사용

```bash
# Vercel CLI 설치 (전역)
npm i -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 방법 B: GitHub 연동 (추천)

1. GitHub에 레포지토리 생성
2. 코드 푸시
3. [Vercel 대시보드](https://vercel.com) 접속
4. "Import Project" 선택
5. GitHub 레포지토리 연결

## 2. 커스텀 도메인 설정

### Vercel 대시보드에서

1. 프로젝트 선택 → Settings → Domains
2. `camphost.real-e.space` 입력
3. Vercel이 제공하는 DNS 레코드 확인

### DNS 설정 (real-e.space 도메인 관리 페이지에서)

다음 중 하나를 선택:

#### 옵션 1: CNAME 레코드 (추천)
```
Type: CNAME
Name: camphost
Value: cname.vercel-dns.com.
TTL: 3600 (또는 자동)
```

#### 옵션 2: A 레코드
```
Type: A
Name: camphost
Value: 76.76.21.21
TTL: 3600
```

## 3. SSL 인증서

Vercel이 자동으로 Let's Encrypt SSL 인증서를 발급합니다.
- 보통 몇 분 내 완료
- HTTPS 자동 활성화

## 4. 환경 변수 설정

Vercel 대시보드에서:
- Settings → Environment Variables
- 필요한 환경변수 추가 (예: API 키 등)

## 5. 빌드 설정 확인

Vercel 프로젝트 설정:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## 6. 배포 확인

배포 후 접속:
- https://camphost.real-e.space

## 트러블슈팅

### DNS 전파 시간
- DNS 변경사항이 적용되려면 최대 48시간 소요
- 보통 1-2시간이면 적용됨
- 확인: `nslookup camphost.real-e.space`

### SSL 인증서 오류
- DNS가 완전히 전파된 후 자동 발급
- Vercel 대시보드에서 "Refresh" 클릭

### 빌드 실패
- 로그 확인: Vercel 대시보드 → Deployments → 실패한 배포 클릭
- 로컬에서 `npm run build` 테스트

## 기타 배포 옵션

### Netlify
```bash
# Netlify CLI
npm i -g netlify-cli
netlify login
netlify deploy --prod
```

### 자체 서버 (Docker)
Dockerfile 필요 시 별도 문의

## 도움말

- Vercel 문서: https://vercel.com/docs
- Next.js 배포: https://nextjs.org/docs/deployment

