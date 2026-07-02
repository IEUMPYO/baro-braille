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
components/
├── upload/          # 파일 업로드 도메인
├── preview/         # 문제 미리보기 도메인
├── conversion/      # 점역 변환 도메인
└── result/          # 결과 다운로드 도메인

lib/
├── mockData.js      # Mock data
└── services.js      # 비즈니스 로직
```

### 확장 경로

- Mock → API 전환: lib/services.js → features/*/service.js
- GitHub Pages → 클라우드: output: 'export' 제거
- components/ → features/ (CSS, 훅 포함)

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

## 현재 없는 것

- TypeScript
- ESLint/Prettier
- 테스트

나중에 추가
