const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT 토큰 검증 미들웨어
exports.protect = async (req, res, next) => {
  let token;

  // 헤더에서 토큰 추출
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 토큰이 없으면 에러
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '로그인이 필요합니다'
    });
  }

  try {
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 토큰에서 유저 ID로 유저 찾기
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '유저를 찾을 수 없습니다'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다'
    });
  }
};

