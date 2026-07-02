# UI 디자인 가이드

## 디자인 원칙

1. **전문성과 신뢰감**: 교육 기관 담당자가 사용하는 도구. 전문적이고 신뢰할 수 있는 느낌.
2. **명확한 정보 전달**: 수학 문제 인식 → 점역 변환 → 다운로드 플로우가 직관적으로 보여야 함.
3. **접근성 우선**: 시각장애인 지원 서비스이므로 스크린 리더 지원 (`aria-label`, `role`) 필수.
4. **부드럽고 깔끔한 UI**: 라디얼 그라데이션 배경, 카드 기반 레이아웃, 자연스러운 그림자.

## AI 슬롭 안티패턴 — 하지 마라

| 금지 사항                              | 이유                                         |
| -------------------------------------- | -------------------------------------------- |
| backdrop-filter: blur()                | Glass morphism은 AI 템플릿의 가장 흔한 징후  |
| gradient-text (배경 그라데이션 텍스트) | AI가 만든 SaaS 랜딩의 1번 특징               |
| "Powered by AI" 배지                   | 기능이 아니라 장식. 사용자에게 가치 없음     |
| box-shadow 글로우 애니메이션           | 네온 글로우 = AI 슬롭                        |
| 보라/인디고 브랜드 색상                | "AI = 보라색" 클리셰 (우리는 블루 계열 사용) |
| 배경 gradient orb (blur-3xl 원형)      | 모든 AI 랜딩 페이지에 있는 장식              |

## 색상 시스템

### CSS 변수 (`globals.css`)

```css
--bg: #f6f9fe /* 페이지 배경 */ --panel: #ffffff /* 카드/패널 배경 */
  --line: #e5eaf2 /* 경계선 */ --line-strong: #d8e0eb /* 강조 경계선 */
  --text: #182235 /* 주 텍스트 */ --muted: #6f7d91 /* 보조 텍스트 */
  --blue: #0969db /* 주요 액션 색상 */ --blue-soft: #edf5ff /* 블루 배경 */
  --green: #2bb673 /* 성공 */ --violet: #6f45d6 /* 전자점자 */ --rose: #ef4356
  /* PDF */ --shadow: 0 20px 60px rgba(38, 56, 83, 0.12);
```

### 배경

| 용도        | 값                                                                            |
| ----------- | ----------------------------------------------------------------------------- |
| 페이지 배경 | `radial-gradient(circle at top left, #ffffff 0, #f8fbff 38%, var(--bg) 100%)` |
| 카드/패널   | `rgba(255, 255, 255, 0.9)`                                                    |
| 모달        | `#ffffff`                                                                     |

### 텍스트

