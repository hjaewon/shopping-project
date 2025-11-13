# 배포 가이드 (Deployment Guide)

## 📋 배포 순서

```
1. MongoDB Atlas 연결 수정
2. 코드 수정 (완료 ✅)
3. GitHub에 푸시
4. Heroku에서 서버 배포
5. Vercel에서 클라이언트 배포
6. 테스트
```

---

## 🔧 필수 파일 생성 (수동)

### 1. `client/.env.production` 파일 생성
```env
VITE_API_URL=https://your-app-name.herokuapp.com/api
```
> ⚠️ Heroku 배포 후 실제 URL로 변경하세요!

### 2. `client/.env.development` 파일 생성
```env
VITE_API_URL=http://localhost:5001/api
```

---

## 🌐 웹사이트를 통한 배포 방법

## STEP 1: Heroku 배포 (서버 먼저!)

### 1-1. Heroku 앱 생성
1. https://dashboard.heroku.com 로그인
2. **New → Create new app** 클릭
3. App name 입력: `your-shopping-mall-api`
4. Region 선택: `United States`
5. **Create app** 클릭

### 1-2. GitHub 연결
1. **Deploy** 탭 클릭
2. Deployment method: **GitHub** 선택
3. **Connect to GitHub** 클릭
4. 저장소 검색: `shopping-project`
5. **Connect** 클릭

### 1-3. 환경변수 설정
1. **Settings** 탭 클릭
2. **Config Vars** → **Reveal Config Vars** 클릭
3. 다음 환경변수 추가:

| KEY | VALUE |
|-----|-------|
| `MONGODB_ATLAS_URL` | `mongodb+srv://hjaewonnn_db_user:실제비밀번호@cluster0.89zzgnx.mongodb.net/shopping-mall?retryWrites=true&w=majority` |
| `JWT_SECRET` | `your_super_secret_jwt_key_here` |
| `IMP_API_KEY` | `imp04688042` |
| `IMP_API_SECRET` | `your_iamport_secret` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://your-app.vercel.app` (Vercel 배포 후 업데이트) |

### 1-4. 배포 실행
1. **Deploy** 탭으로 이동
2. **Manual deploy** 섹션
3. Branch 선택: `main`
4. **Deploy Branch** 클릭
5. 배포 로그 확인
6. **View** 버튼 클릭하여 배포된 URL 확인

### 1-5. 배포 URL 저장
예: `https://your-shopping-mall-api.herokuapp.com`

---

## STEP 2: Vercel 배포 (클라이언트)

### 2-1. Vercel 프로젝트 생성
1. https://vercel.com 로그인
2. **Add New → Project** 클릭
3. GitHub 저장소 선택: `shopping-project`
4. **Import** 클릭

### 2-2. 프로젝트 설정
**Configure Project** 화면에서:

1. **Framework Preset**: `Vite` (자동 감지)
2. **Root Directory**: 
   - **Edit** 클릭
   - `client` 입력 ← **매우 중요!**
3. **Build and Output Settings**:
   - Build Command: `npm run build` (자동)
   - Output Directory: `dist` (자동)
   - Install Command: `npm install` (자동)

### 2-3. 환경변수 설정
**Environment Variables** 섹션:

| NAME | VALUE |
|------|-------|
| `VITE_API_URL` | `https://your-shopping-mall-api.herokuapp.com/api` |

> ⚠️ Heroku URL을 정확히 입력하세요!

### 2-4. 배포 실행
1. **Deploy** 클릭
2. 배포 진행 확인 (약 2-3분 소요)
3. 배포 완료 후 **Visit** 클릭
4. 배포 URL 확인: `https://your-app.vercel.app`

---

## STEP 3: Heroku CORS 설정 업데이트

### 3-1. Vercel URL을 Heroku에 추가
1. Heroku Dashboard → 앱 선택
2. **Settings** 탭
3. **Config Vars** → **Reveal Config Vars**
4. `CLIENT_URL` 값을 Vercel URL로 업데이트:
   ```
   CLIENT_URL = https://your-app.vercel.app
   ```
5. 자동으로 재배포됨

---

## ✅ 배포 후 테스트

### 1. 기본 연결 테스트
- Vercel URL 접속
- 페이지가 정상적으로 로드되는지 확인

### 2. API 연결 테스트
- 회원가입 시도
- 로그인 테스트
- 상품 목록 로드 확인

### 3. 전체 기능 테스트
- 상품 상세 조회
- 장바구니 추가/수정/삭제
- 주문 생성 (포트원 결제)
- 주문 목록 확인

### 4. 관리자 기능 테스트
- 어드민 로그인
- 상품 등록/수정
- 주문 관리
- 사용자 관리

---

## 🐛 트러블슈팅

### 문제: API 연결 실패
**원인**: CORS 또는 잘못된 API URL

**해결**:
1. 브라우저 개발자 도구 (F12) → Console 확인
2. Network 탭에서 API 요청 URL 확인
3. Vercel 환경변수 `VITE_API_URL` 확인
4. Heroku `CLIENT_URL` 확인

### 문제: MongoDB 연결 실패
**원인**: 
- MongoDB Atlas 비밀번호 오류
- Network Access 설정

**해결**:
1. MongoDB Atlas → Database Access → 비밀번호 재설정
2. MongoDB Atlas → Network Access → `0.0.0.0/0` 추가
3. Heroku Config Vars에서 `MONGODB_ATLAS_URL` 확인

### 문제: 포트원 결제 안됨
**원인**: 포트원 API 키 미설정

**해결**:
1. https://admin.iamport.kr 로그인
2. API 키/시크릿 확인
3. Heroku Config Vars 업데이트

---

## 📝 체크리스트

### 배포 전:
- [ ] MongoDB Atlas 연결 성공 확인
- [ ] .env 파일 생성 (production, development)
- [ ] GitHub에 최신 코드 푸시
- [ ] Procfile 생성 ✅
- [ ] package.json engines 추가 ✅
- [ ] CORS 설정 업데이트 ✅
- [ ] API baseURL 환경변수화 ✅

### Heroku 배포:
- [ ] 앱 생성
- [ ] GitHub 연결
- [ ] 환경변수 설정 (6개)
- [ ] 배포 실행
- [ ] 배포 URL 확인 및 저장

### Vercel 배포:
- [ ] 프로젝트 생성
- [ ] Root Directory: `client` 설정
- [ ] 환경변수 설정 (`VITE_API_URL`)
- [ ] 배포 실행
- [ ] 배포 URL 확인

### 배포 후:
- [ ] Heroku CLIENT_URL 업데이트
- [ ] 전체 기능 테스트
- [ ] 결제 테스트
- [ ] 에러 로그 확인

---

## 🔗 유용한 링크

- **Heroku Dashboard**: https://dashboard.heroku.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com
- **포트원 관리자**: https://admin.iamport.kr

---

## 💡 팁

1. **무료 티어 사용 시**:
   - Heroku Free Tier는 2022년 종료됨 → **Render.com** 또는 **Railway.app** 추천
   - Vercel Free Tier는 계속 사용 가능

2. **환경변수 보안**:
   - GitHub에 .env 파일 업로드 금지 (.gitignore 확인)
   - 실제 API 키는 배포 플랫폼에서만 설정

3. **자동 배포 설정**:
   - Heroku/Vercel 모두 GitHub 커밋 시 자동 배포 가능
   - **Enable Automatic Deploys** 옵션 활성화

4. **도메인 연결**:
   - 커스텀 도메인 사용 가능
   - Vercel/Heroku 모두 무료로 연결 가능

