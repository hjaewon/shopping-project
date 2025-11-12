import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from '../api/axios'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // 에러 메시지는 입력 중에 유지 (다음 로그인 시도 시에만 초기화)
  }

  const handleSubmit = async (e) => {
    console.log('로그인 시도:', formData.email)
    setError('')

    // 유효성 검사
    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 입력해주세요')
      return
    }

    setLoading(true)

    try {
      // 로그인 API 호출
      const response = await axios.post('/users/login', {
        email: formData.email,
        password: formData.password
      })

      if (response.data.success) {
        // 로그인 성공
        // 토큰과 유저 정보 저장
        localStorage.setItem('token', response.data.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.data.user))
        
        // 메인 페이지로 이동
        navigate('/')
      }
    } catch (err) {
      console.error('로그인 에러:', err)
      
      // 에러 처리
      let errorMessage = ''
      if (err.response) {
        // 서버에서 응답이 왔을 때
        errorMessage = err.response.data.message || '로그인에 실패했습니다'
      } else if (err.request) {
        // 요청은 보냈지만 응답이 없을 때
        errorMessage = '서버와 연결할 수 없습니다'
      } else {
        // 요청 설정 중 에러
        errorMessage = '로그인 요청 중 오류가 발생했습니다'
      }
      
      console.log('에러 메시지 설정:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="logo-section">
          <h1 className="logo">SHOPPING MALL</h1>
          <p className="tagline">세련된 패션 쇼핑</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
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

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <div className="footer-links">
            <Link to="/">메인으로</Link>
            <span className="separator">|</span>
            <Link to="/register">회원가입</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login

