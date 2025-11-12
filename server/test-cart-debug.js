// 장바구니 데이터 디버깅 스크립트
const mongoose = require('mongoose');
require('dotenv').config();

const Cart = require('./models/Cart');

async function debugCart() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-mall');
    console.log('MongoDB 연결 성공');

    const carts = await Cart.find({}).populate('items.product');
    
    console.log('\n=== 전체 장바구니 개수:', carts.length, '===\n');

    carts.forEach((cart, index) => {
      console.log(`\n[장바구니 ${index + 1}] User ID: ${cart.user}`);
      console.log(`아이템 개수: ${cart.items.length}`);
      
      cart.items.forEach((item, itemIndex) => {
        console.log(`\n  아이템 ${itemIndex + 1}:`);
        console.log(`    _id: ${item._id}`);
        console.log(`    product: ${item.product ? item.product._id : 'NULL ❌'}`);
        console.log(`    product.name: ${item.product?.name || 'NULL ❌'}`);
        console.log(`    priceAtAdd: ${item.priceAtAdd} ${typeof item.priceAtAdd !== 'number' ? '❌ 타입 에러!' : '✅'}`);
        console.log(`    quantity: ${item.quantity} ${typeof item.quantity !== 'number' ? '❌ 타입 에러!' : '✅'}`);
        console.log(`    selectedSize: ${item.selectedSize}`);
        
        // 문제 있는 아이템 감지
        if (!item.product) {
          console.log(`    ⚠️ WARNING: product가 null입니다! (삭제된 상품)`);
        }
        if (typeof item.priceAtAdd !== 'number') {
          console.log(`    ⚠️ WARNING: priceAtAdd가 숫자가 아닙니다!`);
        }
        if (typeof item.quantity !== 'number') {
          console.log(`    ⚠️ WARNING: quantity가 숫자가 아닙니다!`);
        }
      });
    });

    await mongoose.connection.close();
    console.log('\n\nMongoDB 연결 종료');
  } catch (error) {
    console.error('에러:', error);
    process.exit(1);
  }
}

debugCart();

