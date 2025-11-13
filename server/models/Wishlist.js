const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, '상품 정보가 필요합니다']
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: true
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '사용자 정보가 필요합니다'],
    unique: true,  // 한 사용자당 하나의 위시리스트만
    index: true
  },
  items: [wishlistItemSchema]
}, {
  timestamps: true  // createdAt, updatedAt 자동 생성
});

// 찜하기 추가 메서드
wishlistSchema.methods.addItem = function(productId) {
  // 이미 찜한 상품인지 확인
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString()
  );

  if (existingItemIndex > -1) {
    // 이미 찜한 상품이면 아무 작업 안 함 (또는 에러 반환)
    return this.save();
  }

  // 새 아이템 추가
  this.items.push({
    product: productId,
    addedAt: new Date()
  });

  return this.save();
};

// 찜하기 제거 메서드
wishlistSchema.methods.removeItem = function(productId) {
  const itemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString()
  );

  if (itemIndex === -1) {
    throw new Error('찜한 상품을 찾을 수 없습니다');
  }

  this.items.splice(itemIndex, 1);
  return this.save();
};

// 찜하기 여부 확인 메서드
wishlistSchema.methods.hasItem = function(productId) {
  return this.items.some(item => 
    item.product.toString() === productId.toString()
  );
};

// 찜한 상품 개수 가상 필드
wishlistSchema.virtual('totalItems').get(function() {
  return this.items.length;
});

// JSON 응답 시 가상 필드 포함
wishlistSchema.set('toJSON', { virtuals: true });
wishlistSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);

