const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWT 토큰 생성
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// 회원가입 (유저 생성)
exports.register = async (req, res) => {
  try {
    const { email, name, password, user_type, address } = req.body;

    // 이메일 중복 체크
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 사용 중인 이메일입니다'
      });
    }

    // 유저 생성
    const user = await User.create({
      email,
      name,
      password,
      user_type: user_type || 'customer',
      address
    });

    // 토큰 생성
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 현재 로그인한 유저 정보 가져오기
exports.getMe = async (req, res) => {
  try {
    // req.user는 auth 미들웨어에서 설정됨
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 이메일과 비밀번호 확인
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 입력해주세요'
      });
    }

    // 유저 찾기 (비밀번호 포함)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다'
      });
    }

    // 비밀번호 확인
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다'
      });
    }

    // 토큰 생성
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: '로그인 성공',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          user_type: user.user_type,
          address: user.address
        },
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 모든 유저 조회
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 특정 유저 조회
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 유저 정보 수정
exports.updateUser = async (req, res) => {
  try {
    const { name, email, address, user_type } = req.body;
    
    // 업데이트할 필드만 객체에 포함
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (user_type) updateData.user_type = user_type;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,  // 업데이트된 문서 반환
        runValidators: true  // 유효성 검사 실행
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      message: '유저 정보가 수정되었습니다',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 비밀번호 변경
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '현재 비밀번호와 새 비밀번호를 입력해주세요'
      });
    }

    // 유저 찾기 (비밀번호 포함)
    const user = await User.findById(req.params.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다'
      });
    }

    // 현재 비밀번호 확인
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: '현재 비밀번호가 올바르지 않습니다'
      });
    }

    // 새 비밀번호 설정
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: '비밀번호가 변경되었습니다'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 유저 삭제
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유저를 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      message: '유저가 삭제되었습니다',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

