# 쇼핑몰 프로젝트 (Shopping Mall Demo)

포트원 결제 연동이 포함된 풀스택 쇼핑몰 프로젝트입니다.

## 🚀 주요 기능

### 고객 기능
- ✅ 회원가입 / 로그인
- ✅ 상품 목록 조회 및 필터링
- ✅ 상품 상세 정보
- ✅ 장바구니 관리
- ✅ 주문하기 (포트원 결제 연동)
- ✅ 주문 성공 페이지

### 관리자 기능
- ✅ 상품 등록 / 수정 / 삭제
- ✅ 주문 관리
- ✅ 재고 관리
- ✅ 배송 상태 관리

### 보안 기능
- 🔒 JWT 인증
- 🔒 결제 검증 (포트원 API)
- 🔒 중복 주문 방지
- 🔒 재고 관리 및 검증

## 🛠 기술 스택

### Frontend
- React 18
- React Router
- Axios
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Bcrypt

### 결제
- 포트원 (iamport) - 결제 모듈

### 이미지 저장
- Cloudinary

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/hjaewon/shopping-project.git
cd shopping-project
```

### 2. 서버 설정
```bash
cd server
npm install

# .env 파일 생성
# MONGODB_URI=mongodb://localhost:27017/shopping-mall
# JWT_SECRET=your_jwt_secret_here
# IMP_API_KEY=your_iamport_api_key
# IMP_API_SECRET=your_iamport_api_secret
# NODE_ENV=development

npm start
```

### 3. 클라이언트 설정
```bash
cd client
npm install
npm run dev
```

## 🌐 접속

- **클라이언트**: http://localhost:3000
- **서버**: http://localhost:5001

## 📁 프로젝트 구조

```
shopping-mall-demo/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── api/           # Axios 설정
│   │   ├── components/    # 재사용 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   └── ...
│   └── ...
├── server/                 # Express 백엔드
│   ├── controllers/       # 비즈니스 로직
│   ├── models/            # MongoDB 모델
│   ├── routes/            # API 라우트
│   ├── middleware/        # 미들웨어 (인증 등)
│   └── ...
└── README.md
```

## 🔑 환경 변수

### Server (.env)
```env
MONGODB_URI=mongodb://localhost:27017/shopping-mall
JWT_SECRET=your_jwt_secret_here
PORT=5001

# 포트원 API (선택사항)
IMP_API_KEY=your_iamport_api_key
IMP_API_SECRET=your_iamport_api_secret

# Cloudinary (이미지 업로드)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NODE_ENV=development
```

## 📝 API 문서

API 문서는 `server/API_DOCUMENTATION.md` 파일을 참조하세요.

## 🧪 테스트

REST API 테스트 파일들:
- `server/test-product-api.rest` - 상품 API 테스트
- `server/test-cart-api.rest` - 장바구니 API 테스트
- `server/test-order-api.rest` - 주문 API 테스트

## 📄 라이센스

MIT License

## 👤 Author

Hong Jaewon ([@hjaewon](https://github.com/hjaewon))

