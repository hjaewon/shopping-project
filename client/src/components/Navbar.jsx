import { Link, useNavigate } from 'react-router-dom'
import { memo, useState, useEffect } from 'react'
import axios from '../api/axios'
import './Navbar.css'

// SVG 아이콘 컴포넌트
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

// 유저 메뉴 컴포넌트
const UserMenu = memo(({ user, onLogout, navigate }) => {
  return (
    <div className="user-menu">
      <span className="user-welcome">{user.name}님 환영합니다</span>
      
      {/* 마이 버튼 (모든 유저) */}
      <button 
        className="my-btn" 
        onClick={() => navigate('/orders')}
        title="마이페이지"
      >
        <UserIcon />
        <span>마이</span>
      </button>

      {/* 어드민 버튼 (관리자만) */}
      {user.user_type === 'admin' && (
        <button 
          className="admin-btn"
          onClick={() => navigate('/admin')}
          title="관리자 페이지"
        >
          어드민
        </button>
      )}

      <button onClick={onLogout} className="logout-btn-small">로그아웃</button>
    </div>
  )
})

UserMenu.displayName = 'UserMenu'

function Navbar({ user, onLogout }) {
  const navigate = useNavigate()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    // 장바구니 개수 가져오기
    const fetchCartCount = async () => {
      const token = localStorage.getItem('token')
      if (!token || !user) {
        setCartCount(0)
        return
      }

      try {
        const response = await axios.get('/cart/count')
        if (response.data.success) {
          setCartCount(response.data.data.count)
        }
      } catch (error) {
        console.error('장바구니 개수 조회 실패:', error)
      }
    }

    fetchCartCount()
    
    // 10초마다 장바구니 개수 업데이트
    const interval = setInterval(fetchCartCount, 10000)
    
    return () => clearInterval(interval)
  }, [user])

  const handleCartClick = () => {
    if (!user) {
      alert('로그인이 필요합니다.')
      navigate('/login')
      return
    }
    navigate('/cart')
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* 로고 섹션 */}
        <div className="navbar-left">
          <Link to="/" className="logo-link">
            <div className="logo-box">
              <span className="logo-text">MS</span>
            </div>
            <span className="brand-name">쇼핑몰</span>
          </Link>
        </div>

        {/* 메인 메뉴 */}
        <div className="navbar-center">
          <Link to="/products?category=new" className="nav-link">신상품</Link>
          <Link to="/products?category=men" className="nav-link">남성</Link>
          <Link to="/products?category=women" className="nav-link">여성</Link>
          <Link to="/products?category=accessories" className="nav-link">악세서리</Link>
          <Link to="/products?category=brands" className="nav-link">브랜드</Link>
        </div>

        {/* 우측 아이콘 및 유저 정보 */}
        <div className="navbar-right">
          <button className="icon-btn" title="검색" aria-label="검색">
            <SearchIcon />
          </button>
          <button 
            className="icon-btn cart-btn" 
            title="장바구니" 
            aria-label="장바구니"
            onClick={handleCartClick}
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
            )}
          </button>
          
          {/* 로그인 상태에 따른 조건부 렌더링 */}
          {!user ? (
            <Link to="/login" className="login-btn">로그인</Link>
          ) : (
            <UserMenu user={user} onLogout={onLogout} navigate={navigate} />
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar




