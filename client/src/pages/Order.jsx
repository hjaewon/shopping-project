import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import Navbar from '../components/Navbar'
import './Order.css'

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

function Order() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // 배송 정보 상태
  const [shippingInfo, setShippingInfo] = useState({
    recipientName: '',
    recipientPhone: '',
    address: '',
    postalCode: '',
    deliveryRequest: ''
  })

  // 결제 수단 상태
  const [paymentMethod, setPaymentMethod] = useState('card')

  // 포트원 초기화
  useEffect(() => {
    const IMP = window.IMP
    if (IMP) {
      IMP.init('imp04688042') // 고객사 식별코드
      console.log('포트원 결제 모듈 초기화 완료')
    } else {
      console.error('포트원 스크립트가 로드되지 않았습니다.')
    }
  }, [])

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
          // 유저 정보로 초기값 설정
          setShippingInfo(prev => ({
            ...prev,
            recipientName: response.data.data.name || '',
            address: response.data.data.address || ''
          }))
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
          console.log('장바구니 데이터:', response.data.data)
          setCart(response.data.data)
          
          // 장바구니가 비어있으면 장바구니 페이지로 리다이렉트
          if (!response.data.data.items || response.data.data.items.length === 0) {
            alert('장바구니가 비어있습니다.')
            navigate('/cart')
          }
        }
      } catch (error) {
        console.error('장바구니 조회 실패:', error)
        alert('장바구니를 불러오는데 실패했습니다.')
        navigate('/cart')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchCart()
    }
  }, [user, navigate])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!shippingInfo.recipientName.trim()) {
      alert('받는 사람 이름을 입력해주세요.')
      return false
    }
    if (!shippingInfo.recipientPhone.trim()) {
      alert('휴대폰 번호를 입력해주세요.')
      return false
    }
    if (!shippingInfo.address.trim()) {
      alert('주소를 입력해주세요.')
      return false
    }
    if (!shippingInfo.postalCode.trim()) {
      alert('우편번호를 입력해주세요.')
      return false
    }
    return true
  }

  const handleSubmitOrder = async () => {
    if (!validateForm()) return

    const IMP = window.IMP
    if (!IMP) {
      alert('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    // 장바구니와 상품 데이터 확인
    if (!cart || !cart.items || cart.items.length === 0) {
      alert('장바구니가 비어있습니다.')
      navigate('/cart')
      return
    }

    try {
      setSubmitting(true)

      // 주문 아이템 준비
      const orderItems = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        selectedSize: item.selectedSize
      }))

      const totalAmount = cart.totalPrice || 0

      // 고유한 주문 번호 생성
      const merchantUid = `order_${new Date().getTime()}_${user._id.slice(-6)}`

      // 주문명 생성
      const firstProduct = cart.items[0]?.product
      const orderName = firstProduct 
        ? `${firstProduct.name}${cart.items.length > 1 ? ` 외 ${cart.items.length - 1}건` : ''}`
        : '상품 주문'

      // 포트원 결제 요청
      IMP.request_pay(
        {
          pg: 'html5_inicis', // PG사 (테스트: html5_inicis)
          pay_method: paymentMethod, // 결제수단
          merchant_uid: merchantUid, // 주문번호
          name: orderName, // 주문명
          amount: totalAmount, // 결제금액
          buyer_email: user.email,
          buyer_name: shippingInfo.recipientName,
          buyer_tel: shippingInfo.recipientPhone,
          buyer_addr: shippingInfo.address,
          buyer_postcode: shippingInfo.postalCode
        },
        async (response) => {
          // 결제 완료 후 콜백
          if (response.success) {
            // 결제 성공 시
            console.log('결제 성공:', response)

            try {
              // 서버에 주문 생성 요청
              const orderResponse = await axios.post('/orders', {
                items: orderItems,
                shippingInfo: shippingInfo,
                payment: {
                  method: paymentMethod,
                  transactionId: response.imp_uid // 포트원 거래 고유번호
                }
              })

              if (orderResponse.data.success) {
                // 주문 성공 페이지로 이동 (주문 데이터 전달)
                navigate('/order/success', { 
                  state: { 
                    order: orderResponse.data.data 
                  } 
                })
              }
            } catch (error) {
              console.error('주문 생성 실패:', error)
              alert(error.response?.data?.message || '주문 처리 중 오류가 발생했습니다.')
            }
          } else {
            // 결제 실패 시
            console.error('결제 실패:', response)
            alert(`결제에 실패했습니다.\n${response.error_msg || '다시 시도해주세요.'}`)
          }

          setSubmitting(false)
        }
      )
    } catch (error) {
      console.error('결제 요청 오류:', error)
      alert('결제 요청 중 오류가 발생했습니다.')
      setSubmitting(false)
    }
  }

  if (loading || !cart) {
    return (
      <div className="order-container">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="loading-container">로딩 중...</div>
      </div>
    )
  }

  // 안전하게 데이터 추출 - 유효한 아이템만 필터링
  const items = (cart?.items || []).filter(item => {
    const isValid = item && 
      item.product && 
      item.product._id && 
      typeof item.priceAtAdd === 'number' &&
      typeof item.quantity === 'number'
    
    if (!isValid) {
      console.warn('유효하지 않은 아이템 발견:', item)
    }
    
    return isValid
  })
  const totalPrice = cart?.totalPrice || 0
  
  console.log('필터링된 아이템:', items)
  console.log('총 가격:', totalPrice)

  // 장바구니가 비어있는 경우 처리
  if (items.length === 0) {
    return (
      <div className="order-container">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="order-content">
          <div className="empty-cart">
            <h2>장바구니가 비어있습니다.</h2>
            <button className="continue-shopping-btn" onClick={() => navigate('/cart')}>
              장바구니로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="order-container">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="order-content">
        <div className="order-header">
          <button className="back-button" onClick={() => navigate('/cart')}>
            &lt; 돌아가기
          </button>
          <span className="order-path">/order</span>
        </div>

        <h1 className="order-title">주문하기</h1>

        <div className="order-main">
          {/* 왼쪽: 주문 정보 입력 */}
          <div className="order-form-section">
            {/* 배송 정보 */}
            <div className="form-group">
              <h2 className="section-title">배송받을 주소</h2>
              
              <div className="input-group">
                <label>배송받는사람 *</label>
                <input
                  type="text"
                  name="recipientName"
                  placeholder="이름"
                  value={shippingInfo.recipientName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="input-group">
                <label>휴대폰번호 *</label>
                <input
                  type="tel"
                  name="recipientPhone"
                  placeholder="010-0000-0000"
                  value={shippingInfo.recipientPhone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="input-group">
                <label>주소 *</label>
                <input
                  type="text"
                  name="address"
                  placeholder="도로명 주소"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="input-group">
                <label>우편번호 *</label>
                <input
                  type="text"
                  name="postalCode"
                  placeholder="00000"
                  value={shippingInfo.postalCode}
                  onChange={handleInputChange}
                />
              </div>

              <div className="input-group">
                <label>상세주소</label>
                <input
                  type="text"
                  name="deliveryRequest"
                  placeholder="아파트, 호수 등"
                  value={shippingInfo.deliveryRequest}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* 결제 수단 선택 */}
            <div className="form-group">
              <h2 className="section-title">결제 수단</h2>
              <div className="payment-method-group">
                <label className="payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>신용카드</span>
                </label>
                <label className="payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="trans"
                    checked={paymentMethod === 'trans'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>실시간 계좌이체</span>
                </label>
                <label className="payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vbank"
                    checked={paymentMethod === 'vbank'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>가상계좌</span>
                </label>
                <label className="payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="phone"
                    checked={paymentMethod === 'phone'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>휴대폰 결제</span>
                </label>
              </div>
            </div>

            {/* 주문 상품 목록 */}
            <div className="order-items-section">
              <h2 className="section-title">주문상품 ({items.length}개)</h2>
              <div className="order-items-list">
                {items.map((item) => (
                  <div key={item._id} className="order-item">
                    <div className="order-item-image">
                      <img 
                        src={item.product?.image} 
                        alt={item.product?.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80?text=No+Image'
                        }}
                      />
                    </div>
                    <div className="order-item-info">
                      <h3 className="order-item-name">{item.product?.name}</h3>
                      <p className="order-item-option">
                        {item.selectedSize} / {item.quantity}개
                      </p>
                    </div>
                    <div className="order-item-price">
                      ₩{formatPrice((item.priceAtAdd || 0) * (item.quantity || 0))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 결제 정보 */}
          <div className="payment-section">
            <div className="payment-summary">
              <h2 className="payment-title">결제 정보</h2>

              {/* 상품 목록 */}
              <div className="payment-items">
                <h3 className="payment-items-title">상품 ({items.length}개)</h3>
                {items.map((item) => (
                  <div key={item._id} className="payment-item">
                    <span className="payment-item-name">{item.product?.name}</span>
                    <span className="payment-item-price">
                      ₩{formatPrice((item.priceAtAdd || 0) * (item.quantity || 0))}
                    </span>
                  </div>
                ))}
              </div>

              {/* 금액 정보 */}
              <div className="payment-details">
                <div className="payment-row">
                  <span className="payment-label">상품 금액</span>
                  <span className="payment-value">₩{formatPrice(totalPrice || 0)}</span>
                </div>
              </div>

              {/* 총 결제 금액 */}
              <div className="payment-total">
                <div className="total-amount">₩{formatPrice(totalPrice || 0)}</div>
                <div className="total-label">총 결제 금액</div>
              </div>

              {/* 결제하기 버튼 */}
              <button 
                className="submit-order-btn" 
                onClick={handleSubmitOrder}
                disabled={submitting}
              >
                {submitting ? '주문 처리 중...' : '결제하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Order

