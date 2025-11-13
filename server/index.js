const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// CORS 설정
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL  // Vercel URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // origin이 undefined면 같은 도메인 요청 (Postman, 모바일 등)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS 차단된 origin:', origin);
      callback(null, true);  // 개발 중에는 모두 허용
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
// 우선순위: MONGODB_ATLAS_URL > MONGODB_URI > localhost
console.log('환경 변수 확인:');
console.log('MONGODB_ATLAS_URL:', process.env.MONGODB_ATLAS_URL ? '설정됨 ✓' : '없음 ✗');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '설정됨 ✓' : '없음 ✗');

const mongodbUrl = process.env.MONGODB_ATLAS_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-mall';
console.log('사용할 MongoDB URL:', mongodbUrl);

mongoose.connect(mongodbUrl)
  .then(() => {
    console.log('몽고db연결성공!');
    if (process.env.MONGODB_ATLAS_URL) {
      console.log('MongoDB Atlas 연결됨');
    } else if (process.env.MONGODB_URI) {
      console.log('MongoDB URI 연결됨');
    } else {
      console.log('로컬 MongoDB 연결됨');
    }
  })
  .catch((err) => console.error('몽고db연결실패!', err));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Shopping Mall API',
    status: 'running'
  });
});

// API Routes
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/orders', require('./routes/order.routes'));

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

