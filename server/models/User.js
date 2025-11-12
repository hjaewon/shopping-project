const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, '이메일을 입력해주세요'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      '유효한 이메일 주소를 입력해주세요'
    ]
  },
  name: {
    type: String,
    required: [true, '이름을 입력해주세요'],
    trim: true
  },
  password: {
    type: String,
    required: [true, '비밀번호를 입력해주세요'],
    minlength: [6, '비밀번호는 최소 6자 이상이어야 합니다'],
    select: false  // 조회 시 기본적으로 비밀번호 제외
  },
  user_type: {
    type: String,
    required: [true, '유저 타입을 선택해주세요'],
    enum: {
      values: ['customer', 'admin'],
      message: '{VALUE}는 유효한 유저 타입이 아닙니다'
    },
    default: 'customer'
  },
  address: {
    type: String,
    trim: true
  }
}, {
  timestamps: true  // createdAt, updatedAt 자동 생성
});

// 비밀번호 저장 전 해싱
userSchema.pre('save', async function(next) {
  // 비밀번호가 수정되지 않았으면 다음으로
  if (!this.isModified('password')) {
    return next();
  }
  
  // 비밀번호 해싱
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 비밀번호 비교 메서드
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// JSON 응답 시 비밀번호 제거
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

