const Product = require('../models/Product');

// 상품 등록
exports.createProduct = async (req, res) => {
  try {
    const { sku, name, price, category, image, description, stock } = req.body;

    // 필수 필드 검증
    if (!sku || !name || !price || !category || !image) {
      return res.status(400).json({
        success: false,
        message: '필수 필드를 모두 입력해주세요 (SKU, 상품명, 가격, 카테고리, 이미지)'
      });
    }

    // 가격 검증
    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: '가격은 0보다 커야 합니다'
      });
    }

    // 카테고리 검증
    const validCategories = ['상의', '하의', '악세사리'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `유효하지 않은 카테고리입니다. (${validCategories.join(', ')})`
      });
    }

    // SKU 중복 체크
    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 SKU입니다'
      });
    }

    // 이미지 URL 형식 간단 검증 (http/https로 시작하는지)
    if (!image.startsWith('http://') && !image.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        message: '유효한 이미지 URL을 입력해주세요'
      });
    }

    // 상품 생성
    const product = await Product.create({
      sku: sku.toUpperCase(), // SKU는 자동으로 대문자 변환
      name,
      price: Number(price),
      category,
      image,
      description: description || '',
      stock: stock !== undefined ? Number(stock) : 0
    });

    res.status(201).json({
      success: true,
      message: '상품이 성공적으로 등록되었습니다',
      data: product
    });
  } catch (error) {
    console.error('상품 등록 에러:', error);
    
    // Mongoose 유효성 검사 에러 처리
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || '상품 등록 중 오류가 발생했습니다'
    });
  }
};

// 전체 상품 조회
exports.getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit = 20, includeInactive } = req.query;

    // 필터 조건 생성
    const filter = {};
    
    // includeInactive가 'true'가 아니면 활성 상품만 조회 (기본값)
    if (includeInactive !== 'true') {
      filter.isActive = true;
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 페이지네이션
    const skip = (Number(page) - 1) * Number(limit);
    
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('상품 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '상품 조회 중 오류가 발생했습니다'
    });
  }
};

// 특정 상품 조회 (SKU 기준)
exports.getProductBySku = async (req, res) => {
  try {
    const { sku } = req.params;
    
    const product = await Product.findOne({ sku: sku.toUpperCase() });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('상품 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '상품 조회 중 오류가 발생했습니다'
    });
  }
};

// 특정 상품 조회 (ID 기준)
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('상품 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '상품 조회 중 오류가 발생했습니다'
    });
  }
};

// 상품 수정
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // SKU 변경 시 중복 체크
    if (updateData.sku) {
      const existingProduct = await Product.findOne({ 
        sku: updateData.sku.toUpperCase(),
        _id: { $ne: id }
      });
      
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: '이미 존재하는 SKU입니다'
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      message: '상품이 성공적으로 수정되었습니다',
      data: product
    });
  } catch (error) {
    console.error('상품 수정 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message || '상품 수정 중 오류가 발생했습니다'
    });
  }
};

// 상품 삭제 (소프트 삭제 - isActive를 false로 변경)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      message: '상품이 성공적으로 삭제되었습니다'
    });
  } catch (error) {
    console.error('상품 삭제 에러:', error);
    res.status(500).json({
      success: false,
      message: '상품 삭제 중 오류가 발생했습니다'
    });
  }
};

// 상품 영구 삭제 (관리자용)
exports.permanentDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      message: '상품이 영구적으로 삭제되었습니다'
    });
  } catch (error) {
    console.error('상품 영구 삭제 에러:', error);
    res.status(500).json({
      success: false,
      message: '상품 삭제 중 오류가 발생했습니다'
    });
  }
};

// 재고 수정
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: '유효한 재고 수량을 입력해주세요'
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { stock },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      message: '재고가 성공적으로 수정되었습니다',
      data: product
    });
  } catch (error) {
    console.error('재고 수정 에러:', error);
    res.status(500).json({
      success: false,
      message: '재고 수정 중 오류가 발생했습니다'
    });
  }
};

