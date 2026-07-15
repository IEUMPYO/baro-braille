# Step 5: update-docs

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/Users/jun/Desktop/ieumpyo/baro-braille/docs/ARCHITECTURE.md`
- `/Users/jun/Desktop/ieumpyo/baro-braille/docs/ADR.md`
- `/Users/jun/Desktop/ieumpyo/baro-braille/CLAUDE.md`

이전 step에서 완성된 구조를 확인하라:

- `/Users/jun/Desktop/ieumpyo/baro-braille/features/` (전체 구조)
- `/Users/jun/Desktop/ieumpyo/baro-braille/components/layout/`

## 작업

**목표**: 변경된 아키텍처를 문서에 반영한다.

**단계**:

### 1. `docs/ARCHITECTURE.md` 업데이트

현재 ARCHITECTURE.md는 MVP 구조로 `components/` 기반으로 작성되어 있다. 이를 `features/` 기반으로 수정한다.

**변경할 섹션**:

- **"디렉토리 구조 > 현재 (MVP)"** 섹션을 업데이트:

  ```
  components/              # 도메인별 컴포넌트
  ├── upload/
  ├── preview/
  ├── conversion/
  └── result/
  ```

  를

  ```
  features/                # 도메인별 완전 분리
  ├── upload/
  ├── preview/
  ├── conversion/
  └── result/
  components/
  └── layout/              # 공통 레이아웃
  ```

  로 변경

- **"도메인 책임"** 섹션은 유지 (내용은 동일)

- 필요시 import 예시 코드도 업데이트:
  ```javascript
  // 변경 전
  import { UploadPanel } from "@/components/upload/UploadPanel";

  // 변경 후
  import { UploadPanel } from "@/features/upload/UploadPanel";
  ```

### 2. `docs/ADR.md` 업데이트

새로운 ADR을 추가한다:

**ADR-008: Feature-based 아키텍처 완전 적용**

```markdown
### ADR-008: Feature-based 아키텍처 완전 적용

**결정**: components/ → features/ 전환 완료

**이유**:

- ADR-005에서 채택한 Feature-based 아키텍처를 완전히 적용
- 도메인별 코드 응집도를 더욱 명확히 향상
- 각 feature가 독립적으로 관리 가능
- 백엔드 연동 시 각 feature에 service.js 추가 용이

**구조**:
```

features/
├── upload/
├── preview/
├── conversion/
└── result/

```

**트레이드오프**:

- ✓ 도메인 경계가 더 명확해짐
- ✓ 확장성 향상 (각 feature에 hooks, service 추가 가능)
- ✓ import 경로가 더 명확 (@/features/upload)
- ✕ 디렉토리 깊이 증가
- → 현재 프로젝트 규모에서 적합한 선택

**전환 전략**:

- components/layout은 공통 UI이므로 components/에 유지
- lib/는 공통 로직이므로 그대로 유지
- Mock 데이터는 lib/mockData.js에 유지 (나중에 API 전환 시 분산 고려)
```

이 내용을 `docs/ADR.md` 파일의 마지막에 추가한다.

### 3. `CLAUDE.md` 업데이트

**"아키텍처 규칙 > Feature-based (도메인 기반)"** 섹션을 업데이트:

```markdown
### Feature-based (도메인 기반)
```

features/
├── upload/ # 파일 업로드 도메인
├── preview/ # 문제 미리보기 도메인
├── conversion/ # 점역 변환 도메인
└── result/ # 결과 다운로드 도메인

components/
└── layout/ # 공통 레이아웃

lib/
├── mockData.js # Mock data
├── services.js # 비즈니스 로직
└── utils.js # 유틸리티

```

### 확장 경로

- Mock → API 전환: lib/services.js → features/*/service.js
- features/ 내 hooks/ 추가 (필요시)
```

## Acceptance Criteria

```bash
grep -q "features/" docs/ARCHITECTURE.md && grep -q "ADR-008" docs/ADR.md && grep -q "features/" CLAUDE.md
```

세 문서 모두에서 `features/` 또는 `ADR-008`이 발견되어야 한다.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 각 문서를 직접 읽어 변경 사항이 올바르게 반영되었는지 확인한다:
   - ARCHITECTURE.md: 디렉토리 구조가 features/ 기반으로 변경되었는가?
   - ADR.md: ADR-008이 추가되었는가?
   - CLAUDE.md: 아키텍처 규칙이 업데이트되었는가?
3. 결과에 따라 `phases/refactor-features/index.json`의 step 5를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "ARCHITECTURE.md, ADR.md, CLAUDE.md 문서 업데이트 완료"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`

## 금지사항

- 코드 파일을 수정하지 마라. 이유: 이 step은 문서 업데이트만 담당한다.
- 기존 ADR 항목을 수정하지 마라. 이유: 새로운 ADR만 추가한다.
- 문서의 다른 섹션을 불필요하게 수정하지 마라. 이유: 아키텍처 변경과 관련된 부분만 업데이트한다.
