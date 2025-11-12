/**
 * Product API 테스트 스크립트
 * 
 * 사용법:
 * 1. 서버가 실행 중인지 확인 (npm run dev)
 * 2. 이 스크립트 실행: node test-api.js
 */

const BASE_URL = 'http://localhost:5001/api';

// 색상 출력용 헬퍼
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.blue}━━━ ${msg} ━━━${colors.reset}\n`)
};

// 테스트용 상품 데이터
const testProduct = {
  sku: 'TEST001',
  name: '테스트 상품',
  price: 29900,
  category: '상의',
  image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  description: 'API 테스트를 위한 상품입니다.',
  stock: 100
};

let createdProductId = null;

// API 호출 헬퍼 함수
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

// 테스트 1: 상품 등록
async function testCreateProduct() {
  log.section('테스트 1: 상품 등록 (POST /products)');
  
  const result = await apiCall('/products', {
    method: 'POST',
    body: JSON.stringify(testProduct)
  });

  if (result.ok && result.data.success) {
    createdProductId = result.data.data._id;
    log.success(`상품 등록 성공! ID: ${createdProductId}`);
    console.log('등록된 상품:', result.data.data);
    return true;
  } else {
    log.error(`상품 등록 실패: ${result.data.message || '알 수 없는 오류'}`);
    return false;
  }
}

// 테스트 2: 전체 상품 조회
async function testGetAllProducts() {
  log.section('테스트 2: 전체 상품 조회 (GET /products)');
  
  const result = await apiCall('/products?includeInactive=true');

  if (result.ok && result.data.success) {
    log.success(`상품 목록 조회 성공! 총 ${result.data.data.length}개 상품`);
    console.log('페이지네이션:', result.data.pagination);
    return true;
  } else {
    log.error('상품 목록 조회 실패');
    return false;
  }
}

// 테스트 3: SKU로 상품 조회
async function testGetProductBySku() {
  log.section('테스트 3: SKU로 상품 조회 (GET /products/sku/:sku)');
  
  const result = await apiCall(`/products/sku/${testProduct.sku}`);

  if (result.ok && result.data.success) {
    log.success(`SKU로 상품 조회 성공!`);
    console.log('조회된 상품:', result.data.data);
    return true;
  } else {
    log.error('SKU로 상품 조회 실패');
    return false;
  }
}

// 테스트 4: ID로 상품 조회
async function testGetProductById() {
  if (!createdProductId) {
    log.error('테스트를 건너뜁니다 (상품 ID 없음)');
    return false;
  }

  log.section('테스트 4: ID로 상품 조회 (GET /products/:id)');
  
  const result = await apiCall(`/products/${createdProductId}`);

  if (result.ok && result.data.success) {
    log.success('ID로 상품 조회 성공!');
    console.log('조회된 상품:', result.data.data);
    return true;
  } else {
    log.error('ID로 상품 조회 실패');
    return false;
  }
}

// 테스트 5: 상품 수정
async function testUpdateProduct() {
  if (!createdProductId) {
    log.error('테스트를 건너뜁니다 (상품 ID 없음)');
    return false;
  }

  log.section('테스트 5: 상품 수정 (PUT /products/:id)');
  
  const updateData = {
    name: '수정된 테스트 상품',
    price: 39900,
    stock: 150
  };

  const result = await apiCall(`/products/${createdProductId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });

  if (result.ok && result.data.success) {
    log.success('상품 수정 성공!');
    console.log('수정된 상품:', result.data.data);
    return true;
  } else {
    log.error(`상품 수정 실패: ${result.data.message || '알 수 없는 오류'}`);
    return false;
  }
}

