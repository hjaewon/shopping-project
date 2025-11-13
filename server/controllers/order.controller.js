const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const axios = require('axios');

// @desc    주문 생성
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingInfo, payment } = req.body;

    // 입력 검증
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '주문할 상품을 선택해주세요'
      });
    }

    if (!shippingInfo || !payment) {
      return res.status(400).json({
        success: false,
        message: '배송 정보와 결제 정보를 입력해주세요'
      });
    }

    // 주문 아이템 검증 및 가격 계산
    let itemsTotal = 0;
    const orderItems = [];

    console.log('주문 아이템 검증 시작:', items);

    for (const item of items) {
      console.log('상품 조회 중:', item.product);
      
      const product = await Product.findById(item.product);
      
      if (!product) {
        console.error('상품을 찾을 수 없음:', item.product);
        return res.status(404).json({
          success: false,
          message: `상품을 찾을 수 없습니다: ${item.product}`
        });
      }

      console.log('상품 찾음:', product.name, '재고:', product.stock);

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `${product.name}은(는) 현재 판매하지 않는 상품입니다`
        });
      }

      // 재고 확인
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name}의 재고가 부족합니다. (재고: ${product.stock}개)`
        });
      }

      const subtotal = product.price * item.quantity;
      itemsTotal += subtotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        priceAtOrder: product.price,
        subtotal: subtotal
      });

      // 재고 감소
      product.stock -= item.quantity;
      await product.save();
      console.log('재고 감소 완료. 남은 재고:', product.stock);
    }

    console.log('주문 아이템 검증 완료. 총액:', itemsTotal);

    // 결제 검증 (포트원 API)
    let paymentStatus = 'pending';
    let orderStatus = 'confirmed';  // 기본값을 confirmed로 변경
    let verifiedAmount = 0;

    if (payment.transactionId) {
      console.log('결제 검증 시작:', payment.transactionId);
      
      // 1. 중복 주문 체크 (같은 transactionId로 이미 주문이 있는지)
      const existingOrder = await Order.findOne({ 
        'payment.transactionId': payment.transactionId 
      });
      
      if (existingOrder) {
        console.error('중복 주문 시도 감지:', payment.transactionId);
        return res.status(400).json({
          success: false,
          message: '이미 처리된 결제입니다. 중복 주문을 방지합니다.'
        });
      }

      // 2. 포트원 결제 검증
      try {
        // 포트원 액세스 토큰 발급
        const getToken = await axios.post('https://api.iamport.kr/users/getToken', {
          imp_key: process.env.IMP_API_KEY, // 환경변수에 설정 필요
          imp_secret: process.env.IMP_API_SECRET // 환경변수에 설정 필요
        });

        const accessToken = getToken.data.response.access_token;

        // 결제 정보 조회
        const getPaymentData = await axios.get(
          `https://api.iamport.kr/payments/${payment.transactionId}`,
          { headers: { Authorization: accessToken } }
        );

        const paymentData = getPaymentData.data.response;
        console.log('포트원 결제 정보:', paymentData);

        // 결제 금액 검증
        if (paymentData.amount !== itemsTotal) {
          console.error('결제 금액 불일치:', {
            expected: itemsTotal,
            actual: paymentData.amount
          });
          return res.status(400).json({
            success: false,
            message: '결제 금액이 일치하지 않습니다. 위조된 결제 시도입니다.'
          });
        }

        // 결제 상태 검증
        if (paymentData.status !== 'paid') {
          console.error('결제 미완료:', paymentData.status);
          return res.status(400).json({
            success: false,
            message: '결제가 완료되지 않았습니다.'
          });
        }

        console.log('결제 검증 성공');
        paymentStatus = 'completed';
        orderStatus = 'confirmed';
        verifiedAmount = paymentData.amount;

      } catch (verifyError) {
        console.error('결제 검증 실패:', verifyError.message);
        
        // 포트원 API 키가 없는 경우 개발 모드에서는 경고만 출력
        if (process.env.NODE_ENV === 'development' && !process.env.IMP_API_KEY) {
          console.warn('⚠️  개발 모드: 포트원 API 키가 설정되지 않아 결제 검증을 건너뜁니다.');
          console.warn('⚠️  프로덕션에서는 반드시 IMP_API_KEY와 IMP_API_SECRET을 설정하세요!');
          paymentStatus = 'completed';
          orderStatus = 'confirmed';
        } else {
          // 프로덕션에서는 검증 실패 시 주문 차단
          return res.status(400).json({
            success: false,
            message: '결제 검증에 실패했습니다.',
            error: verifyError.message
          });
        }
      }
    }

    // 주문번호 생성
    const generateOrderNumber = async () => {
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const orderNumber = `ORD-${dateStr}-${randomNum}`;
        
        // 중복 체크
        const exists = await Order.findOne({ orderNumber: orderNumber });
        if (!exists) {
          console.log('주문번호 생성 완료:', orderNumber);
          return orderNumber;
        }
        
        attempts++;
      }
      
      throw new Error('주문번호 생성에 실패했습니다. 다시 시도해주세요.');
    };

    console.log('주문번호 생성 중...');
    const orderNumber = await generateOrderNumber();

    // 주문 데이터 준비
    const orderData = {
      orderNumber: orderNumber,
      user: req.user._id,
      items: orderItems,
      shippingInfo: {
        recipientName: shippingInfo.recipientName,
        recipientPhone: shippingInfo.recipientPhone,
        address: shippingInfo.address,
        postalCode: shippingInfo.postalCode,
        deliveryRequest: shippingInfo.deliveryRequest
      },
      payment: {
        method: payment.method,
        status: paymentStatus,
        transactionId: payment.transactionId || undefined,
        paidAt: payment.transactionId ? new Date() : undefined
      },
      pricing: {
        itemsTotal: itemsTotal,
        finalTotal: itemsTotal
      },
      orderStatus: orderStatus
    };

    console.log('주문 생성 중...', JSON.stringify(orderData, null, 2));

    // 주문 생성
    const order = await Order.create(orderData);
    
    console.log('주문 생성 완료:', order._id);

    // 주문 생성 후 장바구니 비우기 (선택사항)
    try {
      const cart = await Cart.findOne({ user: req.user._id });
      if (cart) {
        await cart.clearCart();
      }
    } catch (error) {
      // 장바구니 비우기 실패해도 주문은 성공으로 처리
      console.error('장바구니 비우기 실패:', error);
    }

    // 생성된 주문 조회 (populate 포함)
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name sku image category');

    res.status(201).json({
      success: true,
      message: '주문이 성공적으로 생성되었습니다',
      data: populatedOrder
    });

  } catch (error) {
    console.error('주문 생성 오류:', error);
    console.error('에러 스택:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || '주문 생성 중 오류가 발생했습니다',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    내 주문 목록 조회
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name sku image category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('주문 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문 목록 조회 중 오류가 발생했습니다'
    });
  }
};

