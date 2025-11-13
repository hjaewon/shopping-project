import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from '../api/axios'
import './Admin.css'

// 차트 데이터
const salesTrendData = [
  { month: '1월', sales: 3800 },
  { month: '2월', sales: 3000 },
  { month: '3월', sales: 2500 },
  { month: '4월', sales: 3000 },
  { month: '5월', sales: 2500 },
  { month: '6월', sales: 2800 },
]

const categoryData = [
  { name: '의류', value: 45, color: '#E8DAEF' },
  { name: '신발', value: 25, color: '#D7BDE2' },
  { name: '악세서리', value: 20, color: '#C39BD3' },
  { name: '기타', value: 10, color: '#A569BD' },
]

const orderCountData = [
  { month: '1월', count: 230 },
  { month: '2월', count: 210 },
  { month: '3월', count: 190 },
  { month: '4월', count: 220 },
  { month: '5월', count: 230 },
  { month: '6월', count: 190 },
]

const recentOrders = [
  { id: '#001', customer: '김철수', amount: 89000, status: '준비중', date: '2025-01-08', statusColor: 'preparing' },
  { id: '#002', customer: '이영희', amount: 145000, status: '배송중', date: '2025-01-07', statusColor: 'shipping' },
  { id: '#003', customer: '박민준', amount: 56000, status: '완료', date: '2025-01-06', statusColor: 'completed' },
  { id: '#004', customer: '최수진', amount: 234000, status: '준비중', date: '2025-01-08', statusColor: 'preparing' },
  { id: '#005', customer: '정재훈', amount: 78000, status: '배송중', date: '2025-01-07', statusColor: 'shipping' },
]

// 아이콘 컴포넌트들
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
)

const ProductIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
  </svg>
)

const OrderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
)

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
)

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
)

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 1v6m0 6v6"></path>
    <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"></path>
    <path d="M1 12h6m6 0h6"></path>
    <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24"></path>
  </svg>
)

const MaximizeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
  </svg>
)

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
)

