# Product API 문서

## 기본 정보

- **Base URL**: `http://localhost:5001/api`
- **Content-Type**: `application/json`

## API 엔드포인트

### 1. 상품 등록 (POST /products)

새로운 상품을 등록합니다.

#### 요청

```http
POST /api/products
Content-Type: application/json

{
  "sku": "TOP001",
  "name": "베이직 티셔츠",
  "price": 29900,
  "category": "상의",
  "image": "https://res.cloudinary.com/xxx/image.jpg",
  "description": "편안한 베이직 티셔츠입니다.",
  "stock": 100
}
```

#### 필수 필드
- `sku` (String): 상품 코드 (자동으로 대문자 변환, 중복 불가)
- `name` (String): 상품명
- `price` (Number): 가격 (0보다 커야 함)
- `category` (String): 카테고리 ('상의', '하의', '악세사리' 중 선택)
- `image` (String): 이미지 URL (http:// 또는 https://로 시작)

#### 선택 필드
- `description` (String): 상품 설명
- `stock` (Number): 재고 수량 (기본값: 0)

#### 성공 응답 (201 Created)

```json
{
  "success": true,
  "message": "상품이 성공적으로 등록되었습니다",
  "data": {
    "_id": "64f8a1b2c3d4e5f6g7h8i9j0",
    "sku": "TOP001",
    "name": "베이직 티셔츠",
    "price": 29900,
    "category": "상의",
    "image": "https://res.cloudinary.com/xxx/image.jpg",
    "description": "편안한 베이직 티셔츠입니다.",
    "stock": 100,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 에러 응답

**400 Bad Request** - 유효성 검사 실패
```json
{
  "success": false,
  "message": "필수 필드를 모두 입력해주세요 (SKU, 상품명, 가격, 카테고리, 이미지)"
}
```

**400 Bad Request** - SKU 중복
```json
{
  "success": false,
  "message": "이미 존재하는 SKU입니다"
}
```

**400 Bad Request** - 가격 검증 실패
```json
{
  "success": false,
  "message": "가격은 0보다 커야 합니다"
}
```

**400 Bad Request** - 카테고리 검증 실패
```json
{
  "success": false,
  "message": "유효하지 않은 카테고리입니다. (상의, 하의, 악세사리)"
}
```

**400 Bad Request** - 이미지 URL 검증 실패
```json
{
  "success": false,
  "message": "유효한 이미지 URL을 입력해주세요"
}
```

---

### 2. 전체 상품 조회 (GET /products)

상품 목록을 조회합니다.

#### 요청

```http
GET /api/products?includeInactive=true&category=상의&page=1&limit=20
```

#### 쿼리 파라미터 (모두 선택사항)

- `includeInactive` (String): 'true'일 경우 비활성 상품 포함 (기본값: 활성 상품만 조회)
- `category` (String): 카테고리 필터 ('상의', '하의', '악세사리')
- `minPrice` (Number): 최소 가격
- `maxPrice` (Number): 최대 가격
- `search` (String): 검색어 (상품명, SKU, 설명에서 검색)
- `page` (Number): 페이지 번호 (기본값: 1)
- `limit` (Number): 페이지당 상품 수 (기본값: 20)

#### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6g7h8i9j0",
      "sku": "TOP001",
      "name": "베이직 티셔츠",
      "price": 29900,
      "category": "상의",
      "image": "https://res.cloudinary.com/xxx/image.jpg",
      "description": "편안한 베이직 티셔츠입니다.",
      "stock": 100,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 3,
    "limit": 20
  }
}
```

---

### 3. SKU로 상품 조회 (GET /products/sku/:sku)

SKU를 기준으로 특정 상품을 조회합니다.

#### 요청

```http
GET /api/products/sku/TOP001
```

#### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6g7h8i9j0",
    "sku": "TOP001",
    "name": "베이직 티셔츠",
    ...
  }
}
```

#### 에러 응답 (404 Not Found)

```json
{
  "success": false,
  "message": "상품을 찾을 수 없습니다"
}
```

---

### 4. ID로 상품 조회 (GET /products/:id)

MongoDB ID를 기준으로 특정 상품을 조회합니다.

#### 요청

```http
GET /api/products/64f8a1b2c3d4e5f6g7h8i9j0
```

#### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6g7h8i9j0",
    "sku": "TOP001",
    "name": "베이직 티셔츠",
    ...
  }
}
```

