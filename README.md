# 바로점자

시각장애인 학생을 위한 수능 수학 점역 SaaS 웹 프로토타입입니다.

현재 버전은 백엔드와 AI 모델 연동 전의 화면 프로토타입입니다. PDF, JPG, PNG 업로드 UI와 문제 미리보기, 점역 변환 단계, 결과 다운로드 영역을 GitHub Pages에 올릴 수 있는 정적 Next.js 앱으로 구성했습니다.

## 실행

```bash
npm install
npm run dev
```

## 정적 빌드

```bash
npm run build
```

빌드 결과는 `out/` 폴더에 생성됩니다.

## GitHub Pages

이 저장소 이름이 `baro-braille`인 GitHub Pages 프로젝트 페이지 기준으로 `basePath`가 설정되어 있습니다. GitHub Actions에서 `GITHUB_PAGES=true`로 빌드하면 `/baro-braille` 경로로 배포됩니다.
