# Step 6: other-pages

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/docs/ARCHITECTURE.md`
- `/docs/UI_GUIDE.md`
- `/CLAUDE.md`
- `/demo_v2.jpeg`
- `/app/page.jsx` (Step 1에서 생성한 대시보드 빈 페이지)
- `/app/review/page.jsx` (Step 1에서 생성한 검수 작업 빈 페이지)
- `/app/provision/page.jsx` (Step 1에서 생성한 제공 내역 빈 페이지)
- `/app/settings/page.jsx` (Step 1에서 생성한 설정 빈 페이지)
- `/app/upload/page.jsx` (Step 2, 3, 4에서 완성)
- `/app/history/page.jsx` (Step 5에서 완성)

나머지 페이지들(대시보드, 검수 작업, 제공 내역, 설정)을 Mock UI로 완성하는 작업이다.

## 작업

### 1. 대시보드 페이지 (`app/page.jsx`)

메인 대시보드에 통계 카드와 최근 활동을 표시한다:

**레이아웃:**

```
┌──────────────────────────────────────────┐
│  대시보드                                 │
│                                          │
│  ┌───────┐  ┌───────┐  ┌───────┐       │
│  │ 42    │  │ 28    │  │ 14    │       │
│  │ 변환  │  │ 완료  │  │ 대기  │       │
│  └───────┘  └───────┘  └───────┘       │
│                                          │
│  최근 활동                                │
│  ┌────────────────────────────────────┐ │
│  │ 2026 수능 수학.pdf - 변환 완료     │ │
│  │ 2분 전                             │ │
│  └────────────────────────────────────┘ │
│  ...                                    │
└──────────────────────────────────────────┘
```

**컴포넌트 구조:**

```javascript
"use client";

