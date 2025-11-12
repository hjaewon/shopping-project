const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'SKU를 입력해주세요'],
    unique: true,
    trim: true,
    uppercase: true,
    index: true  // 검색 성능 향상을 위한 인덱스
  },
  name: {
    type: String,
    required: [true, '상품명을 입력해주세요'],
    trim: true,
    maxlength: [200, '상품명은 200자를 초과할 수 없습니다']
  },
  price: {
    type: Number,
    required: [true, '상품 가격을 입력해주세요'],
    min: [0, '가격은 0보다 작을 수 없습니다']
  },
  category: {
    type: String,
    required: [true, '카테고리를 선택해주세요'],
    enum: {
      values: ['상의', '하의', '악세사리'],
      message: '{VALUE}는 유효한 카테고리가 아닙니다'
    }
  },
  image: {
    type: String,
    required: [true, '상품 이미지를 등록해주세요']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, '설명은 2000자를 초과할 수 없습니다']
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, '재고는 0보다 작을 수 없습니다']
  },
  isActive: {
    type: Boolean,
    default: true  // 상품 활성화 상태
  }
}, {
  timestamps: true  // createdAt, updatedAt 자동 생성
});

// SKU 중복 체크를 위한 인덱스 에러 처리
productSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    if (error.keyPattern.sku) {
      next(new Error('이미 존재하는 SKU입니다'));
    } else {
      next(error);
    }
  } else {
    next(error);
  }
});

// 가격을 원화 형식으로 반환하는 가상 필드
productSchema.virtual('formattedPrice').get(function() {
  if (typeof this.price !== 'number' || isNaN(this.price)) {
    return '₩0';
  }
  return `₩${this.price.toLocaleString('ko-KR')}`;
});

// JSON 응답 시 가상 필드 포함
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);

