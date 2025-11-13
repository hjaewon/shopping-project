import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import Navbar from '../components/Navbar'
import './ProductDetail.css'

// 아이콘 컴포넌트
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const StarIcon = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  
  // 사이즈 옵션
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  useEffect(() => {
    // 유저 정보 가져오기
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await axios.get('/users/me')
          if (response.data.success) {
            setUser(response.data.data)
          }
        } catch (error) {
          console.error('유저 정보 가져오기 실패:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
    }

    fetchUserInfo()
  }, [])

  useEffect(() => {
    // 상품 정보 가져오기
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/products/${id}`)
        if (response.data.success) {
          setProduct(response.data.data)
        }
      } catch (error) {
        console.error('상품 조회 실패:', error)
        alert('상품을 불러오는데 실패했습니다.')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, navigate])

  // 찜하기 여부 확인
  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !id) return

      try {
        const response = await axios.get(`/wishlist/check/${id}`)
        if (response.data.success) {
          setIsWishlisted(response.data.data.isWishlisted)
        }
      } catch (error) {
        console.error('찜하기 확인 실패:', error)
      }
    }

    checkWishlist()
  }, [user, id])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }, [navigate])

  const handleBack = () => {
    navigate('/')
  }

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity)
    }
  }

  const handleToggleWishlist = async () => {
    if (!user) {
      alert('로그인이 필요합니다.')
      navigate('/login')
      return
    }

    try {
      setWishlistLoading(true)
      
      if (isWishlisted) {
        // 찜하기 제거
        const response = await axios.delete(`/wishlist/items/${id}`)
        if (response.data.success) {
          setIsWishlisted(false)
          alert('찜한 상품에서 제거되었습니다.')
        }
      } else {
        // 찜하기 추가
        const response = await axios.post('/wishlist/items', { productId: id })
        if (response.data.success) {
          setIsWishlisted(true)
          alert('찜한 상품에 추가되었습니다.')
        }
      }
    } catch (error) {
      console.error('찜하기 처리 실패:', error)
      alert(error.response?.data?.message || '찜하기 처리에 실패했습니다.')
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('로그인이 필요합니다.')
      navigate('/login')
      return
    }

    try {
      const response = await axios.post('/cart/items', {
        productId: product._id,
        quantity: quantity,
        selectedColor: '기본',
        selectedSize: selectedSize
      })

      if (response.data.success) {
        const goToCart = window.confirm(`장바구니에 추가되었습니다!\n\n상품: ${product.name}\n사이즈: ${selectedSize}\n수량: ${quantity}\n\n장바구니로 이동하시겠습니까?`)
        if (goToCart) {
          navigate('/cart')
        }
      }
    } catch (error) {
      console.error('장바구니 추가 실패:', error)
      const errorMessage = error.response?.data?.message || '장바구니에 추가하는데 실패했습니다.'
      alert(errorMessage)
    }
  }

  const handleWishlist = () => {
    handleToggleWishlist()
  }

  if (loading) {
    return <div className="loading-container">로딩 중...</div>
  }

  if (!product) {
    return <div className="loading-container">상품을 찾을 수 없습니다.</div>
  }

  // 썸네일 이미지들 (현재는 같은 이미지 반복, 나중에 여러 이미지 지원 가능)
  const thumbnails = [product.image, product.image, product.image]

  return (
    <div className="product-detail-container">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="product-detail-content">
        {/* 왼쪽: 이미지 섹션 */}
        <div className="product-images-section">
          <button className="back-button" onClick={handleBack}>
            <ArrowLeftIcon />
            <span>뒤로가기</span>
          </button>

          <div className="main-image">
            <img 
              src={thumbnails[selectedImage]} 
              alt={product.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x800?text=No+Image'
              }}
            />
          </div>

          <div className="thumbnail-images">
            {thumbnails.map((img, index) => (
              <div 
                key={index}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img 
                  src={img} 
                  alt={`${product.name} ${index + 1}`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100x130?text=No+Image'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 상품 정보 섹션 */}
        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>

          <div className="product-rating">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} filled={star <= 4} />
              ))}
            </div>
            <span className="rating-text">4.8 (245개 리뷰)</span>
          </div>

          <div className="product-price">
            {product.price.toLocaleString()}원
          </div>

          <p className="product-description">
            {product.description || '편안한 착용감의 오버사이즈 핏 코튼 티셔츠. 고급 면 소재로 제작되어 흡수성과 통기성이 우수합니다.'}
          </p>

          {/* 사이즈 선택 */}
          <div className="option-group">
            <label className="option-label">사이즈</label>
            <div className="option-buttons">
              {sizes.map((size) => (
                <button
                  key={size}
                  className={`option-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* 수량 선택 */}
          <div className="option-group">
            <label className="option-label">수량</label>
            <div className="quantity-selector">
              <button 
                className="quantity-btn"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="quantity-value">{quantity}</span>
              <button 
                className="quantity-btn"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 99}
              >
                +
              </button>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="action-buttons">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              장바구니 추가
            </button>
            <button 
              className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={handleWishlist}
              disabled={wishlistLoading}
            >
              <HeartIcon />
              <span>{isWishlisted ? '찜 완료' : '찜하기'}</span>
            </button>
          </div>

          {/* 재고 정보 */}
          {product.stock !== undefined && (
            <div className="stock-info">
              {product.stock === 0 ? (
                <span className="out-of-stock">품절</span>
              ) : product.stock < 10 ? (
                <span className="low-stock">재고 {product.stock}개 남음</span>
              ) : (
                <span className="in-stock">재고 있음</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

