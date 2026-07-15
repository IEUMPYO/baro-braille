# Step 0: directory-setup

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/Users/jun/Desktop/ieumpyo/baro-braille/docs/ARCHITECTURE.md`
- `/Users/jun/Desktop/ieumpyo/baro-braille/docs/ADR.md`
- `/Users/jun/Desktop/ieumpyo/baro-braille/CLAUDE.md`

## 작업

**목표**: Feature-based 아키텍처를 위한 디렉토리 구조를 생성한다.

현재 프로젝트는 `components/` 디렉토리에 도메인별로 컴포넌트가 분리되어 있다. 이를 `features/` 디렉토리로 전환하여 더 명확한 도메인 기반 구조를 만든다.

**생성할 디렉토리**:

```
features/
├── upload/
├── preview/
├── conversion/
└── result/
```

각 디렉토리는 해당 도메인의 모든 코드(컴포넌트, CSS)를 포함할 것이다.

**구체적 작업**:

1. 프로젝트 루트에 `features/` 디렉토리를 생성한다.
2. `features/` 하위에 4개의 도메인 디렉토리를 생성한다:
   - `features/upload/`
   - `features/preview/`
   - `features/conversion/`
   - `features/result/`

**주의**: 이 step에서는 디렉토리만 생성한다. 파일 이동은 다음 step에서 진행한다.

## Acceptance Criteria

```bash
test -d features/upload && test -d features/preview && test -d features/conversion && test -d features/result
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 4개의 디렉토리가 모두 존재하는지 확인한다.
3. 결과에 따라 `phases/refactor-features/index.json`의 step 0을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "features/ 및 4개 도메인 디렉토리 생성 완료"`
   - 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`

## 금지사항

- 파일을 이동하지 마라. 이유: 이 step은 디렉토리 구조만 생성한다.
- 기존 `components/` 디렉토리를 수정하거나 삭제하지 마라. 이유: 다음 step에서 순차적으로 이동할 것이다.
- 코드를 수정하지 마라. 이유: 이 step은 구조 생성만 담당한다.
