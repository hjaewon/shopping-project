import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './OrderSuccess.css'

// 체크마크 아이콘 컴포넌트
const CheckCircleIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#4CAF50" />
    <path 
      d="M7 12L10.5 15.5L17 9" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
)

function OrderSuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const order = location.state?.order

  useEffect(() => {
    // 주문 데이터가 없으면 홈으로 리다이렉트
    if (!order) {
      navigate('/')
      return
    }

    // 유저 정보 가져오기
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await fetch('/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            setUser(data.data)
          }
        } catch (error) {
          console.error('유저 정보 가져오기 실패:', error)
        }
      }
    }

    fetchUserInfo()
  }, [order, navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  if (!order) {
    return null
  }

  // 결제 수단 한글 변환
  const getPaymentMethodText = (method) => {
    const methods = {
      card: '신용카드',
      trans: '실시간 계좌이체',
      vbank: '가상계좌',
      phone: '휴대폰 결제'
    }
    return methods[method] || method
  }

  return (
    <div className="order-success-container">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="order-success-content">
        {/* 페이지 제목 */}
        <h1 className="page-title">주문완료</h1>

        {/* 성공 아이콘 및 메시지 */}
        <div className="success-icon">
          <CheckCircleIcon />
        </div>

        <h2 className="success-title">주문이 완료되었습니다</h2>
        <p className="success-message">
          감사합니다. 안내된 이메일로 주문 내역이 발송되었습니다.
        </p>
        <p className="order-number">주문번호: {order.orderNumber}</p>

        {/* 주문 상품 */}
        <div className="order-items-section">
          <h2 className="section-title">주문 상품</h2>
          <div className="order-items-list">
            {order.items.map((item) => (
              <div key={item._id} className="order-item">
                <div className="item-image">
                  <img 
                    src={item.product?.image} 
                    alt={item.product?.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80?text=No+Image'
                    }}
                  />
                </div>
                <div className="item-details">
                  <h3 className="item-name">{item.product?.name}</h3>
                  <p className="item-option">{item.selectedSize} / {item.quantity}개</p>
                </div>
                <div className="item-price">
                  ₩{(item.priceAtOrder * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          
          {/* 총 결제 금액 */}
          <div className="total-payment">
            <span className="total-label">총 결제 금액</span>
            <span className="total-amount">₩{order.pricing.finalTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* 주문 정보 */}
        <div className="order-info-section">
          <h2 className="section-title">주문 정보</h2>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">배송받는사람</span>
              <span className="info-value">{order.shippingInfo.recipientName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">휴대폰번호</span>
              <span className="info-value">{order.shippingInfo.recipientPhone}</span>
            </div>
          </div>
        </div>

        {/* 주문 목록 보기 버튼 */}
        <button className="view-orders-btn" onClick={() => navigate('/orders')}>
          주문 목록 보기
        </button>
      </div>
    </div>
  )
}

export default OrderSuccess

