# Step 1: migrate-upload

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/Users/jun/Desktop/ieumpyo/baro-braille/docs/ARCHITECTURE.md`
- `/Users/jun/Desktop/ieumpyo/baro-braille/docs/ADR.md`
- `/Users/jun/Desktop/ieumpyo/baro-braille/CLAUDE.md`

이전 step에서 생성된 디렉토리 구조:

- `/Users/jun/Desktop/ieumpyo/baro-braille/features/upload/`

현재 이동할 파일들을 확인하라:

- `/Users/jun/Desktop/ieumpyo/baro-braille/components/upload/` 하위 모든 파일

## 작업

**목표**: upload 도메인의 모든 파일을 `components/upload/` → `features/upload/`로 이동하고, 프로젝트 전체에서 해당 import 경로를 업데이트한다.

**단계**:

1. `components/upload/` 하위의 모든 파일(.jsx, .css)을 `features/upload/`로 이동한다.
   - FileUploadBox.jsx
   - FileList.jsx
   - StepIndicator.jsx
   - ProblemPreview.jsx
   - FilterOptions.jsx
   - GraphViewer.jsx
   - OriginalTextPanel.jsx
   - BrailleInputPanel.jsx
   - ProblemNavigation.jsx
   - UploadPanel.jsx
   - UploadPanel.css (있다면)

2. 프로젝트 전체에서 `@/components/upload`를 import하는 모든 파일을 찾아 `@/features/upload`로 변경한다.
   - `app/` 디렉토리의 모든 페이지 파일
   - 다른 컴포넌트 파일들

3. 변경 후 빌드를 실행하여 에러가 없는지 확인한다.

**검색 방법**:

```bash
# upload import를 사용하는 파일 찾기
grep -r "@/components/upload" app/
grep -r "from.*components/upload" .
```

## Acceptance Criteria

```bash
npm run build
```

빌드가 에러 없이 성공해야 한다.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 빌드 성공 여부를 확인한다.
3. `features/upload/` 디렉토리에 모든 파일이 존재하는지 확인한다.
4. `components/upload/` 디렉토리가 비어있거나 삭제되었는지 확인한다.
5. 결과에 따라 `phases/refactor-features/index.json`의 step 1을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "upload 도메인 features/로 이동 완료, import 경로 업데이트 완료"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`

## 금지사항

- 다른 도메인(preview, conversion, result)의 파일을 이동하거나 수정하지 마라. 이유: 각 도메인은 순차적으로 이동한다.
- `components/layout/` 디렉토리를 건드리지 마라. 이유: layout은 도메인이 아닌 공통 UI이므로 `components/`에 유지한다.
- 파일 내용을 수정하지 마라. 이유: 이 step은 파일 이동과 import 경로 업데이트만 담당한다.
- `lib/` 디렉토리를 수정하지 마라. 이유: lib는 공통 로직이므로 그대로 유지한다.
