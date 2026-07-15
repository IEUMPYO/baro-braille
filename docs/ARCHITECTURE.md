# 아키텍처

## 아키텍처 패턴: Feature-based (도메인 기반)

Next.js/React 생태계에서 널리 쓰이는 도메인 중심 구조.
각 기능별로 관련 코드를 모아 응집도를 높이고 의존성을 낮춤.

## 디렉토리 구조

### 현재 (MVP)

```
baro-braille/
├── app/                      # Next.js App Router
│   ├── layout.jsx           # 루트 레이아웃
│   ├── page.jsx             # 메인 페이지 (오케스트레이션)
│   └── globals.css          # 전역 스타일
├── features/                # 도메인별 완전 분리
│   ├── upload/
│   │   └── UploadPanel.jsx
│   ├── preview/
│   │   └── PreviewPanel.jsx
│   ├── conversion/
│   │   └── ConversionSteps.jsx
│   └── result/
│       └── ResultPanel.jsx
├── components/
│   └── layout/              # 공통 레이아웃
├── lib/
│   ├── mockData.js          # Mock data
│   └── services.js          # 비즈니스 로직 (나중에 API 전환)
├── docs/                    # 프로젝트 문서
└── scripts/                 # 백엔드 실행 스크립트 (Python)
```

### 확장 후 (API 전환 시)

```
baro-braille/
├── app/
├── features/                # 도메인별 완전 분리
│   ├── upload/
│   │   ├── UploadPanel.jsx
│   │   ├── useUpload.js
│   │   └── uploadService.js
│   ├── preview/
│   │   ├── PreviewPanel.jsx
│   │   └── ProblemPreview.jsx
│   ├── conversion/
│   │   ├── ConversionSteps.jsx
│   │   └── useConversion.js
│   └── result/
│       ├── ResultPanel.jsx
│       └── FileDownload.jsx
├── shared/                  # 공통 요소
│   ├── components/
│   │   ├── Button.jsx
│   │   └── Modal.jsx
│   └── hooks/
│       └── useDebounce.js
├── services/                # API 레이어
│   ├── api/
│   │   └── brailleApi.js
│   └── mock/
│       └── mockData.js
└── lib/
    └── utils.js
```

## 현재 구조 (MVP)

- **단일 페이지 애플리케이션**: `app/page.jsx`에서 오케스트레이션만
- **도메인별 컴포넌트**: `features/` 폴더에 기능별로 완전 분리
- **공통 레이아웃**: `components/layout/` 폴더에 공통 UI 요소
- **Mock data**: `lib/mockData.js`에 중앙 관리
- **Client Component**: 전체 페이지가 "use client"로 동작
- **정적 빌드**: `output: 'export'`로 GitHub Pages 배포

## 확장 가능한 설계 패턴

### 1. Mock → API 전환 전략

**현재 (MVP)**

```javascript
// lib/services.js
export async function convertToBraille(file) {
  // Mock 로직
  await delay(2400);
  return {
    problem: mockProblem,
    files: mockFiles,
  };
}
```

**사용**

```javascript
// features/upload/UploadPanel.jsx
import { convertToBraille } from "@/lib/services";

async function handleUpload(file) {
  const result = await convertToBraille(file);
  setRecognizedProblem(result.problem);
  setResultFiles(result.files);
}
```

**API 전환 후**

```javascript
// services/api/brailleApi.js
export async function convertToBraille(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/braille/convert", {
    method: "POST",
    body: formData,
  });

  return response.json();
}

// features/upload/uploadService.js에서 import
```

### 2. 배포 환경 전환 전략

**GitHub Pages (현재)**

```javascript
// next.config.mjs
export default {
  output: "export",
  basePath: process.env.GITHUB_PAGES === "true" ? "/baro-braille" : "",
  images: { unoptimized: true },
};
```

**클라우드 서버 (이후)**

```javascript
// next.config.mjs
export default {
  // output: 'export' 제거
  images: { unoptimized: false },
};
```

## 데이터 흐름

**현재 (Mock)**

```
사용자 업로드
  ↓
UploadPanel (파일 검증)
  ↓
lib/services.js (Mock 로직)
  ↓
PreviewPanel (문제 표시)
  ↓
ConversionSteps (진행 단계)
  ↓
ResultPanel (결과 다운로드)
```

**API 전환 후**

```
사용자 업로드
  ↓
UploadPanel
  ↓
features/upload/uploadService.js
  ↓
services/api/brailleApi.js → 백엔드 API
  ↓
PreviewPanel / ConversionSteps / ResultPanel
```

## 도메인 책임

- **upload**: 파일 업로드, 유효성 검사
- **preview**: 문제 인식 결과 표시
- **conversion**: 점역 변환 진행 상태
- **result**: 변환 결과 다운로드

## 상태 관리

- **현재**: `app/page.jsx`에서 중앙 관리 (`useState`)
- **이후**: 도메인별로 분산 관리 (각 feature의 커스텀 훅)
