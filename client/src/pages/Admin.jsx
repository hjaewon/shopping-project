import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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

  const handleLogout = () => {
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
            <h1>관리자 대시보드</h1>
            <p className="header-subtitle">총 판매 현황 및 통계</p>
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
      </main>
    </div>
  )
}

export default Admin

