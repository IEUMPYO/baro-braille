# Step 4: cleanup-verify

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/Users/jun/Desktop/ieumpyo/baro-braille/docs/ARCHITECTURE.md`
- `/Users/jun/Desktop/ieumpyo/baro-braille/CLAUDE.md`

이전 step에서 이동된 파일들을 확인하라:

- `/Users/jun/Desktop/ieumpyo/baro-braille/features/upload/`
- `/Users/jun/Desktop/ieumpyo/baro-braille/features/preview/`
- `/Users/jun/Desktop/ieumpyo/baro-braille/features/conversion/`
- `/Users/jun/Desktop/ieumpyo/baro-braille/features/result/`

현재 남아있는 구조를 확인하라:

- `/Users/jun/Desktop/ieumpyo/baro-braille/components/` (layout만 남아있어야 함)

## 작업

**목표**: 불필요한 디렉토리를 정리하고 최종 빌드를 검증한다.

**단계**:

1. `components/` 디렉토리를 확인한다:
   - `components/layout/`만 남아있어야 한다.
   - `components/upload/`, `components/preview/`, `components/conversion/`, `components/result/` 디렉토리가 비어있다면 삭제한다.

2. 전체 프로젝트에서 `@/components/upload`, `@/components/preview`, `@/components/conversion`, `@/components/result`를 import하는 파일이 남아있는지 검색한다.
   - 만약 발견되면 `@/features/...`로 변경한다.

3. 최종 빌드를 실행하여 모든 것이 정상 동작하는지 확인한다.

**검색 방법**:

```bash
# 남아있는 잘못된 import 찾기
grep -r "@/components/upload" . --exclude-dir=node_modules --exclude-dir=.next
grep -r "@/components/preview" . --exclude-dir=node_modules --exclude-dir=.next
grep -r "@/components/conversion" . --exclude-dir=node_modules --exclude-dir=.next
grep -r "@/components/result" . --exclude-dir=node_modules --exclude-dir=.next
```

## Acceptance Criteria

```bash
npm run build && test -d components/layout && ! test -d components/upload
```

- 빌드가 성공해야 한다.
- `components/layout/`은 존재해야 한다.
- `components/upload/`는 존재하지 않아야 한다.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - `features/` 디렉토리에 4개 도메인(upload, preview, conversion, result)이 모두 존재하는가?
   - `components/`에는 `layout/`만 남아있는가?
   - 모든 import 경로가 `@/features/...`로 변경되었는가?
3. 결과에 따라 `phases/refactor-features/index.json`의 step 4를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "불필요한 디렉토리 정리 완료, 최종 빌드 검증 성공"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`

## 금지사항

- `components/layout/`을 삭제하지 마라. 이유: layout은 도메인이 아닌 공통 UI이므로 `components/`에 유지한다.
- `features/` 디렉토리의 파일을 수정하지 마라. 이유: 이미 이동이 완료된 파일들이다.
- `lib/` 디렉토리를 수정하지 마라. 이유: lib는 공통 로직이므로 그대로 유지한다.
- 코드 로직을 변경하지 마라. 이유: 이 step은 정리와 검증만 담당한다.
