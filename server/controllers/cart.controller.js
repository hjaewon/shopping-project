const Cart = require('../models/Cart');
const Product = require('../models/Product');

// 장바구니 조회
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId }).populate('items.product');

    // 장바구니가 없으면 빈 장바구니 생성
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // 삭제된 상품(null) 필터링 및 유효성 검증
    if (cart.items && cart.items.length > 0) {
      const validItems = cart.items.filter(item => {
        // product가 null이거나 삭제된 경우 제외
        if (!item.product) {
          console.warn('상품 정보가 없는 아이템 발견:', item._id);
          return false;
        }
        // 필수 필드 확인
        if (!item.priceAtAdd || !item.quantity) {
          console.warn('필수 필드가 없는 아이템 발견:', item._id);
          return false;
        }
        return true;
      });

      // 유효한 아이템만 남기고, 변경사항이 있으면 저장
      if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        await cart.save();
      }
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('장바구니 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '장바구니 조회 중 오류가 발생했습니다'
    });
  }
};

// 장바구니에 상품 추가
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1, selectedColor, selectedSize } = req.body;

    // 필수 필드 검증
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: '상품 ID가 필요합니다'
      });
    }

    // 수량 검증
    if (quantity < 1 || quantity > 99) {
      return res.status(400).json({
        success: false,
        message: '수량은 1~99 사이여야 합니다'
      });
    }

    // 상품 존재 확인
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다'
      });
    }

    // 재고 확인
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: '재고가 부족합니다'
      });
    }

    // 장바구니 조회 또는 생성
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // 장바구니에 상품 추가
    await cart.addItem(productId, quantity, selectedColor, selectedSize, product.price);

    // 업데이트된 장바구니 조회 (populate 포함)
    cart = await Cart.findOne({ user: userId }).populate('items.product');

    res.status(200).json({
      success: true,
      message: '장바구니에 상품이 추가되었습니다',
      data: cart
    });
  } catch (error) {
    console.error('장바구니 추가 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message || '장바구니에 상품을 추가하는 중 오류가 발생했습니다'
    });
  }
};

// 장바구니 아이템 수량 변경
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    // 수량 검증
    if (!quantity || quantity < 1 || quantity > 99) {
      return res.status(400).json({
        success: false,
        message: '수량은 1~99 사이여야 합니다'
      });
    }

    // 장바구니 조회
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다'
      });
    }

    // 아이템 수량 변경
    await cart.updateItemQuantity(itemId, quantity);

    // 업데이트된 장바구니 조회 (populate 포함)
    cart = await Cart.findOne({ user: userId }).populate('items.product');

    res.status(200).json({
      success: true,
      message: '수량이 변경되었습니다',
      data: cart
    });
  } catch (error) {
    console.error('장바구니 수량 변경 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message || '수량 변경 중 오류가 발생했습니다'
    });
  }
};

// 장바구니 아이템 삭제
exports.removeCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    // 장바구니 조회
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다'
      });
    }

    // 아이템 제거
    await cart.removeItem(itemId);

    // 업데이트된 장바구니 조회 (populate 포함)
    cart = await Cart.findOne({ user: userId }).populate('items.product');

    res.status(200).json({
      success: true,
      message: '아이템이 삭제되었습니다',
      data: cart
    });
  } catch (error) {
    console.error('장바구니 아이템 삭제 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message || '아이템 삭제 중 오류가 발생했습니다'
    });
  }
};

// 장바구니 비우기
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    // 장바구니 조회
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다'
      });
    }

    // 장바구니 비우기
    await cart.clearCart();

    res.status(200).json({
      success: true,
      message: '장바구니가 비워졌습니다',
      data: cart
    });
  } catch (error) {
    console.error('장바구니 비우기 에러:', error);
    res.status(500).json({
      success: false,
      message: '장바구니를 비우는 중 오류가 발생했습니다'
    });
  }
};

// 장바구니 아이템 개수 조회
exports.getCartCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });

    const count = cart ? cart.totalItems : 0;

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('장바구니 개수 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '장바구니 개수 조회 중 오류가 발생했습니다'
    });
  }
};