// @desc    주문 상세 조회
// @route   GET /api/orders/:orderId
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email')
      .populate('items.product', 'name sku image category price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다'
      });
    }

    // 본인의 주문이거나 관리자인 경우만 조회 가능
    if (order.user._id.toString() !== req.user._id.toString() && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '접근 권한이 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('주문 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문 조회 중 오류가 발생했습니다'
    });
  }
};

// @desc    주문 취소
// @route   PATCH /api/orders/:orderId/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const { cancelReason } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다'
      });
    }

    // 본인의 주문인지 확인
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: '접근 권한이 없습니다'
      });
    }

    // 주문 취소 (모델의 메서드 사용)
    await order.cancelOrder(cancelReason || '고객 요청');

    // 재고 복구
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    res.status(200).json({
      success: true,
      message: '주문이 취소되었습니다',
      data: order
    });

  } catch (error) {
    console.error('주문 취소 오류:', error);
    res.status(400).json({
      success: false,
      message: error.message || '주문 취소 중 오류가 발생했습니다'
    });
  }
};

// @desc    결제 완료 처리
// @route   PATCH /api/orders/:orderId/payment
// @access  Private (Admin)
exports.completePayment = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 접근 가능합니다'
      });
    }

    const { transactionId } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다'
      });
    }

    // 결제 완료 처리
    await order.completePayment(transactionId);

    res.status(200).json({
      success: true,
      message: '결제가 완료되었습니다',
      data: order
    });

  } catch (error) {
    console.error('결제 완료 처리 오류:', error);
    res.status(400).json({
      success: false,
      message: error.message || '결제 처리 중 오류가 발생했습니다'
    });
  }
};

// @desc    주문 상태 변경 (confirmed -> preparing)
// @route   PATCH /api/orders/:orderId/status
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 접근 가능합니다'
      });
    }

    const { status } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다'
      });
    }

    // 유효한 상태값 확인
    const validStatuses = ['confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 주문 상태입니다'
      });
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: '주문 상태가 변경되었습니다',
      data: order
    });

  } catch (error) {
    console.error('주문 상태 변경 오류:', error);
    res.status(400).json({
      success: false,
      message: error.message || '주문 상태 변경 중 오류가 발생했습니다'
    });
  }
};

// @desc    배송 시작
// @route   PATCH /api/orders/:orderId/shipping
// @access  Private (Admin)
exports.startShipping = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 접근 가능합니다'
      });
    }

    const { carrier, trackingNumber } = req.body;

    if (!carrier || !trackingNumber) {
      return res.status(400).json({
        success: false,
        message: '택배사와 운송장번호를 입력해주세요'
      });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다'
      });
    }

    // 배송 시작
    await order.startShipping(carrier, trackingNumber);

    res.status(200).json({
      success: true,
      message: '배송이 시작되었습니다',
      data: order
    });

  } catch (error) {
    console.error('배송 시작 오류:', error);
    res.status(400).json({
      success: false,
      message: error.message || '배송 시작 처리 중 오류가 발생했습니다'
    });
  }
};

// @desc    배송 완료
// @route   PATCH /api/orders/:orderId/delivery
// @access  Private (Admin)
exports.completeDelivery = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 접근 가능합니다'
      });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다'
      });
    }

    // 배송 완료
    await order.completeDelivery();

    res.status(200).json({
      success: true,
      message: '배송이 완료되었습니다',
      data: order
    });

  } catch (error) {
    console.error('배송 완료 처리 오류:', error);
    res.status(400).json({
      success: false,
      message: error.message || '배송 완료 처리 중 오류가 발생했습니다'
    });
  }
};

// @desc    모든 주문 조회 (관리자)
// @route   GET /api/orders/admin/all
// @access  Private (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 접근 가능합니다'
      });
    }

    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('items.product', 'name sku image category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('전체 주문 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문 조회 중 오류가 발생했습니다'
    });
  }
};

