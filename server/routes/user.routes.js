const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

// 회원가입
router.post('/register', userController.register);

// 로그인
router.post('/login', userController.login);

// 현재 로그인한 유저 정보 가져오기 (토큰 필요)
router.get('/me', protect, userController.getMe);

// 모든 유저 조회
router.get('/', userController.getAllUsers);

// 특정 유저 조회
router.get('/:id', userController.getUserById);

// 유저 정보 수정
router.put('/:id', userController.updateUser);

// 비밀번호 변경
router.put('/:id/password', userController.updatePassword);

// 유저 삭제
router.delete('/:id', userController.deleteUser);

module.exports = router;

