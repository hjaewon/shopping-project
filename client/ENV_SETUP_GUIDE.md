# 환경변수 설정 가이드

## .env 파일 생성하기

이 프로젝트는 Cloudinary 이미지 업로드를 위해 환경변수가 필요합니다.

### 1단계: .env 파일 생성

`client` 폴더에 `.env` 파일을 생성하세요.

**Windows (PowerShell):**
```powershell
cd client
New-Item -Path . -Name ".env" -ItemType "file"
```

**Windows (명령 프롬프트):**
```cmd
cd client
type nul > .env
```

**Mac/Linux:**
```bash
cd client
touch .env
```

**또는 수동으로:**
- 파일 탐색기/Finder에서 `client` 폴더를 엽니다
- 새 텍스트 파일을 생성합니다
- 파일 이름을 `.env`로 저장합니다 (확장자 없음)

### 2단계: 환경변수 추가

생성한 `.env` 파일을 열고 다음 내용을 복사하여 붙여넣으세요:

```bash
# Cloudinary 설정
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_here
```

### 3단계: 실제 값으로 교체

1. [Cloudinary](https://cloudinary.com)에 로그인
2. Dashboard에서 **Cloud name** 확인
3. Settings > Upload > Upload presets에서 Unsigned preset 생성
4. `.env` 파일의 값을 실제 값으로 교체:

```bash
# 예시
VITE_CLOUDINARY_CLOUD_NAME=dxxxxxxxx
VITE_CLOUDINARY_UPLOAD_PRESET=products
```

### 4단계: 개발 서버 재시작

환경변수는 서버 시작 시에만 읽히므로 반드시 재시작해야 합니다:

```bash
# 현재 실행 중인 서버를 Ctrl+C로 중단 후
cd client
npm run dev
```

## 확인하기

브라우저 개발자 도구(F12) > Console에서 다음을 입력하여 확인:

```javascript
console.log(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME)
// 값이 출력되면 성공!
```

## 주의사항

⚠️ **절대 `.env` 파일을 Git에 커밋하지 마세요!**
- `.env` 파일은 이미 `.gitignore`에 포함되어 있습니다
- 실제 키 값이 GitHub에 노출되지 않도록 주의하세요

✅ **팀원과 공유할 때는:**
- `.env.example` 파일만 공유
- 실제 키 값은 별도로 안전하게 전달

## 더 자세한 내용

전체 Cloudinary 설정 가이드는 프로젝트 루트의 `CLOUDINARY_SETUP.md` 파일을 참조하세요.

