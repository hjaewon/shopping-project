const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, '상품을 선택해주세요']
  },
  quantity: {
    type: Number,
    required: [true, '수량을 입력해주세요'],
    min: [1, '수량은 최소 1개 이상이어야 합니다'],
    max: [99, '수량은 최대 99개까지 가능합니다'],
    default: 1
  },
  selectedColor: {
    type: String,
    required: [true, '색상을 선택해주세요'],
    trim: true
  },
  selectedSize: {
    type: String,
    required: [true, '사이즈를 선택해주세요'],
    trim: true,
    uppercase: true
  },
  priceAtAdd: {
    type: Number,
    required: [true, '가격 정보가 필요합니다'],
    min: [0, '가격은 0보다 작을 수 없습니다']
  }
}, {
  _id: true  // 각 아이템에 고유 ID 부여
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '사용자 정보가 필요합니다'],
    unique: true,  // 한 사용자당 하나의 장바구니만
    index: true  // 빠른 조회를 위한 인덱스
  },
  items: [cartItemSchema]
}, {
  timestamps: true  // createdAt, updatedAt 자동 생성
});

// 장바구니 총 금액 계산 (가상 필드)
cartSchema.virtual('totalPrice').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.priceAtAdd * item.quantity);
  }, 0);
});

// 장바구니 총 아이템 개수 계산 (가상 필드)
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
});

// 장바구니에 상품 추가 메서드
cartSchema.methods.addItem = function(productId, quantity, color, size, price) {
  // 동일한 상품, 색상, 사이즈가 있는지 확인
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() &&
    item.selectedColor === color &&
    item.selectedSize === size
  );

  if (existingItemIndex > -1) {
    // 기존 아이템의 수량 증가
    this.items[existingItemIndex].quantity += quantity;
    
    // 최대 수량 제한
    if (this.items[existingItemIndex].quantity > 99) {
      this.items[existingItemIndex].quantity = 99;
    }
  } else {
    // 새 아이템 추가
    this.items.push({
      product: productId,
      quantity: quantity,
      selectedColor: color,
      selectedSize: size,
      priceAtAdd: price
    });
  }

  return this.save();
};

// 장바구니 아이템 수량 변경 메서드
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.id(itemId);
  
  if (!item) {
    throw new Error('장바구니 아이템을 찾을 수 없습니다');
  }

  if (quantity < 1) {
    throw new Error('수량은 최소 1개 이상이어야 합니다');
  }

  if (quantity > 99) {
    throw new Error('수량은 최대 99개까지 가능합니다');
  }

  item.quantity = quantity;
  return this.save();
};

// 장바구니 아이템 제거 메서드
cartSchema.methods.removeItem = function(itemId) {
  const item = this.items.id(itemId);
  
  if (!item) {
    throw new Error('장바구니 아이템을 찾을 수 없습니다');
  }

  item.deleteOne();
  return this.save();
};

// 장바구니 비우기 메서드
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

// JSON 응답 시 가상 필드 포함
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

// 사용자 ID 중복 체크를 위한 인덱스 에러 처리
cartSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    if (error.keyPattern.user) {
      next(new Error('이미 장바구니가 존재합니다'));
    } else {
      next(error);
    }
  } else {
    next(error);
  }
});

module.exports = mongoose.model('Cart', cartSchema);