| 용도      | 값                       | 예시                |
| --------- | ------------------------ | ------------------- |
| 주 텍스트 | `var(--text)` (#182235)  | 제목, 중요 정보     |
| 본문/보조 | `var(--muted)` (#6f7d91) | 설명, 상태 메시지   |
| 비활성    | `#59667a`                | 완료 대기 상태      |
| 링크/액션 | `var(--blue)` (#0969db)  | 버튼, 인터랙션 요소 |

### 시맨틱 색상

| 용도          | 값                        | 사용처         |
| ------------- | ------------------------- | -------------- |
| 성공/완료     | `var(--green)` (#2bb673)  | 변환 완료 상태 |
| 진행 중       | `var(--blue)` (#0969db)   | 인식/변환 중   |
| 대기          | `#8b98aa`                 | Idle 상태      |
| BRF 파일      | Mint (#ecfbf3, #17a36b)   | 파일 카드      |
| 전자점자 파일 | Violet (#f0edff, #6f45d6) | 파일 카드      |
| PDF 파일      | Rose (#fff0f3, #ef4356)   | 파일 카드      |

## 컴포넌트 스타일

### 카드

```css
/* 기본 카드 */
background: rgba(255, 255, 255, 0.9);
border: 1px solid var(--line);
border-radius: 12px;
box-shadow: var(--shadow);
```

**사용 예시**: `.upload-box`, `.preview-panel`, `.stage-card`, `.complete-card`

### 버튼

**Primary (주요 액션)**

```css
background: linear-gradient(180deg, #0875ee, #025bd1);
border-radius: 9px;
box-shadow: 0 12px 22px rgba(5, 98, 220, 0.22);
color: #ffffff;
font-weight: 800;
```

**사용 예시**: 결과 다운로드 버튼, 파일 선택 버튼

**Text/Secondary**

```css
background: transparent;
border: 0;
color: #667085;
font-weight: 700;
```

**사용 예시**: 네비게이션 버튼 (사용 가이드, 내 정보)

### 입력 필드

```css
/* 파일 업로드 박스 */
border: 2px dashed #4f98ff;
border-radius: 12px;
background: rgba(255, 255, 255, 0.9);
```

**Hover/Focus 상태**

```css
background: var(--blue-soft); /* #edf5ff */
```

### 상태 표시 (Pill)

```css
/* 기본 */
border-radius: 999px;
color: #ffffff;
font-size: 13px;
font-weight: 800;
padding: 8px 11px;

/* Idle */
background: #8b98aa;

/* Recognizing/Converting */
background: var(--blue);

/* Complete */
background: var(--green);
```

### 프로그레스 바

```css
/* Track */
background: #edf1f7;
border-radius: 999px;
height: 9px;

/* Fill */
background: linear-gradient(90deg, #0b75ed, #24b47e);
transition: width 260ms ease;
```

## 레이아웃

### 전체 구조

```css
.workspace {
  max-width: 1224px;
  grid-template-columns: minmax(260px, 0.75fr) minmax(360px, 1.1fr) minmax(
      330px,
      1fr
    );
  gap: 16px;
}
```

### 반응형

- **1020px 이하**: 단일 컬럼 (max-width: 760px)
- **640px 이하**: 모바일 최적화 (작은 아이콘, 2열 그리드)

### 간격

- 카드 간 간격: `16px~20px`
- 카드 내부 패딩: `24px~30px`
- 섹션 간 여백: `28px~36px`

## 타이포그래피

### 폰트 패밀리

```css
/* UI */
font-family:
  Inter, Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", system-ui,
  sans-serif;

/* 수학 문제 (세리프) */
font-family: Georgia, "Times New Roman", serif;
```

### 타입 스케일

| 용도        | 스타일                           | 예시                 |
| ----------- | -------------------------------- | -------------------- |
| 브랜드 로고 | `clamp(30px, 3.1vw, 42px)` / 800 | 바로점자             |
| 페이지 제목 | `24px~25px` / 700~800            | 변환 완료            |
| 섹션 제목   | `20px` / 700                     | 인식된 문제 미리보기 |
| 본문        | `15px~17px` / 700~800            | 상태 메시지          |
| 보조 텍스트 | `13px~14px` / 800                | 권장 해상도          |
| 수학 문제   | `clamp(17px, 1.7vw, 22px)` / 600 | 문제 텍스트          |

### Line Height

- UI 텍스트: `1.2~1.45`
- 수학 문제: `1.55` (가독성 우선)

## 아이콘

### Lucide React 사용

```javascript
import { UploadCloud, FileText, Printer, Download } from "lucide-react";

// 기본 사이즈
<Icon size={34} strokeWidth={1.8} />

// 큰 아이콘 (업로드 박스)
<Icon size={64} strokeWidth={1.9} />
```

### 스타일

- **strokeWidth**: 기본 `1.8`, 강조 `2.1`
- **색상**: 부모 요소의 `color` 상속
- **컨테이너 금지**: 아이콘을 둥근 배경 박스로 감싸지 않음 (단, step-icon은 예외)

## 애니메이션

### 허용된 애니메이션

```css
/* 프로그레스 바 */
transition: width 260ms ease;

/* 버튼 hover */
filter: brightness(1.04);

/* 모달 backdrop */
background: rgba(15, 23, 42, 0.36);
```

### 금지된 애니메이션

- 과도한 slide/bounce 효과
- 글로우 애니메이션
- 회전 스피너 (로딩 시 브레일 점 사용)

## 특수 요소

### 브레일 점 (BrailleDots)

```css
/* 3x3 그리드 */
display: grid;
grid-template-columns: repeat(3, 12px);
gap: 8px;

/* 각 점 */
background: linear-gradient(145deg, #2492ff, #0064c9);
border-radius: 999px;
box-shadow: 0 2px 5px rgba(9, 105, 219, 0.2);
width: 12px;
height: 12px;
```

**사용처**: 로고, 점역 변환 중 인디케이터

### 토스트 알림

```css
background: #152033;
border-radius: 10px;
box-shadow: 0 18px 44px rgba(15, 23, 42, 0.24);
color: #ffffff;
font-size: 15px;
font-weight: 800;
position: fixed;
bottom: 24px;
left: 50%;
transform: translateX(-50%);
```

## 접근성 체크리스트

- [ ] 모든 인터랙티브 요소에 `aria-label` 또는 텍스트 레이블
- [ ] 모달에 `role="dialog"`, `aria-modal="true"`
- [ ] 키보드 네비게이션 지원 (Esc로 모달 닫기)
- [ ] 상태 변화를 스크린 리더에게 알림 (toast 메시지)
- [ ] 색상만으로 정보 전달 금지 (텍스트 레이블 병행)
