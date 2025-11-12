const mongoose = require('mongoose');

// 주문 상품 아이템 스키마
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, '상품 정보가 필요합니다']
  },
  quantity: {
    type: Number,
    required: [true, '수량을 입력해주세요'],
    min: [1, '수량은 최소 1개 이상이어야 합니다']
  },
  selectedSize: {
    type: String,
    required: [true, '사이즈 정보가 필요합니다'],
    trim: true,
    uppercase: true
  },
  priceAtOrder: {
    type: Number,
    required: [true, '주문 시점의 가격 정보가 필요합니다'],
    min: [0, '가격은 0보다 작을 수 없습니다']
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  _id: true
});

const orderSchema = new mongoose.Schema({
  // 주문번호 (자동 생성)
  orderNumber: {
    type: String,
    required: false,
    unique: true,
    index: true
  },
  
  // 주문한 사용자
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '사용자 정보가 필요합니다'],
    index: true
  },
  
  // 주문 상품 목록
  items: {
    type: [orderItemSchema],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: '주문 상품이 최소 1개 이상 필요합니다'
    }
  },
  
  // 배송 정보
  shippingInfo: {
    recipientName: {
      type: String,
      required: [true, '수령인 이름을 입력해주세요'],
      trim: true
    },
    recipientPhone: {
      type: String,
      required: [true, '수령인 전화번호를 입력해주세요'],
      trim: true,
      match: [
        /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
        '유효한 전화번호를 입력해주세요'
      ]
    },
    address: {
      type: String,
      required: [true, '배송지 주소를 입력해주세요'],
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    deliveryRequest: {
      type: String,
      trim: true,
      maxlength: [200, '배송 요청사항은 200자를 초과할 수 없습니다']
    }
  },
  
  // 결제 정보
  payment: {
    method: {
      type: String,
      required: [true, '결제 수단을 선택해주세요'],
      enum: {
        values: ['card', 'transfer', 'virtual_account', 'mobile'],
        message: '{VALUE}는 유효한 결제 수단이 아닙니다'
      }
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['pending', 'completed', 'failed', 'refunded'],
        message: '{VALUE}는 유효한 결제 상태가 아닙니다'
      },
      default: 'pending'
    },
    paidAt: {
      type: Date
    },
    transactionId: {
      type: String,
      trim: true
    }
  },
  
  // 금액 정보
  pricing: {
    itemsTotal: {
      type: Number,
      required: [true, '상품 총액이 필요합니다'],
      min: [0, '상품 총액은 0보다 작을 수 없습니다']
    },
    finalTotal: {
      type: Number,
      required: [true, '최종 결제 금액이 필요합니다'],
      min: [0, '최종 결제 금액은 0보다 작을 수 없습니다']
    }
  },
  
  // 주문 상태
  orderStatus: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'],
      message: '{VALUE}는 유효한 주문 상태가 아닙니다'
    },
    default: 'pending'
  },
  
  // 배송 추적
  tracking: {
    carrier: {
      type: String,
      trim: true
    },
    trackingNumber: {
      type: String,
      trim: true
    },
    shippedAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    }
  },
  
  // 취소 정보
  cancellation: {
    isCancelled: {
      type: Boolean,
      default: false
    },
    cancelledAt: {
      type: Date
    },
    cancelReason: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true  // createdAt, updatedAt 자동 생성
});

// 주문번호는 controller에서 생성되므로 pre-save 훅 불필요

// 주문 취소 메서드
orderSchema.methods.cancelOrder = function(reason) {
  if (this.orderStatus === 'delivered') {
    throw new Error('배송 완료된 주문은 취소할 수 없습니다');
  }
  
  if (this.orderStatus === 'cancelled') {
    throw new Error('이미 취소된 주문입니다');
  }
  
  this.orderStatus = 'cancelled';
  this.cancellation.isCancelled = true;
  this.cancellation.cancelledAt = new Date();
  this.cancellation.cancelReason = reason;
  this.payment.status = 'refunded';
  
  return this.save();
};

// 배송 시작 메서드
orderSchema.methods.startShipping = function(carrier, trackingNumber) {
  if (this.orderStatus !== 'preparing') {
    throw new Error('배송 준비 중인 주문만 배송을 시작할 수 있습니다');
  }
  
  this.orderStatus = 'shipping';
  this.tracking.carrier = carrier;
  this.tracking.trackingNumber = trackingNumber;
  this.tracking.shippedAt = new Date();
  
  return this.save();
};

// 배송 완료 메서드
orderSchema.methods.completeDelivery = function() {
  if (this.orderStatus !== 'shipping') {
    throw new Error('배송 중인 주문만 배송 완료 처리할 수 있습니다');
  }
  
  this.orderStatus = 'delivered';
  this.tracking.deliveredAt = new Date();
  
  return this.save();
};

// 결제 완료 메서드
orderSchema.methods.completePayment = function(transactionId) {
  if (this.payment.status === 'completed') {
    throw new Error('이미 결제가 완료된 주문입니다');
  }
  
  this.payment.status = 'completed';
  this.payment.paidAt = new Date();
  this.payment.transactionId = transactionId;
  this.orderStatus = 'confirmed';
  
  return this.save();
};

// 가상 필드: 총 주문 수량
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// JSON 응답 시 가상 필드 포함
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

// 주문번호 중복 체크를 위한 인덱스 에러 처리
orderSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    if (error.keyPattern.orderNumber) {
      next(new Error('주문번호 생성 중 오류가 발생했습니다'));
    } else {
      next(error);
    }
  } else {
    next(error);
  }
});

module.exports = mongoose.model('Order', orderSchema);