// 테스트 6: 재고 수정
async function testUpdateStock() {
  if (!createdProductId) {
    log.error('테스트를 건너뜁니다 (상품 ID 없음)');
    return false;
  }

  log.section('테스트 6: 재고 수정 (PATCH /products/:id/stock)');
  
  const result = await apiCall(`/products/${createdProductId}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ stock: 200 })
  });

  if (result.ok && result.data.success) {
    log.success('재고 수정 성공!');
    console.log('수정된 재고:', result.data.data.stock);
    return true;
  } else {
    log.error(`재고 수정 실패: ${result.data.message || '알 수 없는 오류'}`);
    return false;
  }
}

// 테스트 7: 상품 삭제 (소프트 삭제)
async function testDeleteProduct() {
  if (!createdProductId) {
    log.error('테스트를 건너뜁니다 (상품 ID 없음)');
    return false;
  }

  log.section('테스트 7: 상품 삭제 (DELETE /products/:id)');
  
  const result = await apiCall(`/products/${createdProductId}`, {
    method: 'DELETE'
  });

  if (result.ok && result.data.success) {
    log.success('상품 삭제 성공! (소프트 삭제)');
    return true;
  } else {
    log.error(`상품 삭제 실패: ${result.data.message || '알 수 없는 오류'}`);
    return false;
  }
}

// 테스트 8: 상품 영구 삭제
async function testPermanentDelete() {
  if (!createdProductId) {
    log.error('테스트를 건너뜁니다 (상품 ID 없음)');
    return false;
  }

  log.section('테스트 8: 상품 영구 삭제 (DELETE /products/:id/permanent)');
  
  const result = await apiCall(`/products/${createdProductId}/permanent`, {
    method: 'DELETE'
  });

  if (result.ok && result.data.success) {
    log.success('상품 영구 삭제 성공!');
    return true;
  } else {
    log.error(`상품 영구 삭제 실패: ${result.data.message || '알 수 없는 오류'}`);
    return false;
  }
}

// 테스트 9: 유효성 검사 테스트
async function testValidation() {
  log.section('테스트 9: 유효성 검사');

  // 필수 필드 누락 테스트
  log.info('9-1. 필수 필드 누락 테스트');
  const result1 = await apiCall('/products', {
    method: 'POST',
    body: JSON.stringify({ name: '테스트' })
  });
  
  if (!result1.ok && result1.data.message.includes('필수 필드')) {
    log.success('필수 필드 검증 작동 확인');
  } else {
    log.error('필수 필드 검증 실패');
  }

  // 잘못된 카테고리 테스트
  log.info('9-2. 잘못된 카테고리 테스트');
  const result2 = await apiCall('/products', {
    method: 'POST',
    body: JSON.stringify({
      ...testProduct,
      sku: 'INVALID001',
      category: '잘못된카테고리'
    })
  });
  
  if (!result2.ok && result2.data.message.includes('카테고리')) {
    log.success('카테고리 검증 작동 확인');
  } else {
    log.error('카테고리 검증 실패');
  }

  // 가격 검증 테스트
  log.info('9-3. 가격 검증 테스트');
  const result3 = await apiCall('/products', {
    method: 'POST',
    body: JSON.stringify({
      ...testProduct,
      sku: 'INVALID002',
      price: -1000
    })
  });
  
  if (!result3.ok && result3.data.message.includes('가격')) {
    log.success('가격 검증 작동 확인');
  } else {
    log.error('가격 검증 실패');
  }

  return true;
}

// 모든 테스트 실행
async function runAllTests() {
  console.log(`${colors.yellow}
╔═══════════════════════════════════════════════╗
║       Product API 테스트 시작              ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

  log.info(`서버 주소: ${BASE_URL}`);
  log.info('테스트를 시작합니다...\n');

  const results = {
    passed: 0,
    failed: 0
  };

  // 테스트 실행
  const tests = [
    { name: '상품 등록', fn: testCreateProduct },
    { name: '전체 상품 조회', fn: testGetAllProducts },
    { name: 'SKU로 상품 조회', fn: testGetProductBySku },
    { name: 'ID로 상품 조회', fn: testGetProductById },
    { name: '상품 수정', fn: testUpdateProduct },
    { name: '재고 수정', fn: testUpdateStock },
    { name: '상품 삭제', fn: testDeleteProduct },
    { name: '상품 영구 삭제', fn: testPermanentDelete },
    { name: '유효성 검사', fn: testValidation }
  ];

  for (const test of tests) {
    try {
      const passed = await test.fn();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      log.error(`테스트 실행 중 오류: ${error.message}`);
      results.failed++;
    }
  }

  // 결과 출력
  console.log(`\n${colors.yellow}╔═══════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.yellow}║           테스트 결과                      ║${colors.reset}`);
  console.log(`${colors.yellow}╚═══════════════════════════════════════════════╝${colors.reset}\n`);
  
  console.log(`${colors.green}통과: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}실패: ${results.failed}${colors.reset}`);
  console.log(`총: ${results.passed + results.failed}\n`);

  if (results.failed === 0) {
    log.success('모든 테스트가 통과했습니다! 🎉');
  } else {
    log.error('일부 테스트가 실패했습니다.');
  }
}

// 스크립트 실행
if (typeof window === 'undefined') {
  // Node.js 환경
  runAllTests().catch(error => {
    log.error(`테스트 실행 실패: ${error.message}`);
    process.exit(1);
  });
} else {
  // 브라우저 환경
  console.log('이 스크립트는 Node.js에서 실행해야 합니다.');
}

