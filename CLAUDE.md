# 프로젝트: 바로점자

## 기술 스택

- Next.js 16 (App Router)
- React 19
- Vanilla CSS
- Lucide React
- GitHub Pages 배포

## 아키텍처 규칙

### Feature-based (도메인 기반)

```
features/
├── upload/          # 파일 업로드 도메인
├── preview/         # 문제 미리보기 도메인
├── conversion/      # 점역 변환 도메인
└── result/          # 결과 다운로드 도메인

components/
└── layout/          # 공통 레이아웃

lib/
├── mockData.js      # Mock data
├── services.js      # 비즈니스 로직
└── utils.js         # 유틸리티
```

### 확장 경로

- Mock → API 전환: lib/services.js → features/*/service.js
- features/ 내 hooks/ 추가 (필요시)
- GitHub Pages → 클라우드: output: 'export' 제거

### 일반

- 도메인별로 코드 분리
- CSS 변수 쓰기 (--bg, --panel, --text)
- 접근성 유지 (aria-label, role)

## 개발

**커밋**

- feat: / fix: / docs: / refactor: / style: / chore:

**브랜치**

- main: 안정 버전
- feature/*: 새 기능
- refactor/*: 리팩토링

**명령어**

```bash
npm run dev          # 개발
npm run build        # 빌드
```

## Harness 워크플로우

**Task 완료 후 정리**

- PR merge 완료 시 `phases/{task-name}/` 디렉토리 즉시 삭제
- phases/ 디렉토리는 작업 중에만 존재, 완료 후 정리 필수
- git에 커밋하지 않음 (.gitignore 포함)

**규칙**

- Task 완료 → PR merge → phases/ 삭제 순서 엄수
- 매번 사용자가 요청하지 않아도 자동으로 정리

## 현재 없는 것

- TypeScript
- ESLint/Prettier
- 테스트

나중에 추가
