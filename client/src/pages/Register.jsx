import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from '../api/axios'
import './Register.css'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    user_type: 'customer',
    address: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('/users/register', {
        email: formData.email,
        name: formData.name,
        password: formData.password,
        user_type: formData.user_type,
        address: formData.address || undefined
      })

      if (response.data.success) {
        alert('회원가입이 완료되었습니다!')
        localStorage.setItem('token', response.data.data.token)
        navigate('/')
      }
    } catch (err) {
      console.error('회원가입 에러:', err)
      setError(err.response?.data?.message || '회원가입에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="logo-section">
          <h1 className="logo">SHOPPING MALL</h1>
          <p className="tagline">세련된 패션 쇼핑</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label>이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="input-group">
            <label>이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="홍길동"
              required
            />
          </div>

          <div className="input-group">
            <label>비밀번호</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>비밀번호 확인</label>
            <div className="password-input">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>회원 유형</label>
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              required
            >
              <option value="customer">일반 회원</option>
              <option value="admin">관리자</option>
            </select>
          </div>

          <div className="input-group">
            <label>주소 (선택)</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="서울시 강남구"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '처리 중...' : '회원가입'}
          </button>

          <div className="footer-links">
            <Link to="/">메인으로</Link>
            <span className="separator">|</span>
            <Link to="/login">로그인</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
