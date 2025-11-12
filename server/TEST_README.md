# Product API 테스트 가이드

## 빠른 시작

### 1. 서버 실행

```bash
cd server
npm run dev
```

서버가 `http://localhost:5001`에서 실행됩니다.

### 2. API 테스트 방법

#### 방법 A: 자동 테스트 스크립트 실행 (권장)

```bash
cd server
node test-api.js
```

이 스크립트는 모든 API 엔드포인트를 자동으로 테스트하고 결과를 보여줍니다.

#### 방법 B: 프론트엔드에서 테스트

1. 클라이언트 실행:
   ```bash
   cd client
   npm run dev
   ```

2. 브라우저에서 `http://localhost:5173/admin/products` 접속

3. "새 상품 추가" 버튼 클릭하여 상품 등록 테스트

#### 방법 C: cURL로 수동 테스트

```bash
# 상품 등록
curl -X POST http://localhost:5001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "TOP001",
    "name": "베이직 티셔츠",
    "price": 29900,
    "category": "상의",
    "image": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    "description": "편안한 베이직 티셔츠",
    "stock": 100
  }'

# 전체 상품 조회
curl http://localhost:5001/api/products?includeInactive=true

# 특정 상품 조회 (SKU)
curl http://localhost:5001/api/products/sku/TOP001
```

#### 방법 D: Postman/Insomnia 사용

1. Postman 또는 Insomnia 설치
2. `API_DOCUMENTATION.md` 파일의 엔드포인트 참조
3. Collection 생성하여 테스트

---

## 테스트 시나리오

### 시나리오 1: 상품 등록 플로우

1. **상품 등록 요청**
   ```bash
   POST /api/products
   ```

2. **응답 확인**
   - Status: 201 Created
   - success: true
   - 생성된 상품 ID 확인

3. **등록된 상품 조회**
   ```bash
   GET /api/products
   ```

### 시나리오 2: 상품 수정 플로우

1. **상품 조회하여 ID 확인**
   ```bash
   GET /api/products/sku/TOP001
   ```

2. **상품 정보 수정**
   ```bash
   PUT /api/products/{product_id}
   ```

3. **수정 결과 확인**
   ```bash
   GET /api/products/{product_id}
   ```

### 시나리오 3: 에러 처리 테스트

1. **필수 필드 누락**
   ```bash
   POST /api/products
   Body: { "name": "테스트" }
   ```
   - 예상 응답: 400 Bad Request

2. **중복 SKU**
   ```bash
   POST /api/products
   Body: { ..., "sku": "TOP001" }  # 이미 존재하는 SKU
   ```
   - 예상 응답: 400 Bad Request

3. **잘못된 카테고리**
   ```bash
   POST /api/products
   Body: { ..., "category": "잘못된카테고리" }
   ```
   - 예상 응답: 400 Bad Request

4. **존재하지 않는 상품 조회**
   ```bash
   GET /api/products/sku/NOTEXIST
   ```
   - 예상 응답: 404 Not Found

---

## 자동 테스트 스크립트 상세

### 실행 방법

```bash
node test-api.js
```

### 테스트 항목

1. ✅ 상품 등록 (POST /products)
2. ✅ 전체 상품 조회 (GET /products)
3. ✅ SKU로 상품 조회 (GET /products/sku/:sku)
4. ✅ ID로 상품 조회 (GET /products/:id)
5. ✅ 상품 수정 (PUT /products/:id)
6. ✅ 재고 수정 (PATCH /products/:id/stock)
7. ✅ 상품 삭제 (DELETE /products/:id)
8. ✅ 상품 영구 삭제 (DELETE /products/:id/permanent)
9. ✅ 유효성 검사 테스트

### 예상 출력

```
╔═══════════════════════════════════════════════╗
║       Product API 테스트 시작              ║
╚═══════════════════════════════════════════════╝

ℹ 서버 주소: http://localhost:5001/api
ℹ 테스트를 시작합니다...

━━━ 테스트 1: 상품 등록 (POST /products) ━━━

✓ 상품 등록 성공! ID: 64f8a1b2c3d4e5f6g7h8i9j0

━━━ 테스트 2: 전체 상품 조회 (GET /products) ━━━

✓ 상품 목록 조회 성공! 총 1개 상품
...

╔═══════════════════════════════════════════════╗
║           테스트 결과                      ║
╚═══════════════════════════════════════════════╝

통과: 9
실패: 0
총: 9

✓ 모든 테스트가 통과했습니다! 🎉
```

---

## 데이터베이스 확인

### MongoDB 직접 확인

```bash
# MongoDB Shell 접속
mongosh

# 데이터베이스 선택
use shopping-mall

# 상품 컬렉션 조회
db.products.find().pretty()

# 특정 SKU 조회
db.products.findOne({ sku: "TOP001" })

# 전체 상품 수 확인
db.products.countDocuments()
```

---

## 문제 해결

### 서버가 응답하지 않음

1. 서버가 실행 중인지 확인:
   ```bash
   netstat -an | grep 5001
   ```

2. MongoDB 연결 상태 확인:
   - 서버 로그에서 "몽고db연결성공!" 메시지 확인

3. 포트 충돌 확인:
   ```bash
   # Windows
   netstat -ano | findstr :5001
   
   # Mac/Linux
   lsof -i :5001
   ```

### CORS 에러

클라이언트에서 API 호출 시 CORS 에러가 발생하면:

1. `server/index.js`에 CORS 설정 확인:
   ```javascript
   app.use(cors());
   ```

2. 특정 오리진만 허용하려면:
   ```javascript
   app.use(cors({
     origin: 'http://localhost:5173'
   }));
   ```

### MongoDB 연결 실패

1. MongoDB가 설치되어 있는지 확인
2. MongoDB 서비스가 실행 중인지 확인:
   ```bash
   # Windows
   net start MongoDB
   
   # Mac
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. 연결 문자열 확인:
   - 기본값: `mongodb://localhost:27017/shopping-mall`

### 테스트 스크립트 에러

1. fetch API 사용 가능 여부 확인:
   - Node.js 18 이상 필요
   - 버전 확인: `node --version`

2. 서버가 먼저 실행되어 있어야 함

---

## 추가 리소스

- **API 문서**: `API_DOCUMENTATION.md`
- **Postman Collection**: (TODO: Postman collection 파일 추가)
- **코드 예제**: `test-api.js` 파일 참조

---

## 다음 단계

1. ✅ API 테스트 완료
2. 📝 프론트엔드 연동 테스트
3. 🔐 인증/권한 미들웨어 추가 (선택사항)
4. 🚀 배포 준비

자세한 내용은 프로젝트의 메인 README를 참조하세요.

