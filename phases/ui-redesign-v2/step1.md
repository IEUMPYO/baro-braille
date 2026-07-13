# Step 1: navigation-routing

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`
- `/CLAUDE.md`
- `/components/layout/Sidebar.jsx` (Step 0에서 생성)
- `/components/layout/Header.jsx` (Step 0에서 생성)
- `/app/layout.jsx` (Step 0에서 수정)
- `/demo_v2.jpeg`

Step 0에서 만든 레이아웃 구조를 바탕으로, App Router 페이지들을 생성하는 작업이다.

## 작업

### 1. 페이지 디렉토리 구조 생성

Next.js App Router 규칙에 따라 아래 디렉토리와 page.jsx 파일을 생성한다:

```
app/
├── page.jsx              (기존 - 대시보드로 수정)
├── upload/
│   └── page.jsx          (업로드/변환)
├── history/
│   └── page.jsx          (변환 내역)
├── review/
│   └── page.jsx          (검수 작업)
├── provision/
│   └── page.jsx          (제공 내역)
└── settings/
    └── page.jsx          (설정)
```

### 2. 각 페이지 기본 구조

각 page.jsx는 "use client" 지시문으로 시작하고, 기본 레이아웃만 포함한다:

**`app/page.jsx` (대시보드):**

```javascript
"use client";

export default function DashboardPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">대시보드</h1>
      <p className="page-description">
        통계 및 최근 활동을 표시합니다. (Step 4에서 구현)
      </p>
    </div>
  );
}
```

**`app/upload/page.jsx` (업로드/변환):**

```javascript
"use client";

export default function UploadPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">업로드/변환</h1>
      <p className="page-description">
        파일 업로드 및 점역 변환 워크플로우. (Step 2에서 구현)
      </p>
    </div>
  );
}
```

나머지 페이지들(`/history`, `/review`, `/provision`, `/settings`)도 동일한 패턴으로 생성한다. 각 페이지는 제목과 간단한 설명만 표시한다.

### 3. 공통 페이지 스타일 추가 (`app/globals.css`)

모든 페이지에서 사용할 기본 스타일을 추가한다:

```css
.page-container {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
}

.page-description {
  font-size: 16px;
  color: var(--muted);
  margin-bottom: 32px;
}
```

### 4. Sidebar 네비게이션 연결

Step 0에서 만든 Sidebar.jsx가 현재 경로를 인식하고 active 스타일을 적용하도록 수정한다:

- `usePathname()` 훅 사용 (next/navigation)
- 현재 경로와 일치하는 항목에 active 클래스 추가
- Link 컴포넌트로 각 페이지 연결

**라우트 매핑:**

- `/` → 대시보드
- `/upload` → 업로드/변환
- `/history` → 변환 내역
- `/review` → 검수 작업
- `/provision` → 제공 내역
- `/settings` → 설정

### 5. 모달 관리 구조

Header에서 사용하는 모달(도움말, 프로필)을 관리하기 위해 `components/layout/LayoutClient.jsx` 생성:

```javascript
"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Modal from "./Modal"; // 기존 app/page.jsx의 Modal 이동

export default function LayoutClient({ children }) {
  const [openModal, setOpenModal] = useState(null);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Header onOpenModal={setOpenModal} />
        <main className="main-content">{children}</main>
      </div>
      {openModal && (
        <Modal type={openModal} onClose={() => setOpenModal(null)} />
      )}
    </div>
  );
}
```

그리고 `app/layout.jsx`를 이를 사용하도록 수정:

```javascript
import LayoutClient from "@/components/layout/LayoutClient";
import "./globals.css";

export const metadata = {
  title: "바로점자",
  description: "학습자료 점근성 변환 서비스",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
```

### 6. Modal 컴포넌트 이동

기존 `app/page.jsx`에 있던 Modal 컴포넌트를 `components/layout/Modal.jsx`로 분리한다. 기능은 동일하게 유지한다.

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm run dev     # 로컬 실행 확인
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 브라우저에서 확인:
   - 사이드바의 각 메뉴를 클릭하면 해당 페이지로 이동하는가?
   - 현재 페이지의 메뉴 항목이 active 스타일로 표시되는가?
   - 모든 페이지(`/`, `/upload`, `/history`, `/review`, `/provision`, `/settings`)가 에러 없이 렌더링되는가?
   - 헤더의 도움말/프로필 버튼을 클릭하면 모달이 표시되는가?
3. 아키텍처 체크리스트:
   - App Router 규칙을 따르는가? (각 폴더에 page.jsx)
   - CLAUDE.md의 "use client" 지시문을 올바르게 사용하는가?
   - Feature-based 구조를 유지하는가? (components/layout/)
4. 결과에 따라 `phases/ui-redesign-v2/index.json`의 step 1을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "6개 페이지 라우팅 구조 완성, LayoutClient.jsx, Modal.jsx 분리"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- 각 페이지에서 실제 기능을 구현하지 마라. 이유: Step 2~4에서 순차적으로 구현 예정
- 외부 라우팅 라이브러리(React Router 등)를 사용하지 마라. 이유: Next.js App Router 사용
- app/layout.jsx에 "use client"를 추가하지 마라. 이유: metadata export를 위해 Server Component 유지 필요
- 기존 컴포넌트(UploadPanel, PreviewPanel 등)를 수정하지 마라. 이유: Step 2에서 재사용 예정