---

### 5. 상품 수정 (PUT /products/:id)

기존 상품 정보를 수정합니다.

#### 요청

```http
PUT /api/products/64f8a1b2c3d4e5f6g7h8i9j0
Content-Type: application/json

{
  "name": "프리미엄 티셔츠",
  "price": 39900,
  "stock": 150
}
```

#### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "상품이 성공적으로 수정되었습니다",
  "data": {
    "_id": "64f8a1b2c3d4e5f6g7h8i9j0",
    "sku": "TOP001",
    "name": "프리미엄 티셔츠",
    "price": 39900,
    ...
  }
}
```

---

### 6. 재고 수정 (PATCH /products/:id/stock)

상품의 재고만 수정합니다.

#### 요청

```http
PATCH /api/products/64f8a1b2c3d4e5f6g7h8i9j0/stock
Content-Type: application/json

{
  "stock": 200
}
```

#### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "재고가 성공적으로 수정되었습니다",
  "data": {
    ...
    "stock": 200
  }
}
```

---

### 7. 상품 삭제 (DELETE /products/:id)

상품을 소프트 삭제합니다 (isActive를 false로 변경).

#### 요청

```http
DELETE /api/products/64f8a1b2c3d4e5f6g7h8i9j0
```

#### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "상품이 성공적으로 삭제되었습니다"
}
```

---

### 8. 상품 영구 삭제 (DELETE /products/:id/permanent)

상품을 데이터베이스에서 완전히 삭제합니다 (관리자용).

#### 요청

```http
DELETE /api/products/64f8a1b2c3d4e5f6g7h8i9j0/permanent
```

#### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "상품이 영구적으로 삭제되었습니다"
}
```

---

## 테스트 예제

### cURL 예제

#### 상품 등록

```bash
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
```

#### 전체 상품 조회 (관리자용 - 비활성 상품 포함)

```bash
curl http://localhost:5001/api/products?includeInactive=true
```

#### 상품 삭제

```bash
curl -X DELETE http://localhost:5001/api/products/64f8a1b2c3d4e5f6g7h8i9j0
```

### JavaScript (fetch) 예제

```javascript
// 상품 등록
const createProduct = async () => {
  const response = await fetch('http://localhost:5001/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sku: 'TOP001',
      name: '베이직 티셔츠',
      price: 29900,
      category: '상의',
      image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      description: '편안한 베이직 티셔츠',
      stock: 100
    })
  });
  
  const data = await response.json();
  console.log(data);
};

// 전체 상품 조회
const getProducts = async () => {
  const response = await fetch('http://localhost:5001/api/products?includeInactive=true');
  const data = await response.json();
  console.log(data);
};
```

---

## 주의사항

1. **SKU 중복**: SKU는 자동으로 대문자로 변환되며 중복될 수 없습니다.
2. **카테고리**: '상의', '하의', '악세사리' 중 하나여야 합니다.
3. **이미지 URL**: Cloudinary 또는 다른 이미지 호스팅 서비스의 URL을 사용하세요.
4. **소프트 삭제**: 기본 DELETE는 상품을 비활성화만 하며, 데이터는 유지됩니다.
5. **관리자 페이지**: `includeInactive=true` 파라미터를 사용하여 비활성 상품도 조회할 수 있습니다.

---

## 에러 코드 정리

- **200**: 성공 (조회, 수정, 삭제)
- **201**: 생성 성공 (상품 등록)
- **400**: 잘못된 요청 (유효성 검사 실패, 중복 데이터 등)
- **404**: 리소스를 찾을 수 없음
- **500**: 서버 내부 오류

