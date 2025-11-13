import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback, memo } from 'react'
import axios from '../api/axios'
import Navbar from '../components/Navbar'
import './Home.css'

// 상수 데이터를 컴포넌트 외부로 이동
const CATEGORIES = ['전체', '상의', '하의', '악세사리']

const SORT_OPTIONS = [
  { value: 'recommended', label: '추천순' },
  { value: 'newest', label: '최신순' },
  { value: 'price-low', label: '낮은 가격순' },
  { value: 'price-high', label: '높은 가격순' },
]

// SVG 아이콘 컴포넌트
const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

// 제품 카드 컴포넌트 분리 및 메모이제이션
const ProductCard = memo(({ product, onClick, isWishlisted, onToggleWishlist, user }) => (
  <div className="product-card" onClick={() => onClick(product._id)}>
    <div className="product-image">
      <button 
        className={`favorite-btn ${isWishlisted ? 'active' : ''}`}
        aria-label="찜하기"
        onClick={(e) => {
          e.stopPropagation()
          onToggleWishlist(product._id)
        }}
      >
        <HeartIcon />
      </button>
      <img 
        src={product.image} 
        alt={product.name}
        onError={(e) => {
          e.target.onerror = null
          e.target.src = 'https://via.placeholder.com/300x400?text=No+Image'
        }}
      />
    </div>
    <div className="product-info">
      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">{product.price.toLocaleString()}원</p>
      {product.stock !== undefined && product.stock === 0 && (
        <span className="sold-out-badge">품절</span>
      )}
    </div>
  </div>
))

ProductCard.displayName = 'ProductCard'

// 카테고리 버튼 컴포넌트
const CategoryButton = memo(({ category, isActive, onClick }) => (
  <button
    className={`category-item ${isActive ? 'active' : ''}`}
    onClick={() => onClick(category)}
  >
    {category}
  </button>
))

CategoryButton.displayName = 'CategoryButton'

function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [priceRange, setPriceRange] = useState([0, 200000])
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [wishlist, setWishlist] = useState([])
  const [wishlistLoading, setWishlistLoading] = useState(false)

  useEffect(() => {
    // 토큰 확인 및 유저 정보 가져오기
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
          // 토큰이 유효하지 않으면 제거
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }

    fetchUserInfo()
  }, [])

  // 상품 데이터 가져오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true)
        const response = await axios.get('/products')
        if (response.data.success) {
          setProducts(response.data.data)
        }
      } catch (error) {
        console.error('상품 목록 조회 실패:', error)
      } finally {
        setProductsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // 위시리스트 가져오기
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlist([])
        return
      }

      try {
        setWishlistLoading(true)
        const response = await axios.get('/wishlist')
        if (response.data.success) {
          const wishlistItems = response.data.data.items || []
          const productIds = wishlistItems.map(item => item.product?._id || item.product).filter(Boolean)
          setWishlist(productIds)
        }
      } catch (error) {
        console.error('위시리스트 조회 실패:', error)
      } finally {
        setWishlistLoading(false)
      }
    }

    fetchWishlist()
  }, [user])

  // useCallback으로 함수 메모이제이션
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }, [navigate])

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category)
  }, [])

  const handlePriceChange = useCallback((e) => {
    setPriceRange([0, parseInt(e.target.value)])
  }, [])

  const handleProductClick = useCallback((productId) => {
    navigate(`/product/${productId}`)
  }, [navigate])

  // 찜하기 토글
  const handleToggleWishlist = async (productId) => {
    if (!user) {
      alert('로그인이 필요합니다.')
      navigate('/login')
      return
    }

    try {
      const isCurrentlyWishlisted = wishlist.includes(productId)

      if (isCurrentlyWishlisted) {
        // 찜하기 제거
        const response = await axios.delete(`/wishlist/items/${productId}`)
        if (response.data.success) {
          setWishlist(prev => prev.filter(id => id !== productId))
        }
      } else {
        // 찜하기 추가
        const response = await axios.post('/wishlist/items', { productId })
        if (response.data.success) {
          setWishlist(prev => [...prev, productId])
        }
      }
    } catch (error) {
      console.error('찜하기 처리 실패:', error)
      alert(error.response?.data?.message || '찜하기 처리에 실패했습니다.')
    }
  }

  // 필터링된 상품 목록
  const filteredProducts = products.filter(product => {
    // 카테고리 필터
    const categoryMatch = selectedCategory === '전체' || product.category === selectedCategory
    
    // 가격 필터
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1]
    
    return categoryMatch && priceMatch
  })

  if (loading) {
    return <div className="loading-container">로딩 중...</div>
  }

  return (
    <div className="home-container">
      {/* 네비게이션 바 */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* 배너 */}
      <div className="banner-section">
        <h1 className="banner-title">NEW SEASON</h1>
        <p className="banner-subtitle">최신 컬렉션을 지금 만나보세요</p>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="main-content">
        {/* 왼쪽 사이드바 - 필터 */}
        <aside className="sidebar">
          <div className="filter-section">
            <h3 className="filter-title">카테고리</h3>
            <div className="category-list">
              {CATEGORIES.map((category) => (
                <CategoryButton
                  key={category}
                  category={category}
                  isActive={selectedCategory === category}
                  onClick={handleCategorySelect}
                />
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">가격대</h3>
            <div className="price-range">
              <input
                type="range"
                min="0"
                max="200000"
                value={priceRange[1]}
                onChange={handlePriceChange}
                className="price-slider"
                aria-label="가격 범위 선택"
              />
              <div className="price-labels">
                <span>{priceRange[0].toLocaleString()}원</span>
                <span>{priceRange[1].toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </aside>

        {/* 제품 영역 */}
        <main className="products-section">
          <div className="products-header">
            <h2 className="products-title">
              상품 {filteredProducts.length > 0 && `(${filteredProducts.length})`}
            </h2>
            <select className="sort-select" aria-label="정렬 방식 선택">
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {productsLoading ? (
            <div className="products-loading">
              <p>상품을 불러오는 중...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="products-empty">
              <p>상품이 없습니다.</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product}
                  onClick={handleProductClick}
                  isWishlisted={wishlist.includes(product._id)}
                  onToggleWishlist={handleToggleWishlist}
                  user={user}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Home
