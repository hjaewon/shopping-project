import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import './AdminProducts.css'

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

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
)

const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
)

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
)

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
)

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
)

function AdminProducts() {
  const navigate = useNavigate()
  const [selectedMenu, setSelectedMenu] = useState('상품 관리')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const itemsPerPage = 10

  // 상품 목록 가져오기
  useEffect(() => {
    fetchProducts()
  }, [currentPage])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      // 관리자 페이지에서는 비활성 상품도 포함하여 조회
      const response = await axios.get(`/products?includeInactive=true&page=${currentPage}&limit=${itemsPerPage}`)
      if (response.data.success) {
        setProducts(response.data.data)
        setTotalPages(response.data.pagination.pages)
        setTotalProducts(response.data.pagination.total)
      }
    } catch (error) {
      console.error('상품 목록 조회 실패:', error)
      alert('상품 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    navigate('/')
  }

  const handleGoHome = () => {
    navigate('/')
  }

  const handleMenuClick = (menuName) => {
    setSelectedMenu(menuName)
    if (menuName === '대시보드') {
      navigate('/admin')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowEditModal(true)
  }

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`"${productName}" 상품을 삭제하시겠습니까?`)) {
      try {
        const response = await axios.delete(`/products/${productId}`)
        if (response.data.success) {
          alert('상품이 삭제되었습니다.')
          // 현재 페이지에 상품이 1개만 남았고 첫 페이지가 아니면 이전 페이지로
          if (products.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1)
          } else {
            fetchProducts()
          }
        }
      } catch (error) {
        console.error('상품 삭제 실패:', error)
        alert('상품 삭제에 실패했습니다.')
      }
    }
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 검색어 변경 시 첫 페이지로
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }

  // 페이지네이션 렌더링 함수
  const renderPagination = () => {
    const pages = []
    const maxVisiblePages = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // 이전 버튼
    pages.push(
      <button
        key="prev"
        className="pagination-btn pagination-arrow"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeftIcon />
      </button>
    )

    // 첫 페이지
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className="pagination-btn"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      )
      if (startPage > 2) {
        pages.push(<span key="dots1" className="pagination-dots">...</span>)
      }
    }

    // 페이지 번호들
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      )
    }

    // 마지막 페이지
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots2" className="pagination-dots">...</span>)
      }
      pages.push(
        <button
          key={totalPages}
          className="pagination-btn"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      )
    }

    // 다음 버튼
    pages.push(
      <button
        key="next"
        className="pagination-btn pagination-arrow"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRightIcon />
      </button>
    )

    return pages
  }

  const menuItems = [
    { id: 'dashboard', name: '대시보드', icon: <DashboardIcon /> },
    { id: 'products', name: '상품 관리', icon: <ProductIcon /> },
    { id: 'orders', name: '주문 관리', icon: <OrderIcon /> },
    { id: 'users', name: '사용자 관리', icon: <UserIcon /> },
  ]

  return (
    <div className="admin-products-container">
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
      <main className="products-main">
        {/* 헤더 */}
        <div className="products-header">
          <div>
            <h1>상품 관리</h1>
            <p className="products-count">
              전체 {totalProducts}개 상품
              {searchTerm && ` (검색 결과: ${filteredProducts.length}개)`}
            </p>
          </div>
          <button className="add-product-btn" onClick={() => setShowCreateModal(true)}>
            <PlusIcon />
            <span>새 상품 추가</span>
          </button>
        </div>

        {/* 검색바 */}
        <div className="search-bar">
          <SearchIcon />
          <input
            type="text"
            placeholder="상품명 또는 SKU로 검색..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* 상품 테이블 */}
        <div className="products-table-container">
          {loading ? (
            <div className="loading">로딩 중...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-products">등록된 상품이 없습니다.</div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>상품명</th>
                  <th>카테고리</th>
                  <th>가격</th>
                  <th>재고</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="product-name-cell">
                      <div className="product-info-wrapper">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="product-thumbnail"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60?text=No+Image'
                          }}
                        />
                        <div className="product-text-info">
                          <div className="product-name">{product.name}</div>
                          <div className="product-sku">SKU: {product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>₩{product.price.toLocaleString()}</td>
                    <td className={product.stock === 0 ? 'out-of-stock' : ''}>
                      {product.stock}개
                    </td>
                    <td>
                      <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                        {product.isActive ? '판매중' : '중단됨'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="icon-btn edit-btn" 
                          title="수정"
                          onClick={() => handleEdit(product)}
                        >
                          <EditIcon />
                        </button>
                        <button 
                          className="icon-btn delete-btn" 
                          title="삭제"
                          onClick={() => handleDelete(product._id, product.name)}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 페이지네이션 */}
        {!loading && filteredProducts.length > 0 && totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-info">
              페이지 {currentPage} / {totalPages}
            </div>
            <div className="pagination">
              {renderPagination()}
            </div>
          </div>
        )}
      </main>

      {/* 상품 등록 모달 */}
      {showCreateModal && (
        <CreateProductModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            setCurrentPage(1)
            fetchProducts()
          }}
        />
      )}

      {/* 상품 수정 모달 */}
      {showEditModal && editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => {
            setShowEditModal(false)
            setEditingProduct(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setEditingProduct(null)
            fetchProducts()
          }}
        />
      )}
    </div>
  )
}

