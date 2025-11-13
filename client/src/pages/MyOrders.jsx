import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import Navbar from '../components/Navbar'
import './MyOrders.css'

// 검색 아이콘
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
)

// 펼치기 아이콘
const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
)

function MyOrders() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedOrders, setExpandedOrders] = useState({})

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
    // 주문 목록 가져오기
    const fetchOrders = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        setLoading(true)
        const response = await axios.get('/orders')
        if (response.data.success) {
          setOrders(response.data.data)
        }
      } catch (error) {
        console.error('주문 목록 조회 실패:', error)
        alert('주문 목록을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchOrders()
    }
  }, [user])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }, [navigate])

  // 주문 상태 한글 변환
  const getOrderStatusText = (status) => {
    const statuses = {
      confirmed: '주문 확정',
      preparing: '배송 준비',
      shipping: '배송 중',
      delivered: '배송 완료',
      cancelled: '취소'
    }
    return statuses[status] || status
  }

  // 주문 상태 색상
  const getOrderStatusColor = (status) => {
    const colors = {
      confirmed: '#2196F3',
      preparing: '#FF9800',
      shipping: '#FF9800',
      delivered: '#4CAF50',
      cancelled: '#F44336'
    }
    return colors[status] || '#999'
  }

  // 날짜 포맷
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').replace('.', '')
  }

  // 주문 펼치기/접기
  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }))
  }

  // 필터링된 주문 목록
  const filteredOrders = orders.filter(order => {
    // 상태 필터
    if (statusFilter !== 'all') {
      if (statusFilter !== order.orderStatus) return false
    }

    // 검색어 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const hasMatchingProduct = order.items.some(item => 
        item.product?.name?.toLowerCase().includes(query)
      )
      if (!hasMatchingProduct) return false
    }

    return true
  })

  if (loading) {
    return (
      <div className="my-orders-container">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="loading-container">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="my-orders-container">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="my-orders-content">
        <h1 className="orders-title">주문 내역</h1>

        {/* 검색 바 */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="상품명 / 브랜드명으로 검색하세요."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon />
        </div>

        {/* 상태 필터 */}
        <div className="status-filters">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            전체
          </button>
          <button
            className={`filter-btn ${statusFilter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('confirmed')}
          >
            주문 확정
          </button>
          <button
            className={`filter-btn ${statusFilter === 'preparing' ? 'active' : ''}`}
            onClick={() => setStatusFilter('preparing')}
          >
            배송 준비
          </button>
          <button
            className={`filter-btn ${statusFilter === 'shipping' ? 'active' : ''}`}
            onClick={() => setStatusFilter('shipping')}
          >
            배송 중
          </button>
          <button
            className={`filter-btn ${statusFilter === 'delivered' ? 'active' : ''}`}
            onClick={() => setStatusFilter('delivered')}
          >
            배송 완료
          </button>
          <button
            className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            취소
          </button>
        </div>

        {/* 주문 목록 */}
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="empty-orders">
              <p>주문 내역이 없습니다.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                  <span 
                    className="order-status" 
                    style={{ color: getOrderStatusColor(order.orderStatus) }}
                  >
                    {getOrderStatusText(order.orderStatus)}
                  </span>
                </div>

                {/* 첫 번째 상품만 표시 */}
                {order.items.length > 0 && (
                  <div className="order-main-item">
                    <div className="item-image">
                      <img
                        src={order.items[0].product?.image}
                        alt={order.items[0].product?.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100?text=No+Image'
                        }}
                      />
                    </div>
                    <div className="item-info">
                      <h3 className="item-name">{order.items[0].product?.name}</h3>
                      <p className="item-option">
                        {order.items[0].selectedSize} / {order.items[0].quantity}개
                      </p>
                      <p className="item-price">
                        ₩{(order.items[0].priceAtOrder * order.items[0].quantity).toLocaleString()}
                      </p>
                    </div>
                    <div className="item-actions">
                      <button className="action-btn">재구매</button>
                      {order.orderStatus === 'delivered' && (
                        <button className="action-btn secondary">반품 신청</button>
                      )}
                      <button className="action-btn secondary">배송 상세</button>
                    </div>
                    <button 
                      className="expand-btn"
                      onClick={() => toggleOrderExpand(order._id)}
                    >
                      주문 상세
                      <ChevronDownIcon />
                    </button>
                  </div>
                )}

                {/* 펼쳤을 때 나머지 상품 표시 */}
                {expandedOrders[order._id] && (
                  <div className="order-details">
                    <div className="details-divider"></div>
                    
                    {/* 나머지 상품들 */}
                    {order.items.slice(1).map((item) => (
                      <div key={item._id} className="detail-item">
                        <div className="item-image">
                          <img
                            src={item.product?.image}
                            alt={item.product?.name}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80?text=No+Image'
                            }}
                          />
                        </div>
                        <div className="item-info">
                          <h4 className="item-name">{item.product?.name}</h4>
                          <p className="item-option">
                            {item.selectedSize} / {item.quantity}개
                          </p>
                          <p className="item-price">
                            ₩{(item.priceAtOrder * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* 주문 정보 */}
                    <div className="order-info-detail">
                      <h4>주문 정보</h4>
                      <div className="info-row">
                        <span>주문번호</span>
                        <span>{order.orderNumber}</span>
                      </div>
                      <div className="info-row">
                        <span>배송받는사람</span>
                        <span>{order.shippingInfo.recipientName}</span>
                      </div>
                      <div className="info-row">
                        <span>연락처</span>
                        <span>{order.shippingInfo.recipientPhone}</span>
                      </div>
                      <div className="info-row">
                        <span>배송지</span>
                        <span>{order.shippingInfo.address}</span>
                      </div>
                      <div className="info-row total">
                        <span>총 결제 금액</span>
                        <span className="total-price">₩{order.pricing.finalTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default MyOrders

