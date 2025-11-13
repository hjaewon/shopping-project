const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    위시리스트 조회
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    let wishlist = await Wishlist.findOne({ user: userId })
      .populate('items.product');

    // 위시리스트가 없으면 빈 위시리스트 생성
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    // 삭제된 상품 필터링
    if (wishlist.items && wishlist.items.length > 0) {
      const validItems = wishlist.items.filter(item => item.product);
      
      if (validItems.length !== wishlist.items.length) {
        wishlist.items = validItems;
        await wishlist.save();
      }
    }

    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('위시리스트 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '위시리스트 조회 중 오류가 발생했습니다'
    });
  }
};

// @desc    위시리스트에 상품 추가
// @route   POST /api/wishlist/items
// @access  Private
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: '상품 ID가 필요합니다'
      });
    }

    // 상품 존재 확인
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다'
      });
    }

    // 위시리스트 찾기 또는 생성
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    // 이미 찜한 상품인지 확인
    if (wishlist.hasItem(productId)) {
      return res.status(400).json({
        success: false,
        message: '이미 찜한 상품입니다'
      });
    }

    // 찜하기 추가
    await wishlist.addItem(productId);

    // 업데이트된 위시리스트 조회
    wishlist = await Wishlist.findOne({ user: userId })
      .populate('items.product');

    res.status(200).json({
      success: true,
      message: '찜한 상품에 추가되었습니다',
      data: wishlist
    });

  } catch (error) {
    console.error('위시리스트 추가 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message || '위시리스트 추가 중 오류가 발생했습니다'
    });
  }
};

// @desc    위시리스트에서 상품 제거
// @route   DELETE /api/wishlist/items/:productId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: '위시리스트를 찾을 수 없습니다'
      });
    }

    // 찜하기 제거
    await wishlist.removeItem(productId);

    // 업데이트된 위시리스트 조회
    const updatedWishlist = await Wishlist.findOne({ user: userId })
      .populate('items.product');

    res.status(200).json({
      success: true,
      message: '찜한 상품에서 제거되었습니다',
      data: updatedWishlist
    });

  } catch (error) {
    console.error('위시리스트 제거 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message || '위시리스트 제거 중 오류가 발생했습니다'
    });
  }
};

// @desc    위시리스트 전체 삭제
// @route   DELETE /api/wishlist
// @access  Private
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: '위시리스트를 찾을 수 없습니다'
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: '위시리스트가 비워졌습니다',
      data: wishlist
    });

  } catch (error) {
    console.error('위시리스트 비우기 에러:', error);
    res.status(500).json({
      success: false,
      message: '위시리스트 비우기 중 오류가 발생했습니다'
    });
  }
};

// @desc    특정 상품의 찜하기 여부 확인
// @route   GET /api/wishlist/check/:productId
// @access  Private
exports.checkWishlistItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });

    const isWishlisted = wishlist ? wishlist.hasItem(productId) : false;

    res.status(200).json({
      success: true,
      data: {
        isWishlisted: isWishlisted
      }
    });

  } catch (error) {
    console.error('찜하기 확인 에러:', error);
    res.status(500).json({
      success: false,
      message: '찜하기 확인 중 오류가 발생했습니다'
    });
  }
};

