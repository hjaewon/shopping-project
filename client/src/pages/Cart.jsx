import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import Navbar from '../components/Navbar'
import './Cart.css'

// 안전한 가격 포맷 헬퍼 함수
const formatPrice = (value) => {
  try {
    const num = Number(value)
    if (isNaN(num) || !isFinite(num)) {
      return '0'
    }
    return num.toLocaleString()
  } catch (error) {
    console.error('가격 포맷 에러:', error, value)
    return '0'
  }
}

// 아이콘 컴포넌트
const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
)

function Cart() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState(null)
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
    // 장바구니 가져오기
    const fetchCart = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        setLoading(true)
        const response = await axios.get('/cart')
        if (response.data.success) {
          setCart(response.data.data)
        }
      } catch (error) {
        console.error('장바구니 조회 실패:', error)
        alert('장바구니를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchCart()
    }
  }, [user])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }, [navigate])

  const handleQuantityChange = async (itemId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta
    if (newQuantity < 1 || newQuantity > 99) return

    try {
      const response = await axios.patch(`/cart/items/${itemId}`, {
        quantity: newQuantity
      })
      if (response.data.success) {
        setCart(response.data.data)
      }
    } catch (error) {
      console.error('수량 변경 실패:', error)
      alert('수량 변경에 실패했습니다.')
    }
  }

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('이 상품을 장바구니에서 제거하시겠습니까?')) return

    try {
      const response = await axios.delete(`/cart/items/${itemId}`)
      if (response.data.success) {
        setCart(response.data.data)
      }
    } catch (error) {
      console.error('상품 제거 실패:', error)
      alert('상품 제거에 실패했습니다.')
    }
  }

  const handleContinueShopping = () => {
    navigate('/')
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('장바구니에 상품이 없습니다.')
      return
    }
    navigate('/order')
  }

  if (loading) {
    return (
      <div className="cart-container">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="loading-container">로딩 중...</div>
      </div>
    )
  }

  const items = cart?.items || []
  const totalPrice = cart?.totalPrice || 0

  return (
    <div className="cart-container">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="cart-content">
        <div className="cart-main">
          {/* 장바구니 아이템 목록 */}
          <div className="cart-items-section">
            <h1 className="cart-title">장바구니</h1>

            {items.length === 0 ? (
              <div className="empty-cart">
                <p>장바구니가 비어있습니다.</p>
                <button className="continue-shopping-btn" onClick={handleContinueShopping}>
                  쇼핑 계속하기
                </button>
              </div>
            ) : (
              <div className="cart-items-list">
                {items.map((item) => (
                  <div key={item._id} className="cart-item">
                    <div className="item-image">
                      <img 
                        src={item.product?.image} 
                        alt={item.product?.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/120x160?text=No+Image'
                        }}
                      />
                    </div>

                    <div className="item-details">
                      <h3 className="item-name">{item.product?.name}</h3>
                      <div className="item-options">
                        <span className="item-option">사이즈: {item.selectedSize}</span>
                      </div>
                      <div className="item-price">
                        ₩{formatPrice(item.priceAtAdd || 0)}
                      </div>

                      <div className="item-actions">
                        <div className="quantity-control">
                          <button 
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button 
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                            disabled={item.quantity >= 99}
                          >
                            +
                          </button>
                        </div>

                        <button 
                          className="remove-btn"
                          onClick={() => handleRemoveItem(item._id)}
                          title="삭제"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>

                    <div className="item-total">
                      ₩{formatPrice((item.priceAtAdd || 0) * (item.quantity || 0))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 주문 요약 */}
          {items.length > 0 && (
            <div className="order-summary-section">
              <div className="order-summary">
                <h2 className="summary-title">주문 요약</h2>

                <div className="summary-row">
                  <span className="summary-label">상품금액</span>
                  <span className="summary-value">₩{formatPrice(totalPrice || 0)}</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-total">
                  <span className="total-label">총 결제금액</span>
                  <span className="total-value">₩{formatPrice(totalPrice || 0)}</span>
                </div>

                <div className="summary-actions">
                  <button className="checkout-btn" onClick={handleCheckout}>
                    결제하기
                  </button>
                  <button className="continue-btn" onClick={handleContinueShopping}>
                    쇼핑 계속하기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Cart

