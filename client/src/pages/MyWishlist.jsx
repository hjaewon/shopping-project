import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import Navbar from '../components/Navbar'
import './MyWishlist.css'

// 하트 아이콘
const HeartIcon = ({ filled }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

// 장바구니 아이콘
const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

function MyWishlist() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [wishlist, setWishlist] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 유저 정보 가져오기
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('로그인이 필요합니다.')
        navigate('/login')
        return
      }

      try {
        const response = await axios.get('/users/me')
        if (response.data.success) {
          setUser(response.data.data)
        }
      } catch (error) {
        console.error('유저 정보 가져오기 실패:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }
    }

    fetchUserInfo()
  }, [navigate])

  useEffect(() => {
    // 위시리스트 가져오기
    const fetchWishlist = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await axios.get('/wishlist')
        if (response.data.success) {
          setWishlist(response.data.data)
        }
      } catch (error) {
        console.error('위시리스트 조회 실패:', error)
        alert('찜한 상품을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [user])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }, [navigate])

  const handleRemoveItem = async (productId) => {
    if (!window.confirm('찜한 상품에서 제거하시겠습니까?')) return

    try {
      const response = await axios.delete(`/wishlist/items/${productId}`)
      if (response.data.success) {
        setWishlist(response.data.data)
      }
    } catch (error) {
      console.error('상품 제거 실패:', error)
      alert('상품 제거에 실패했습니다.')
    }
  }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`)
  }

  const handleAddToCart = async (item) => {
    if (!item.product) return

    try {
      const response = await axios.post('/cart/items', {
        productId: item.product._id,
        quantity: 1,
        selectedColor: '기본',
        selectedSize: 'M'
      })

      if (response.data.success) {
        alert('장바구니에 추가되었습니다!')
      }
    } catch (error) {
      console.error('장바구니 추가 실패:', error)
      alert(error.response?.data?.message || '장바구니 추가에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="wishlist-container">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="loading-container">로딩 중...</div>
      </div>
    )
  }

  const items = wishlist?.items || []

  return (
    <div className="wishlist-container">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="wishlist-content">
        <div className="wishlist-header">
          <h1 className="wishlist-title">찜한 상품</h1>
          <p className="wishlist-count">{items.length}개의 상품</p>
        </div>

        {items.length === 0 ? (
          <div className="empty-wishlist">
            <HeartIcon filled={false} />
            <p>찜한 상품이 없습니다.</p>
            <button className="continue-shopping-btn" onClick={() => navigate('/')}>
              쇼핑 계속하기
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((item) => (
              item.product && (
                <div key={item._id} className="wishlist-card">
                  <div className="wishlist-image" onClick={() => handleProductClick(item.product._id)}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x400?text=No+Image'
                      }}
                    />
                    <button
                      className="remove-wishlist-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveItem(item.product._id)
                      }}
                      title="찜 해제"
                    >
                      <HeartIcon filled={true} />
                    </button>
                  </div>
                  <div className="wishlist-info">
                    <h3 className="wishlist-product-name">{item.product.name}</h3>
                    <p className="wishlist-product-price">₩{item.product.price.toLocaleString()}</p>
                    {item.product.stock === 0 ? (
                      <span className="sold-out-badge">품절</span>
                    ) : (
                      <button 
                        className="add-to-cart-btn-small"
                        onClick={() => handleAddToCart(item)}
                      >
                        <CartIcon />
                        <span>장바구니</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyWishlist

