const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect } = require('../middleware/auth');

// 모든 라우트는 인증 필요
router.use(protect);

// 주문 생성
router.post('/', orderController.createOrder);

// 내 주문 목록 조회
router.get('/', orderController.getMyOrders);

// 주문 상세 조회
router.get('/:orderId', orderController.getOrderById);

// 주문 취소
router.patch('/:orderId/cancel', orderController.cancelOrder);

// ============ 관리자 전용 라우트 ============

// 결제 완료 처리
router.patch('/:orderId/payment', orderController.completePayment);

// 주문 상태 변경 (confirmed -> preparing)
router.patch('/:orderId/status', orderController.updateOrderStatus);

// 배송 시작
router.patch('/:orderId/shipping', orderController.startShipping);

// 배송 완료
router.patch('/:orderId/delivery', orderController.completeDelivery);

// 모든 주문 조회 (관리자)
router.get('/admin/all', orderController.getAllOrders);

module.exports = router;

