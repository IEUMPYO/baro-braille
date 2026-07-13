# Step 0: layout-foundation

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`
- `/docs/UI_GUIDE.md`
- `/CLAUDE.md`
- `/app/layout.jsx`
- `/app/globals.css`
- `/demo_v2.jpeg` (새 디자인 레퍼런스)

현재 레이아웃 구조와 CSS 시스템을 꼼꼼히 읽고, 새 디자인의 사이드바 레이아웃으로 전환하는 작업이다.

## 작업

### 1. 전역 CSS 업데이트 (`app/globals.css`)

demo_v2.jpeg에 맞춰 CSS 변수와 레이아웃 스타일을 업데이트한다:

**추가할 CSS 변수:**

```css
--sidebar-bg: #ffffff;
--sidebar-width: 240px;
--header-height: 64px;
--nav-item-hover: #f6f9fe;
--nav-item-active: #edf5ff;
--nav-item-active-border: #0969db;
```

**레이아ウ트 구조:**

- 왼쪽 고정 사이드바 (240px)
- 상단 고정 헤더 (64px)
- 메인 컨텐츠 영역 (나머지 공간)

**사이드바 스타일:**

- 배경: 흰색
- 오른쪽 경계선: 1px solid var(--line)
- 네비게이션 아이템: 호버/액티브 상태
- 아이콘 + 텍스트 레이아웃

기존 `.app-shell`, `.topbar`, `.workspace` 스타일은 새 레이아웃에 맞게 수정하거나 제거한다.

### 2. Sidebar 컴포넌트 생성 (`components/layout/Sidebar.jsx`)

demo_v2.jpeg의 왼쪽 사이드바를 구현한다:

**네비게이션 항목:**

1. 대시보드 (Home icon)
2. 업로드/변환 (Upload icon)
3. 변환 내역 (FileText icon)
4. 검수 작업 (CheckSquare icon)
5. 제공 내역 (Archive icon)
6. 설정 (Settings icon)

**컴포넌트 구조:**

```javascript
export default function Sidebar({ currentPath }) {
  // currentPath를 받아 현재 활성 메뉴 표시
  // Link 컴포넌트로 라우팅
  // 접근성: aria-label, role="navigation"
}
```

각 항목은 `<Link>` 컴포넌트를 사용하고, 현재 경로와 일치하면 active 스타일을 적용한다.

### 3. Header 컴포넌트 생성 (`components/layout/Header.jsx`)

demo_v2.jpeg의 상단 헤더를 구현한다:

**왼쪽:**

- 브레일 점 로고 + "바로점자" 텍스트
- 서브텍스트: "학습자료 점근성 변환 서비스"

**오른쪽:**

- 도움말 버튼 (HelpCircle icon)
- 알림 버튼 (Bell icon) + 뱃지(숫자)
- 프로필 드롭다운 (UserRound icon + 이름)

```javascript
export default function Header({ onOpenModal }) {
  // 도움말, 프로필 모달 트리거
  // 알림은 Mock (클릭 시 토스트만)
}
```

### 4. Layout 수정 (`app/layout.jsx`)

기존 단일 페이지 구조를 사이드바 + 헤더 레이아웃으로 변경한다:

```javascript
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <div className="app-container">
          <Sidebar />
          <div className="main-wrapper">
            <Header />
            <main className="main-content">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
```

**주의:** layout.jsx는 Server Component이므로, 상태 관리가 필요한 경우 Client Component로 분리하거나 children에서 처리한다.

### 5. 기존 page.jsx 임시 수정

현재 `app/page.jsx`가 빌드 에러 없이 동작하도록 임시로 간단한 컨텐츠로 교체한다:

```javascript
export default function Home() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>대시보드 (작업 중)</h1>
      <p>Step 1에서 페이지 구조를 완성합니다.</p>
    </div>
  );
}
```

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm run dev     # 로컬 실행 후 사이드바/헤더 표시 확인
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 브라우저에서 확인:
   - 왼쪽 사이드바가 고정으로 표시되는가?
   - 상단 헤더가 표시되는가?
   - 메인 컨텐츠 영역이 올바른 위치에 있는가?
   - 사이드바 네비게이션 항목이 6개 표시되는가?
3. 아키텍처 체크리스트:
   - ARCHITECTURE.md의 Feature-based 구조를 따르는가? (components/layout/)
   - UI_GUIDE.md의 색상 변수를 사용하는가?
   - ADR-006 (Vanilla CSS) 규칙을 따르는가?
4. 결과에 따라 `phases/ui-redesign-v2/index.json`의 step 0을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "사이드바/헤더 레이아웃 구조 완성, Sidebar.jsx, Header.jsx 생성"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- Tailwind CSS나 다른 CSS 프레임워크를 도입하지 마라. 이유: ADR-006에서 Vanilla CSS 사용 결정
- backdrop-filter blur를 사용하지 마라. 이유: UI_GUIDE.md "AI 슬롭 안티패턴" 규칙
- 기존 테스트를 깨뜨리지 마라 (현재 테스트가 없으므로 빌드만 확인)
- TypeScript를 도입하지 마라. 이유: ADR-004에서 JavaScript 우선 결정
- app/layout.jsx에서 상태 관리를 하지 마라. 이유: Server Component이므로 useState 사용 불가
