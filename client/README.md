# Shopping Mall Client

React + Vite로 구축된 쇼핑몰 프론트엔드

## 🚀 시작하기

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 `http://localhost:3000`에서 실행됩니다.

### 빌드

```bash
npm run build
```

### 프리뷰

```bash
npm run preview
```

## 🛠 기술 스택

- **React 19** - UI 라이브러리
- **Vite** - 빌드 도구
- **React Router DOM** - 라우팅
- **Axios** - HTTP 클라이언트

## 🔌 API 연동

Vite 프록시를 통해 `/api` 경로는 자동으로 `http://localhost:5001`로 전달됩니다.

```javascript
// src/api/axios.js를 사용하여 API 호출
import axios from './api/axios';

axios.get('/users')  // → http://localhost:5001/api/users
```

## 📝 라이선스

ISC
