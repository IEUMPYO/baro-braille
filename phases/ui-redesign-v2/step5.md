# Step 5: history-page

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/docs/ARCHITECTURE.md`
- `/docs/UI_GUIDE.md`
- `/CLAUDE.md`
- `/demo_v2.jpeg`
- `/app/history/page.jsx` (Step 1에서 생성한 빈 페이지)
- `/lib/mockData.js`
- `/app/upload/page.jsx` (Step 2, 3, 4에서 완성)

변환 내역을 표시하는 페이지를 구현하는 작업이다. Mock 데이터로 이전 변환 기록을 보여준다.

## 작업

### 1. 변환 내역 페이지 구조 (`app/history/page.jsx`)

**레이아웃:**

```
┌────────────────────────────────────────────────┐
│  변환 내역                                      │
│  ┌──────────┐  ┌──────────┐                   │
│  │ 전체     │  │ 검색     │                    │
│  └──────────┘  └──────────┘                   │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 2026 수능 수학.pdf       │ 2024-01-15    │ │
│  │ 완료 │ 5문제              │ 다운로드      │ │
│  └──────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────┐ │
│  │ 수학문항_이미지.png      │ 2024-01-14    │ │
│  │ 완료 │ 3문제              │ 다운로드      │ │
│  └──────────────────────────────────────────┘ │
│  ...                                          │
└────────────────────────────────────────────────┘
```

**컴포넌트 구조:**

```javascript
"use client";

import { useState } from "react";

export default function HistoryPage() {
  const [filter, setFilter] = useState("all"); // "all" | "completed" | "processing"
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="page-container">
      <h1 className="page-title">변환 내역</h1>

      <div className="history-controls">
        <div className="filter-tabs">
          <button>전체</button>
          <button>완료</button>
          <button>진행 중</button>
        </div>
        <input
          type="search"
          placeholder="파일명 검색"
          className="search-input"
        />
      </div>

      <div className="history-list">{/* 변환 내역 아이템들 */}</div>
    </div>
  );
}
```

### 2. 변환 내역 아이템

각 아이템은 카드 형식으로 표시:

**구조:**

- 왼쪽: 파일 아이콘 + 파일명
- 중앙: 상태 뱃지 (완료/진행 중) + 문제 개수
- 오른쪽: 날짜 + 액션 버튼

**컴포넌트:**

```javascript
function HistoryItem({ item }) {
  return (
    <div className="history-item">
      <div className="history-item-left">
        <FileIcon type={item.fileType} />
        <div>
          <h3>{item.fileName}</h3>
          <p>{item.problemCount}문제</p>
        </div>
      </div>

      <div className="history-item-center">
        <StatusBadge status={item.status} />
      </div>

      <div className="history-item-right">
        <span className="history-date">{item.date}</span>
        <button className="btn-download">다운로드</button>
      </div>
    </div>
  );
}
```

### 3. Mock 데이터 추가 (`lib/mockData.js`)

```javascript
export const mockHistory = [
  {
    id: "h1",
    fileName: "2026 수능 수학.pdf",
    fileType: "pdf",
    status: "completed",
    problemCount: 5,
    date: "2024-01-15",
    files: [
      { type: "brf", size: "12KB" },
      { type: "전자점자", size: "8KB" },
      { type: "pdf", size: "245KB" },
    ],
  },
  {
    id: "h2",
    fileName: "수학문항_이미지.png",
    fileType: "image",
    status: "completed",
    problemCount: 3,
    date: "2024-01-14",
    files: [
      { type: "brf", size: "8KB" },
      { type: "전자점자", size: "6KB" },
    ],
  },
  {
    id: "h3",
    fileName: "기출문제_2023.pdf",
    fileType: "pdf",
    status: "processing",
    problemCount: 0,
    date: "2024-01-15",
    files: [],
  },
  // 10~15개 정도 추가
];
```

### 4. 필터 및 검색 기능

**필터:**

- "전체": 모든 내역 표시
- "완료": status === "completed"만 표시
- "진행 중": status === "processing"만 표시

**검색:**

- 파일명으로 필터링
- 대소문자 구분 없이 검색

```javascript
const filteredHistory = mockHistory
  .filter((item) => {
    if (filter === "completed") return item.status === "completed";
    if (filter === "processing") return item.status === "processing";
    return true;
  })
  .filter((item) =>
    item.fileName.toLowerCase().includes(searchQuery.toLowerCase()),
  );
```

### 5. 다운로드 액션

각 아이템의 "다운로드" 버튼 클릭 시:

- Modal 또는 Dropdown으로 파일 목록 표시
- BRF, 전자점자, PDF 중 선택
- 기존 lib/utils.js의 downloadFile() 함수 재사용

```javascript
function handleDownload(item) {
  // Mock: 첫 번째 파일 자동 다운로드
  const file = {
    label: `${item.fileName} - BRF`,
    content: "Mock content",
    filename: item.fileName.replace(/\.[^.]+$/, ".brf"),
  };
  downloadFile(file);
  showToast("파일 다운로드를 시작했습니다.");
}
```

### 6. 빈 상태 처리

검색 결과가 없거나 내역이 없을 때:

```javascript
{
  filteredHistory.length === 0 ? (
    <div className="empty-state">
      <FileText size={48} strokeWidth={1.5} />
      <p>변환 내역이 없습니다.</p>
    </div>
  ) : (
    filteredHistory.map((item) => <HistoryItem key={item.id} item={item} />)
  );
}
```

### 7. CSS 스타일 추가 (`app/globals.css`)

```css
.history-controls {
  /* 필터 + 검색 컨테이너 */
}

.filter-tabs {
  /* 탭 버튼 그룹 */
}

.search-input {
  /* 검색 입력 필드 */
}

.history-list {
  /* 내역 목록 컨테이너 */
}

.history-item {
  /* 각 내역 아이템 카드 */
}

.empty-state {
  /* 빈 상태 메시지 */
}
```

UI_GUIDE.md의 카드 스타일과 색상 변수를 사용한다.

### 8. 접근성

- 검색 입력: `aria-label="파일명 검색"`
- 필터 버튼: `aria-pressed` 속성으로 활성 상태 표시
- 다운로드 버튼: `aria-label="파일 다운로드"`

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm run dev     # 로컬 실행 확인
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 브라우저에서 `/history` 페이지 확인:
   - 변환 내역 목록이 표시되는가?
   - 필터 버튼("전체", "완료", "진행 중")이 동작하는가?
   - 검색 입력에 텍스트 입력 시 목록이 필터링되는가?
   - 각 아이템의 "다운로드" 버튼 클릭 시 파일 다운로드가 시작되는가?
   - 검색 결과가 없을 때 빈 상태 메시지가 표시되는가?
3. 아키텍처 체크리스트:
   - Mock 데이터만 사용하는가?
   - UI_GUIDE.md의 디자인 규칙을 따르는가?
   - 기존 유틸리티 함수(downloadFile)를 재사용하는가?
4. 결과에 따라 `phases/ui-redesign-v2/index.json`의 step 5를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "변환 내역 페이지 완성, 필터/검색 기능, 다운로드 액션"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- 실제 DB나 LocalStorage에 데이터를 저장하지 마라. 이유: Mock 데이터만 사용
- 백엔드 API를 호출하지 마라. 이유: 정적 사이트
- 페이지네이션을 복잡하게 구현하지 마라. 이유: Mock 데이터가 적음 (10~15개)
- 정렬 기능을 추가하지 마라. 이유: 요구사항에 없음, 단순성 유지
- 다운로드 시 실제 파일을 생성하지 마라. 이유: 기존 Mock 방식 유지