export default function DashboardPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">대시보드</h1>

      <div className="stats-grid">
        <StatCard label="전체 변환" value={42} />
        <StatCard label="완료" value={28} color="green" />
        <StatCard label="진행 중" value={14} color="blue" />
      </div>

      <section className="recent-activity">
        <h2>최근 활동</h2>
        <div className="activity-list">
          {mockRecentActivity.map((item) => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

**StatCard 컴포넌트:**

- 큰 숫자 (font-size: 32px, font-weight: 800)
- 라벨 (작은 텍스트, var(--muted))
- 카드 스타일 (UI_GUIDE.md 참고)

**ActivityItem 컴포넌트:**

- 파일명 + 상태 (예: "변환 완료", "진행 중")
- 시간 표시 (예: "2분 전", "1시간 전")
- 아이콘 (FileText, CheckCircle 등)

**Mock 데이터 추가 (`lib/mockData.js`):**

```javascript
export const mockRecentActivity = [
  {
    id: "a1",
    fileName: "2026 수능 수학.pdf",
    status: "completed",
    time: "2분 전",
  },
  {
    id: "a2",
    fileName: "기출문제_2023.pdf",
    status: "processing",
    time: "15분 전",
  },
  // 5~10개
];
```

### 2. 검수 작업 페이지 (`app/review/page.jsx`)

검수가 필요한 파일 목록을 표시한다:

**레이아웃:**

```
┌──────────────────────────────────────────┐
│  검수 작업                                │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 수학문항.pdf         │ 검수 대기   │ │
│  │ 3문제               │ 검수 시작   │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ 2026 수능.pdf        │ 검수 중     │ │
│  │ 5문제               │ 계속하기    │ │
│  └────────────────────────────────────┘ │
│  ...                                    │
└──────────────────────────────────────────┘
```

**컴포넌트 구조:**

```javascript
"use client";

export default function ReviewPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">검수 작업</h1>
      <p className="page-description">
        변환 결과를 검수하고 승인할 파일 목록입니다.
      </p>

      <div className="review-list">
        {mockReviewQueue.map((item) => (
          <ReviewItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

**ReviewItem 컴포넌트:**

- 파일명 + 문제 개수
- 상태 뱃지 ("검수 대기", "검수 중", "검수 완료")
- 액션 버튼 ("검수 시작", "계속하기")
- 클릭 시 `/upload` 페이지의 검수 화면으로 이동 (Mock으로 토스트만 표시)

**Mock 데이터 추가 (`lib/mockData.js`):**

```javascript
export const mockReviewQueue = [
  {
    id: "r1",
    fileName: "수학문항.pdf",
    problemCount: 3,
    status: "pending",
  },
  {
    id: "r2",
    fileName: "2026 수능.pdf",
    problemCount: 5,
    status: "in_progress",
  },
  // 5~8개
];
```

### 3. 제공 내역 페이지 (`app/provision/page.jsx`)

외부에 제공한 파일 목록을 표시한다:

**레이아웃:**

- 변환 내역(Step 5)과 유사한 구조
- 파일명, 제공 날짜, 수신자, 다운로드 버튼

**컴포넌트 구조:**

```javascript
"use client";

export default function ProvisionPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">제공 내역</h1>
      <p className="page-description">
        학생 또는 기관에 제공한 점역 자료 목록입니다.
      </p>

      <div className="provision-list">
        {mockProvisions.map((item) => (
          <ProvisionItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

**ProvisionItem 컴포넌트:**

- 파일명
- 수신자 (예: "홍길동 학생", "서울시교육청")
- 제공 날짜
- 다운로드 버튼

**Mock 데이터 추가 (`lib/mockData.js`):**

```javascript
export const mockProvisions = [
  {
    id: "p1",
    fileName: "2026 수능 수학.pdf",
    recipient: "홍길동 학생",
    date: "2024-01-10",
  },
  {
    id: "p2",
    fileName: "기출문제_2023.pdf",
    recipient: "서울시교육청",
    date: "2024-01-08",
  },
  // 5~10개
];
```

### 4. 설정 페이지 (`app/settings/page.jsx`)

사용자 설정과 시스템 설정을 표시한다:

**레이아웃:**

```
┌──────────────────────────────────────────┐
│  설정                                     │
│                                          │
│  계정 정보                                │
│  ┌────────────────────────────────────┐ │
│  │ 기관: 경기도교육청 점역센터         │ │
│  │ 사용자: 홍길동 선생님               │ │
│  │ 이메일: hong@example.com           │ │
│  └────────────────────────────────────┘ │
│                                          │
│  알림 설정                                │
│  ┌────────────────────────────────────┐ │
│  │ ☑ 변환 완료 알림                   │ │
│  │ ☐ 검수 요청 알림                   │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌──────────┐                           │
│  │ 저장     │                           │
│  └──────────┘                           │
└──────────────────────────────────────────┘
```

**컴포넌트 구조:**

```javascript
"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    convertComplete: true,
    reviewRequest: false,
  });

  function handleSave() {
    // Mock: 토스트 메시지만 표시
    alert("설정이 저장되었습니다.");
  }

  return (
    <div className="page-container">
      <h1 className="page-title">설정</h1>

      <section className="settings-section">
        <h2>계정 정보</h2>
        <div className="settings-card">
          <div className="settings-item">
            <label>기관</label>
            <span>{mockProfile.org}</span>
          </div>
          <div className="settings-item">
            <label>사용자</label>
            <span>{mockProfile.user}</span>
          </div>
          <div className="settings-item">
            <label>플랜</label>
            <span>{mockProfile.plan}</span>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>알림 설정</h2>
        <div className="settings-card">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={notifications.convertComplete}
              onChange={(e) =>
                setNotifications({
                  ...notifications,
                  convertComplete: e.target.checked,
                })
              }
            />
            변환 완료 알림
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={notifications.reviewRequest}
              onChange={(e) =>
                setNotifications({
                  ...notifications,
                  reviewRequest: e.target.checked,
                })
              }
            />
            검수 요청 알림
          </label>
        </div>
      </section>

      <button className="btn-primary" onClick={handleSave}>
        저장
      </button>
    </div>
  );
}
```

### 5. 공통 CSS 스타일 추가 (`app/globals.css`)

모든 새 페이지에서 사용하는 스타일:

```css
.stats-grid {
  /* 통계 카드 그리드 */
}

.stat-card {
  /* 통계 카드 */
}

.recent-activity,
.review-list,
.provision-list {
  /* 리스트 컨테이너 */
}

.activity-item,
.review-item,
.provision-item {
  /* 리스트 아이템 */
}

.settings-section {
  /* 설정 섹션 */
}

.settings-card {
  /* 설정 카드 */
}

.settings-item {
  /* 설정 항목 (label + value) */
}

.checkbox-label {
  /* 체크박스 레이블 */
}
```

UI_GUIDE.md의 카드 스타일, 색상 변수, 버튼 스타일을 따른다.

### 6. 네비게이션 최종 확인

Sidebar에서 모든 페이지로 이동이 가능한지 확인:

- 대시보드 (/) ✓
- 업로드/변환 (/upload) ✓
- 변환 내역 (/history) ✓
- 검수 작업 (/review) ✓
- 제공 내역 (/provision) ✓
- 설정 (/settings) ✓

### 7. 접근성 체크

모든 페이지에서:

- 페이지 제목에 적절한 heading 레벨 (h1, h2)
- 버튼에 명확한 텍스트 또는 aria-label
- 리스트에 적절한 시맨틱 태그 (ul, li 또는 역할)
- 체크박스와 레이블 연결

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm run dev     # 로컬 실행 확인
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 브라우저에서 모든 페이지 확인:
   - `/` (대시보드): 통계 카드와 최근 활동이 표시되는가?
   - `/review`: 검수 작업 목록이 표시되는가?
   - `/provision`: 제공 내역이 표시되는가?
   - `/settings`: 설정 페이지가 동작하는가? (체크박스, 저장 버튼)
   - 모든 페이지가 사이드바/헤더와 함께 표시되는가?
   - 사이드바에서 각 메뉴를 클릭하면 해당 페이지로 이동하는가?
3. 아키텍처 체크리스트:
   - Mock 데이터만 사용하는가?
   - UI_GUIDE.md의 디자인 규칙을 따르는가?
   - 모든 페이지가 "use client" 지시문을 포함하는가?
   - Feature-based 구조를 유지하는가?
4. 최종 빌드 확인:
   - `npm run build && npm run dev` 실행 시 에러 없이 모든 페이지가 동작하는가?
5. 결과에 따라 `phases/ui-redesign-v2/index.json`의 step 6을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "대시보드, 검수 작업, 제공 내역, 설정 페이지 완성. 전체 UI 리디자인 완료"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- 실제 DB나 API를 연동하지 마라. 이유: Mock 데이터만 사용
- 복잡한 상태 관리 라이브러리(Redux, Zustand 등)를 도입하지 마라. 이유: useState로 충분
- 설정 페이지에서 실제로 데이터를 저장하지 마라. 이유: 정적 사이트
- 검수 작업 페이지의 "검수 시작" 버튼을 실제 검수 화면과 연결하지 마라. 이유: Mock으로만 동작
- 통계 숫자를 실제 데이터에서 계산하지 마라. 이유: 하드코딩된 Mock 값 사용
- UI_GUIDE.md의 "AI 슬롭 안티패턴"을 사용하지 마라
