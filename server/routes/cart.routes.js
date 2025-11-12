const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth');

// 모든 라우트는 인증 필요
router.use(protect);

// 장바구니 조회
router.get('/', cartController.getCart);

// 장바구니 아이템 개수 조회
router.get('/count', cartController.getCartCount);

// 장바구니에 상품 추가
router.post('/items', cartController.addToCart);

// 장바구니 아이템 수량 변경
router.patch('/items/:itemId', cartController.updateCartItem);

// 장바구니 아이템 삭제
router.delete('/items/:itemId', cartController.removeCartItem);

// 장바구니 비우기
router.delete('/', cartController.clearCart);

module.exports = router;

