const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
// const { protect, adminOnly } = require('../middleware/auth');

// 공개 라우트 (누구나 접근 가능)
router.get('/', productController.getAllProducts);
router.get('/sku/:sku', productController.getProductBySku);
router.get('/:id', productController.getProductById);

// 보호된 라우트 (관리자만 접근 가능)
// 나중에 auth 미들웨어를 활성화하려면 주석을 해제하세요
// router.use(protect);
// router.use(adminOnly);

router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.patch('/:id/stock', productController.updateStock);
router.delete('/:id', productController.deleteProduct);
router.delete('/:id/permanent', productController.permanentDeleteProduct);

module.exports = router;