// 상품 등록 모달 컴포넌트
function CreateProductModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: 0,
    category: '상의',
    image: '',
    description: '',
    stock: 0
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const cloudinaryRef = useRef()
  const widgetRef = useRef()

  // Cloudinary 위젯 초기화
  useEffect(() => {
    // Cloudinary 스크립트 로드
    if (!window.cloudinary) {
      const script = document.createElement('script')
      script.src = 'https://upload-widget.cloudinary.com/global/all.js'
      script.async = true
      document.body.appendChild(script)
      
      script.onload = () => {
        cloudinaryRef.current = window.cloudinary
      }
    } else {
      cloudinaryRef.current = window.cloudinary
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const openCloudinaryWidget = () => {
    if (!cloudinaryRef.current) {
      alert('Cloudinary 위젯을 로딩 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    // 환경변수 확인
    if (!cloudName || !uploadPreset) {
      console.error('Cloudinary 환경변수가 설정되지 않았습니다.')
      alert('Cloudinary 설정이 필요합니다. .env 파일을 확인해주세요.')
      return
    }

    // Cloudinary 업로드 위젯 생성
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        multiple: false,
        maxFiles: 1,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxFileSize: 5000000, // 5MB
        folder: 'products', // Cloudinary 폴더명
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary 업로드 에러:', error)
          alert('이미지 업로드에 실패했습니다.')
          setUploading(false)
          return
        }

        if (result.event === 'success') {
          const imageUrl = result.info.secure_url
          setFormData(prev => ({
            ...prev,
            image: imageUrl
          }))
          setUploading(false)
        } else if (result.event === 'upload-added') {
          setUploading(true)
        }
      }
    )

    widgetRef.current.open()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 유효성 검사
    if (!formData.sku || !formData.name || !formData.price || !formData.image) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    if (formData.price <= 0) {
      alert('가격은 0보다 커야 합니다.')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post('/products', formData)
      
      if (response.data.success) {
        alert('상품이 성공적으로 등록되었습니다!')
        onSuccess()
      }
    } catch (error) {
      console.error('상품 등록 실패:', error)
      const errorMessage = error.response?.data?.message || '상품 등록에 실패했습니다.'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>새 상품 추가</h2>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="sku">SKU *</label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="SKU 입력 (예: TOP001)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">상품명 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="상품명 입력"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">카테고리 *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="상의">상의</option>
              <option value="하의">하의</option>
              <option value="악세사리">악세사리</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">가격 *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">재고 수량</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">상품 이미지 *</label>
            <div className="image-upload-container">
              <button
                type="button"
                className="upload-image-btn"
                onClick={openCloudinaryWidget}
                disabled={uploading}
              >
                <UploadIcon />
                <span>{uploading ? '업로드 중...' : '이미지 업로드'}</span>
              </button>
              
              {formData.image && (
                <div className="image-preview">
                  <img src={formData.image} alt="상품 미리보기" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    title="이미지 제거"
                  >
                    <CloseIcon />
                  </button>
                </div>
              )}
            </div>
            <small className="form-help-text">
              권장 크기: 800x800px, 최대 5MB (JPG, PNG, GIF, WebP)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="description">설명</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="상품 설명 입력"
              rows="4"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 상품 수정 모달 컴포넌트
function EditProductModal({ product, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    sku: product.sku || '',
    name: product.name || '',
    price: product.price || 0,
    category: product.category || '상의',
    image: product.image || '',
    description: product.description || '',
    stock: product.stock || 0,
    isActive: product.isActive !== undefined ? product.isActive : true
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const cloudinaryRef = useRef()
  const widgetRef = useRef()

  // Cloudinary 위젯 초기화
  useEffect(() => {
    // Cloudinary 스크립트 로드
    if (!window.cloudinary) {
      const script = document.createElement('script')
      script.src = 'https://upload-widget.cloudinary.com/global/all.js'
      script.async = true
      document.body.appendChild(script)
      
      script.onload = () => {
        cloudinaryRef.current = window.cloudinary
      }
    } else {
      cloudinaryRef.current = window.cloudinary
    }
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const openCloudinaryWidget = () => {
    if (!cloudinaryRef.current) {
      alert('Cloudinary 위젯을 로딩 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    // 환경변수 확인
    if (!cloudName || !uploadPreset) {
      console.error('Cloudinary 환경변수가 설정되지 않았습니다.')
      alert('Cloudinary 설정이 필요합니다. .env 파일을 확인해주세요.')
      return
    }

    // Cloudinary 업로드 위젯 생성
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        multiple: false,
        maxFiles: 1,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxFileSize: 5000000, // 5MB
        folder: 'products', // Cloudinary 폴더명
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary 업로드 에러:', error)
          alert('이미지 업로드에 실패했습니다.')
          setUploading(false)
          return
        }

        if (result.event === 'success') {
          const imageUrl = result.info.secure_url
          setFormData(prev => ({
            ...prev,
            image: imageUrl
          }))
          setUploading(false)
        } else if (result.event === 'upload-added') {
          setUploading(true)
        }
      }
    )

    widgetRef.current.open()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 유효성 검사
    if (!formData.sku || !formData.name || !formData.price || !formData.image) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    if (formData.price <= 0) {
      alert('가격은 0보다 커야 합니다.')
      return
    }

    try {
      setLoading(true)
      const response = await axios.put(`/products/${product._id}`, formData)
      
      if (response.data.success) {
        alert('상품이 성공적으로 수정되었습니다!')
        onSuccess()
      }
    } catch (error) {
      console.error('상품 수정 실패:', error)
      const errorMessage = error.response?.data?.message || '상품 수정에 실패했습니다.'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>상품 수정</h2>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="sku">SKU *</label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="SKU 입력 (예: TOP001)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">상품명 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="상품명 입력"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">카테고리 *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="상의">상의</option>
              <option value="하의">하의</option>
              <option value="악세사리">악세사리</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">가격 *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">재고 수량</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">상품 이미지 *</label>
            <div className="image-upload-container">
              <button
                type="button"
                className="upload-image-btn"
                onClick={openCloudinaryWidget}
                disabled={uploading}
              >
                <UploadIcon />
                <span>{uploading ? '업로드 중...' : '이미지 변경'}</span>
              </button>
              
              {formData.image && (
                <div className="image-preview">
                  <img src={formData.image} alt="상품 미리보기" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    title="이미지 제거"
                  >
                    <CloseIcon />
                  </button>
                </div>
              )}
            </div>
            <small className="form-help-text">
              권장 크기: 800x800px, 최대 5MB (JPG, PNG, GIF, WebP)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="description">설명</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="상품 설명 입력"
              rows="4"
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <span>판매 활성화</span>
            </label>
            <small className="form-help-text">
              체크 해제 시 상품이 비활성화되어 고객에게 표시되지 않습니다.
            </small>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? '저장 중...' : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminProducts

