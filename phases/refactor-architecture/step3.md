# Step 3: conversion-component

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/docs/ARCHITECTURE.md`
- `/docs/UI_GUIDE.md`
- `/CLAUDE.md`
- `/app/page.jsx` (현재 monolithic 구조)
- `/app/globals.css` (스타일 참고)
- `/lib/mockData.js` (이전 step에서 생성)
- `/components/upload/UploadPanel.jsx` (이전 step에서 생성)
- `/components/preview/PreviewPanel.jsx` (이전 step에서 생성)

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

점역 변환 진행 상태 도메인을 독립된 컴포넌트로 분리한다.

### 1. components/conversion/ConversionSteps.jsx 생성

**컴포넌트 시그니처**:

```javascript
/**
 * 점역 변환 진행 단계 표시
 * @param {Object} props
 * @param {string} props.status - 현재 상태 ("idle" | "recognizing" | "converting" | "complete")
 * @param {number} props.progress - 진행률 (0~100)
 */
export default function ConversionSteps({ status, progress }) {
  // 구현
}
```

**포함할 내부 컴포넌트**:

- StepIcon (export 불필요, ConversionSteps.jsx 내부에 정의)

**app/page.jsx 참조 범위**:

- 91~106번째 줄: StepIcon 컴포넌트
- 426~443번째 줄: ConversionSteps JSX 마크업 (stage-card 부분)

**기능**:

- 3단계 아이콘 표시 (문서 인식 → 점역 변환 → 결과 출력)
- 상태별 아이콘 변경 (idle/active/done)
- 점역 변환 중일 때 BrailleDots 애니메이션 표시
- 프로그레스 바
- 상태 메시지 (stageCopy)

**주의사항**:

- BrailleDots는 app/page.jsx에 남아있으므로 import해서 사용한다: `import BrailleDots from "@/app/page"`
- 아니면 BrailleDots를 이 파일 내부에 복사해서 정의해도 된다. 판단은 네가 하라.
- StepIcon은 export하지 않는다 (내부 컴포넌트)
- stageCopy는 lib/mockData.js에서 import한다
- stageOrder도 lib/mockData.js에서 import한다
- lucide-react 아이콘: FileText, Printer, CheckCircle2

### 2. components/conversion/ConversionSteps.css 생성

app/globals.css에서 conversion 관련 스타일을 추출한다:

- `.stage-card`
- `.steps`
- `.step`
- `.step-icon` (및 상태별 클래스: `.idle`, `.active`, `.done`)
- `.step-arrow`
- `.progress-track`
- `.stage-copy`
- `.braille-dots` (BrailleDots를 이 파일에 복사한 경우)
- `.braille-dots-small`

**CSS 변수 사용**:

- globals.css의 CSS 변수를 참조한다
- 변수를 복사하지 않는다

### 3. ConversionSteps.jsx에서 CSS import

```javascript
import "./ConversionSteps.css";
```

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - components/conversion/ 디렉토리가 생성되었는가?
   - ConversionSteps.jsx가 props 기반으로 독립적으로 동작하는가?
   - StepIcon이 내부 컴포넌트로 정의되었는가?
   - BrailleDots 처리가 적절한가? (import 또는 복사)
   - ConversionSteps.css에 도메인 스타일만 분리되었는가?
3. 결과에 따라 `phases/refactor-architecture/index.json`의 해당 step을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "ConversionSteps 컴포넌트 분리 완료"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- app/page.jsx를 수정하지 마라. 이 step에서는 components/conversion/ 파일만 생성한다.
- 새로운 기능을 추가하지 마라. 기존 로직을 그대로 옮긴다.
- globals.css에서 conversion과 무관한 스타일을 가져오지 마라.
- StepIcon을 별도 파일로 분리하지 마라. ConversionSteps.jsx 내부에 둔다.