function Admin() {
  const navigate = useNavigate()
  const [selectedMenu, setSelectedMenu] = useState('대시보드')
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // 주문 목록 가져오기
  useEffect(() => {
    if (selectedMenu === '주문 관리') {
      fetchOrders()
    } else if (selectedMenu === '사용자 관리') {
      fetchUsers()
    }
  }, [selectedMenu])

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true)
      const response = await axios.get('/orders/admin/all')
      if (response.data.success) {
        setOrders(response.data.data)
      }
    } catch (error) {
      console.error('주문 목록 조회 실패:', error)
      alert('주문 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoadingOrders(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await axios.get('/users')
      if (response.data.success) {
        setUsers(response.data.data)
      }
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error)
      alert('사용자 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoadingUsers(false)
    }
  }

  // 주문 상태 변경
  const handleChangeOrderStatus = async (orderId, newStatus) => {
    if (!window.confirm(`주문 상태를 "${getOrderStatusText(newStatus)}"(으)로 변경하시겠습니까?`)) {
      return
    }

    try {
      const response = await axios.patch(`/orders/${orderId}/status`, {
        status: newStatus
      })
      if (response.data.success) {
        alert('주문 상태가 변경되었습니다.')
        fetchOrders()  // 목록 새로고침
      }
    } catch (error) {
      console.error('주문 상태 변경 실패:', error)
      alert(error.response?.data?.message || '주문 상태 변경에 실패했습니다.')
    }
  }

  // 주문 상세 보기
  const handleViewOrderDetail = (order) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
  }

  // 모달 닫기
  const handleCloseModal = () => {
    setShowOrderDetail(false)
    setSelectedOrder(null)
  }

  // 유저 타입 변경
  const handleChangeUserType = async (userId, newType) => {
    if (!window.confirm(`사용자 타입을 "${newType === 'admin' ? '관리자' : '일반 회원'}"(으)로 변경하시겠습니까?`)) {
      return
    }

    try {
      const response = await axios.patch(`/users/${userId}`, {
        user_type: newType
      })
      if (response.data.success) {
        alert('사용자 타입이 변경되었습니다.')
        fetchUsers()  // 목록 새로고침
      }
    } catch (error) {
      console.error('사용자 타입 변경 실패:', error)
      alert(error.response?.data?.message || '사용자 타입 변경에 실패했습니다.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const handleGoHome = () => {
    navigate('/')
  }

  const handleMenuClick = (menuName) => {
    setSelectedMenu(menuName)
    if (menuName === '상품 관리') {
      navigate('/admin/products')
    }
  }

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

  // 날짜 포맷
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR')
  }

  const menuItems = [
    { id: 'dashboard', name: '대시보드', icon: <DashboardIcon /> },
    { id: 'products', name: '상품 관리', icon: <ProductIcon /> },
    { id: 'orders', name: '주문 관리', icon: <OrderIcon /> },
    { id: 'users', name: '사용자 관리', icon: <UserIcon /> },
  ]

  return (
    <div className="admin-container">
      {/* 왼쪽 사이드바 */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>관리자</h2>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${selectedMenu === item.name ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.name)}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="home-btn" onClick={handleGoHome}>
            <HomeIcon />
            <span>홈페이지</span>
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <LogoutIcon />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="admin-main">
        {/* 헤더 */}
        <header className="admin-header">
          <div className="header-left">
            <h1>{selectedMenu}</h1>
            <p className="header-subtitle">
              {selectedMenu === '대시보드' && '총 판매 현황 및 통계'}
              {selectedMenu === '주문 관리' && `전체 ${orders.length}개 주문`}
              {selectedMenu === '사용자 관리' && `전체 ${users.length}명`}
            </p>
          </div>
          <div className="header-right">
            <button className="icon-btn" aria-label="검색">
              <SearchIcon />
            </button>
            <button className="icon-btn" aria-label="설정">
              <SettingsIcon />
            </button>
            <button className="icon-btn" aria-label="전체화면">
              <MaximizeIcon />
            </button>
            <span className="breadcrumb">/admin</span>
          </div>
        </header>

        {/* 대시보드 콘텐츠 */}
        {selectedMenu === '대시보드' && (
          <>
            {/* 통계 카드 */}
            <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-title">총 매출</h3>
            <p className="stat-value">₩15,890,000</p>
            <p className="stat-trend positive">전월 대비 12% 증가</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-title">총 주문</h3>
            <p className="stat-value">1,234</p>
            <p className="stat-trend positive">전월 대비 8% 증가</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-title">등록 사용자</h3>
            <p className="stat-value">5,678</p>
            <p className="stat-trend positive">전월 대비 15% 증가</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-title">상품 수</h3>
            <p className="stat-value">342</p>
            <p className="stat-trend neutral">재고 충분</p>
          </div>
        </div>

        {/* 차트 그리드 */}
        <div className="charts-row">
          <div className="chart-card">
            <h3 className="chart-title">월별 판매 추세</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 4000]} ticks={[0, 1000, 2000, 3000, 4000]} />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#000" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">카테고리별 분포</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 하단 차트 및 테이블 */}
        <div className="bottom-section">
          <div className="chart-card">
            <h3 className="chart-title">월별 주문 수</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderCountData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 240]} ticks={[0, 60, 120, 180, 240]} />
                <Tooltip />
                <Bar dataKey="count" fill="#000" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="orders-card">
            <h3 className="chart-title">최근 주문</h3>
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>주문번호</th>
                    <th>고객명</th>
                    <th>금액</th>
                    <th>상태</th>
                    <th>날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>₩{order.amount.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
          </>
        )}

        {/* 주문 관리 콘텐츠 */}
        {selectedMenu === '주문 관리' && (
          <div className="orders-management">
            {loadingOrders ? (
              <div className="loading-container">주문 목록 로딩 중...</div>
            ) : (
              <div className="orders-table-wrapper">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>주문번호</th>
                      <th>고객명</th>
                      <th>상품</th>
                      <th>이미지</th>
                      <th>상품 수</th>
                      <th>금액</th>
                      <th>주문 상태</th>
                      <th>결제 상태</th>
                      <th>주문 일시</th>
                      <th>액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td className="order-number">{order.orderNumber}</td>
                        <td>{order.user?.name || '-'}</td>
                        <td className="product-info">
                          {order.items.length > 0 ? (
                            <>
                              {order.items[0].product?.name || '-'}
                              {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                            </>
                          ) : '-'}
                        </td>
                        <td className="product-image-cell">
                          {order.items.length > 0 && order.items[0].product?.image && (
                            <img 
                              src={order.items[0].product.image} 
                              alt={order.items[0].product?.name}
                              className="product-thumbnail"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/50?text=No+Image'
                              }}
                            />
                          )}
                        </td>
                        <td>{order.items.length}개</td>
                        <td className="amount">₩{order.pricing.finalTotal.toLocaleString()}</td>
                        <td>
                          <select 
                            className="status-select"
                            value={order.orderStatus}
                            onChange={(e) => handleChangeOrderStatus(order._id, e.target.value)}
                          >
                            <option value="confirmed">주문 확정</option>
                            <option value="preparing">배송 준비</option>
                            <option value="shipping">배송 중</option>
                            <option value="delivered">배송 완료</option>
                            <option value="cancelled">취소</option>
                          </select>
                        </td>
                        <td>
                          <span className={`payment-badge ${order.payment.status}`}>
                            {order.payment.status === 'completed' ? '결제 완료' : '대기'}
                          </span>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <button 
                            className="action-link"
                            onClick={() => handleViewOrderDetail(order)}
                          >
                            상세
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {orders.length === 0 && (
                  <div className="empty-state">주문 내역이 없습니다.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 사용자 관리 콘텐츠 */}
        {selectedMenu === '사용자 관리' && (
          <div className="users-management">
            {loadingUsers ? (
              <div className="loading-container">사용자 목록 로딩 중...</div>
            ) : (
              <div className="users-table-wrapper">
                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>이메일</th>
                      <th>이름</th>
                      <th>회원 유형</th>
                      <th>주소</th>
                      <th>가입일</th>
                      <th>액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.email}</td>
                        <td>{user.name}</td>
                        <td>
                          <select 
                            className="user-type-select"
                            value={user.user_type}
                            onChange={(e) => handleChangeUserType(user._id, e.target.value)}
                          >
                            <option value="customer">일반 회원</option>
                            <option value="admin">관리자</option>
                          </select>
                        </td>
                        <td>{user.address || '-'}</td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <span className={`user-type-badge ${user.user_type}`}>
                            {user.user_type === 'admin' ? '관리자' : '일반'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {users.length === 0 && (
                  <div className="empty-state">사용자가 없습니다.</div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 주문 상세 모달 */}
      {showOrderDetail && selectedOrder && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>주문 상세</h2>
              <button className="close-btn" onClick={handleCloseModal}>✕</button>
            </div>
            
            <div className="modal-body">
              {/* 주문 기본 정보 */}
              <div className="detail-section">
                <h3>주문 정보</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">주문번호</span>
                    <span className="detail-value">{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">주문 일시</span>
                    <span className="detail-value">{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">주문 상태</span>
                    <span className={`status-badge-admin ${selectedOrder.orderStatus}`}>
                      {getOrderStatusText(selectedOrder.orderStatus)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">결제 상태</span>
                    <span className={`payment-badge ${selectedOrder.payment.status}`}>
                      {selectedOrder.payment.status === 'completed' ? '결제 완료' : '대기'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 고객 정보 */}
              <div className="detail-section">
                <h3>고객 정보</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">고객명</span>
                    <span className="detail-value">{selectedOrder.user?.name || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">이메일</span>
                    <span className="detail-value">{selectedOrder.user?.email || '-'}</span>
                  </div>
                </div>
              </div>

              {/* 배송 정보 */}
              <div className="detail-section">
                <h3>배송 정보</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">수령인</span>
                    <span className="detail-value">{selectedOrder.shippingInfo.recipientName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">연락처</span>
                    <span className="detail-value">{selectedOrder.shippingInfo.recipientPhone}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">배송지</span>
                    <span className="detail-value">
                      {selectedOrder.shippingInfo.address}
                      {selectedOrder.shippingInfo.postalCode && ` (${selectedOrder.shippingInfo.postalCode})`}
                    </span>
                  </div>
                  {selectedOrder.shippingInfo.deliveryRequest && (
                    <div className="detail-item full-width">
                      <span className="detail-label">배송 요청사항</span>
                      <span className="detail-value">{selectedOrder.shippingInfo.deliveryRequest}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 주문 상품 */}
              <div className="detail-section">
                <h3>주문 상품</h3>
                <div className="order-items-detail">
                  {selectedOrder.items.map((item) => (
                    <div key={item._id} className="order-item-detail">
                      <img 
                        src={item.product?.image} 
                        alt={item.product?.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80?text=No+Image'
                        }}
                      />
                      <div className="item-detail-info">
                        <h4>{item.product?.name || '-'}</h4>
                        <p>사이즈: {item.selectedSize} / 수량: {item.quantity}개</p>
                        <p className="item-price">₩{(item.priceAtOrder * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 결제 정보 */}
              <div className="detail-section">
                <h3>결제 정보</h3>
                <div className="payment-summary">
                  <div className="payment-row">
                    <span>상품 금액</span>
                    <span>₩{selectedOrder.pricing.itemsTotal.toLocaleString()}</span>
                  </div>
                  <div className="payment-row total">
                    <span>총 결제 금액</span>
                    <span>₩{selectedOrder.pricing.finalTotal.toLocaleString()}</span>
                  </div>
                  {selectedOrder.payment.transactionId && (
                    <div className="payment-row">
                      <span>거래 ID</span>
                      <span className="transaction-id">{selectedOrder.payment.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin

