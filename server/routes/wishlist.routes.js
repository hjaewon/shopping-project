const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { protect } = require('../middleware/auth');

// 모든 라우트는 인증 필요
router.use(protect);

// 위시리스트 조회
router.get('/', wishlistController.getWishlist);

// 위시리스트에 상품 추가
router.post('/items', wishlistController.addToWishlist);

// 위시리스트에서 상품 제거
router.delete('/items/:productId', wishlistController.removeFromWishlist);

// 위시리스트 전체 삭제
router.delete('/', wishlistController.clearWishlist);

// 특정 상품의 찜하기 여부 확인
router.get('/check/:productId', wishlistController.checkWishlistItem);

module.exports = router;

