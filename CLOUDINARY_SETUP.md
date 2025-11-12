# Cloudinary 이미지 업로드 설정 가이드

## 1. Cloudinary 계정 생성

1. [Cloudinary](https://cloudinary.com/) 사이트에 접속
2. 무료 계정 생성 (Sign Up)
3. 로그인 후 Dashboard로 이동

## 2. Cloud Name 확인

Dashboard에서 다음 정보를 확인:
- **Cloud name**: 대시보드 상단에 표시됨 (예: `dxxxxxxxx`)

## 3. Upload Preset 생성

1. Dashboard에서 **Settings** (톱니바퀴 아이콘) 클릭
2. 왼쪽 메뉴에서 **Upload** 탭 선택
3. 아래로 스크롤하여 **Upload presets** 섹션 찾기
4. **Add upload preset** 버튼 클릭
5. 다음과 같이 설정:
   - **Preset name**: `products` (또는 원하는 이름)
   - **Signing Mode**: **Unsigned** (중요!)
   - **Folder**: `products` (선택사항)
   - **Access Mode**: `public`
6. **Save** 버튼 클릭

## 4. 환경변수 설정

프로젝트의 `client` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가:

```bash
# Cloudinary 설정
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_here
```

**실제 값으로 교체한 예시:**
```bash
VITE_CLOUDINARY_CLOUD_NAME=dxxxxxxxx
VITE_CLOUDINARY_UPLOAD_PRESET=products
```

### 중요사항
- ✅ 파일 이름은 정확히 `.env` 여야 합니다
- ✅ `client` 폴더 안에 생성해야 합니다 (서버 폴더가 아님)
- ✅ Vite 프로젝트이므로 반드시 `VITE_` 접두사를 사용해야 합니다
- ✅ `.env` 파일은 `.gitignore`에 추가되어 있어 Git에 커밋되지 않습니다
- ⚠️ 환경변수 변경 후에는 개발 서버를 재시작해야 합니다

## 5. 개발 서버 재시작

환경변수를 추가한 후에는 반드시 개발 서버를 재시작해야 합니다:

```bash
cd client
npm run dev
```

또는 이미 실행 중이라면 `Ctrl+C`로 중단 후 다시 시작하세요.

## 6. 테스트

1. 애플리케이션 실행
2. 관리자 페이지에서 "새 상품 추가" 클릭
3. "이미지 업로드" 버튼 클릭
4. Cloudinary 업로드 위젯이 열리면 이미지 선택
5. 업로드 후 미리보기가 표시되는지 확인

## 7. 보안 고려사항 (프로덕션 환경)

프로덕션 환경에서는 다음 사항을 고려하세요:

### 프로덕션 환경변수

프로덕션 배포 시 호스팅 플랫폼(Vercel, Netlify 등)의 환경변수 설정에 동일한 값을 추가하세요:
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

### Upload Preset 보안 설정

프로덕션에서는 Signed 모드 사용 권장:
1. Upload Preset의 Signing Mode를 **Signed**로 변경
2. 백엔드 서버에서 서명(signature) 생성
3. 프론트엔드에서 서명을 포함하여 업로드

자세한 내용: [Cloudinary Upload Documentation](https://cloudinary.com/documentation/upload_images)

## 8. 무료 플랜 제한사항

Cloudinary 무료 플랜:
- 월 25 크레딧 (25GB 저장공간, 25GB 대역폭)
- 10GB 관리 저장소
- 이미지 및 비디오 변환 가능

대부분의 소규모 프로젝트에는 충분합니다.

## 9. 문제 해결

### "Cloudinary 설정이 필요합니다" 알림이 뜸
- `.env` 파일이 `client` 폴더에 있는지 확인
- 환경변수 이름이 정확한지 확인 (`VITE_` 접두사 필수)
- 개발 서버를 재시작했는지 확인
- 브라우저 콘솔에서 `import.meta.env` 값 확인:
  ```javascript
  console.log(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME)
  ```

### "Cloudinary 위젯을 로딩 중입니다" 메시지가 계속 표시됨
- 인터넷 연결 확인
- 브라우저 콘솔에서 스크립트 로딩 오류 확인
- 브라우저 캐시 삭제 후 재시도

### 업로드 실패
- `.env` 파일의 Cloud Name과 Upload Preset이 정확한지 확인
- Upload Preset의 Signing Mode가 **Unsigned**인지 확인
- 브라우저 콘솔에서 에러 메시지 확인
- Cloudinary Dashboard에서 Upload Preset이 활성화되어 있는지 확인

### 이미지가 업로드되지만 미리보기가 안 보임
- 브라우저 콘솔에서 CORS 에러 확인
- Cloudinary 설정에서 CORS 설정 확인
- 이미지 URL이 올바른지 확인 (Network 탭에서 확인)

### 환경변수가 undefined로 나옴
- 파일 이름이 `.env`인지 확인 (`.env.local`이 아님)
- `VITE_` 접두사가 있는지 확인
- 개발 서버를 완전히 재시작했는지 확인
- Windows 사용자: 숨김 파일 표시 설정 확인

