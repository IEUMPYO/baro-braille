// Mock 문서 데이터. docs/ui-mockup-v1.html이 원본(single source of truth).
// 스키마는 docs/ARCHITECTURE.md "데이터 스키마" 준수 (mock = 향후 API 응답).
//   문서 → 페이지(원본 이미지) + 문제[]
//   문제 → 교열용 blocks[] / 점역용 lines{} (1-indexed)
//   수식: 텍스트 내 [sc]LaTeX[/sc] 인라인 마킹
//   점자: 유니코드 점자(U+2800 블록), 셀당 1문자
import { PAGE1_IMAGE, PAGE2_IMAGE } from "./pageImages";

export const PDF_RATIO = 1400 / 989; // 원본 이미지 세로/가로 비율

export const mockDoc = {
  fileName: "수학영역_문제지.pdf",
  pageCount: 2,
  pages: [
    { pageNo: 1, image: PAGE1_IMAGE, ratio: PDF_RATIO },
    { pageNo: 2, image: PAGE2_IMAGE, ratio: PDF_RATIO },
  ],
  problems: [
    {
      no: 1,
      page: 1,
      bbox: { left: 13, top: 24.8, width: 34, height: 6.6 },
      blocks: [
        {
          type: "problem",
          html: "[sc]9^{\\frac{1}{4}} \\times 3^{-\\frac{1}{2}}[/sc] 의 값은? [2점]",
        },
        { type: "choices", items: ["① 1", "② √3", "③ 3", "④ 3√3", "⑤ 9"] },
      ],
      lines: {
        1: {
          src: "9^(1/4) × 3^(−1/2) 의 값은? [2점]",
          braille: "⠼⠊⠘⠺⠌⠼⠁⠲⠼⠙⠰ ⠡ ⠼⠉⠘⠺⠤⠌⠼⠁⠲⠼⠃⠰ ⠺ ⠘⠣⠌⠵⠳ ⠦⠼⠃⠨⠎⠴",
          back: "9^(1/4) × 3^(−1/2) 의 값은? [2점]",
        },
        2: { src: "① 1", braille: "⠰⠼⠁⠆ ⠼⠁", back: "① 1" },
        3: { src: "② √3", braille: "⠰⠼⠃⠆ ⠩⠼⠉", back: "② √3" },
        4: { src: "③ 3", braille: "⠰⠼⠉⠆ ⠼⠉", back: "③ 3" },
        5: { src: "④ 3√3", braille: "⠰⠼⠙⠆ ⠼⠉⠩⠼⠉", back: "④ 3√3" },
        6: { src: "⑤ 9", braille: "⠰⠼⠑⠆ ⠼⠊", back: "⑤ 9" },
      },
    },
    {
      no: 2,
      page: 1,
      bbox: { left: 13, top: 50.4, width: 34, height: 8 },
      blocks: [
        {
          type: "problem",
          html: "함수 [sc]f(x) = 3x^{3} + 4x + 1[/sc] 에 대하여",
        },
        {
          type: "problem",
          html: "[sc]\\lim_{h \\to 0} \\dfrac{f(1+h)-f(1)}{h}[/sc] 의 값은? [2점]",
        },
        { type: "choices", items: ["① 7", "② 9", "③ 11", "④ 13", "⑤ 15"] },
      ],
      lines: {
        1: {
          src: "함수 f(x) = 3x³ + 4x + 1 에 대하여",
          braille: "⠚⠣⠝⠠⠍ ⠋⠦⠭⠴⠶⠼⠉⠭⠔⠼⠉⠬⠼⠙⠭⠬⠼⠁ ⠝ ⠊⠗⠚⠣⠳",
          back: "함수 f(x) = 3x³ + 4x + 1 에 대하여",
        },
        2: {
          src: "lim(h→0) (f(1+h)−f(1))/h 의 값은? [2점]",
          braille: "⠸⠣ ⠓⠘⠒⠼⠚ ⠶⠋⠦⠼⠁⠬⠓⠴⠔⠋⠦⠼⠁⠴⠶⠌⠓ ⠺ ⠘⠣⠌⠵⠳ ⠦⠼⠃⠨⠎⠴",
          back: "lim(h→0) (f(1+h)−f(1))/h 의 값은? [2점]",
        },
        3: { src: "① 7", braille: "⠰⠼⠁⠆ ⠼⠛", back: "① 7" },
        4: { src: "② 9", braille: "⠰⠼⠃⠆ ⠼⠊", back: "② 9" },
        5: { src: "③ 11", braille: "⠰⠼⠉⠆ ⠼⠁⠁", back: "③ 11" },
        6: { src: "④ 13", braille: "⠰⠼⠙⠆ ⠼⠁⠉", back: "④ 13" },
        7: { src: "⑤ 15", braille: "⠰⠼⠑⠆ ⠼⠁⠑", back: "⑤ 15" },
      },
    },
    {
      no: 3,
      page: 1,
      bbox: { left: 50, top: 21.6, width: 38.5, height: 7 },
      blocks: [
        {
          type: "problem",
          html: "수열 [sc]\\{ a_{n} \\}[/sc] 에 대하여 [sc]\\sum_{k=1}^{4} (2a_{k} - k) = 0[/sc] 일 때,",
        },
        {
          type: "problem",
          html: "[sc]\\sum_{k=1}^{4} a_{k}[/sc] 의 값은? [3점]",
        },
        { type: "choices", items: ["① 1", "② 2", "③ 3", "④ 4", "⑤ 5"] },
      ],
      lines: {
        1: {
          src: "수열 {aₙ} 에 대하여 Σ(k=1→4) (2aₖ − k) = 0 일 때,",
          braille: "⠠⠍⠡⠂ ⠦⠁⠝⠴ ⠝ ⠊⠗⠚⠣⠳ ⠘⠨ ⠅⠶⠼⠁⠘⠒⠼⠙ ⠶⠼⠃⠁⠅⠔⠅⠶⠶⠼⠚ ⠕⠂ ⠠⠞",
          back: "수열 {aₙ} 에 대하여 Σ(k=1→4) (2aₖ − k) = 0 일 때,",
        },
        2: {
          src: "Σ(k=1→4) aₖ 의 값은? [3점]",
          braille: "⠘⠨ ⠅⠶⠼⠁⠘⠒⠼⠙ ⠁⠅ ⠺ ⠘⠣⠌⠵⠳ ⠦⠼⠉⠨⠎⠴",
          back: "Σ(k=1→4) aₖ 의 값은? [3점]",
        },
        3: { src: "① 1", braille: "⠰⠼⠁⠆ ⠼⠁", back: "① 1" },
        4: { src: "② 2", braille: "⠰⠼⠃⠆ ⠼⠃", back: "② 2" },
        5: { src: "③ 3", braille: "⠰⠼⠉⠆ ⠼⠉", back: "③ 3" },
        6: { src: "④ 4", braille: "⠰⠼⠙⠆ ⠼⠙", back: "④ 4" },
        7: { src: "⑤ 5", braille: "⠰⠼⠑⠆ ⠼⠑", back: "⑤ 5" },
      },
    },
    {
      no: 4,
      page: 1,
      bbox: { left: 50, top: 50.8, width: 38.5, height: 12.4 },
      blocks: [
        {
          type: "problem",
          html: "함수 [sc]f(x) = \\begin{cases} 3x-2 & (x < 1) \\\\ x^{2}-3x+a & (x \\geq 1) \\end{cases}[/sc] 가",
        },
        {
          type: "problem",
          html: "이 실수 전체의 집합에서 연속일 때, 상수 [sc]a[/sc] 의 값은? [3점]",
        },
        { type: "choices", items: ["① 1", "② 2", "③ 3", "④ 4", "⑤ 5"] },
      ],
      lines: {
        1: {
          src: "함수 f(x) = { 3x−2 (x<1) ; x²−3x+a (x≥1) } 가",
          braille: "⠚⠣⠝⠠⠍ ⠋⠦⠭⠴⠶ ⠦⠼⠉⠭⠔⠼⠃ ⠶⠭⠣⠼⠁⠶⠆ ⠭⠢⠼⠃⠔⠼⠉⠭⠬⠁ ⠶⠭⠘⠼⠁⠶⠴ ⠫",
          back: "함수 f(x) = { 3x−2 (x<1) ; x²−3x+a (x≥1) } 가",
        },
        2: {
          src: "이 실수 전체의 집합에서 연속일 때, 상수 a 의 값은? [3점]",
          braille: "⠕ ⠠⠕⠂⠠⠍ ⠨⠎⠒⠰⠝⠺ ⠨⠕⠃⠚⠣⠃⠝⠠⠎ ⠡⠒⠠⠥⠁⠕⠂ ⠠⠞ ⠇⠶⠠⠍ ⠁ ⠺ ⠘⠣⠌⠵⠳ ⠦⠼⠉⠨⠎⠴",
          back: "이 실수 전체의 집합에서 연속일 때, 상수 a 의 값은? [3점]",
        },
        3: { src: "① 1", braille: "⠰⠼⠁⠆ ⠼⠁", back: "① 1" },
        4: { src: "② 2", braille: "⠰⠼⠃⠆ ⠼⠃", back: "② 2" },
        5: { src: "③ 3", braille: "⠰⠼⠉⠆ ⠼⠉", back: "③ 3" },
        6: { src: "④ 4", braille: "⠰⠼⠙⠆ ⠼⠙", back: "④ 4" },
        7: { src: "⑤ 5", braille: "⠰⠼⠑⠆ ⠼⠑", back: "⑤ 5" },
      },
    },
    {
      no: 5,
      page: 2,
      bbox: { left: 12.5, top: 16.4, width: 36, height: 5.8 },
      blocks: [
        {
          type: "problem",
          html: "함수 [sc]f(x) = (x+2)(2x^{2}-x-2)[/sc] 에 대하여 [sc]f'(1)[/sc] 의 값은? [3점]",
        },
        { type: "choices", items: ["① 6", "② 7", "③ 8", "④ 9", "⑤ 10"] },
      ],
      lines: {
        1: {
          src: "함수 f(x) = (x+2)(2x²−x−2) 에 대하여 f′(1) 의 값은? [3점]",
          braille:
            "⠚⠣⠝⠠⠍ ⠋⠦⠭⠴⠶⠶⠭⠬⠼⠃⠶⠶⠼⠃⠭⠢⠼⠃⠔⠭⠔⠼⠃⠶ ⠝ ⠊⠗⠚⠣⠳ ⠋⠲⠦⠼⠁⠴ ⠺ ⠘⠣⠌⠵⠳ ⠦⠼⠉⠨⠎⠴",
          back: "함수 f(x) = (x+2)(2x²−x−2) 에 대하여 f′(1) 의 값은? [3점]",
        },
        2: { src: "① 6", braille: "⠰⠼⠁⠆ ⠼⠋", back: "① 6" },
        3: { src: "② 7", braille: "⠰⠼⠃⠆ ⠼⠛", back: "② 7" },
        4: { src: "③ 8", braille: "⠰⠼⠉⠆ ⠼⠓", back: "③ 8" },
        5: { src: "④ 9", braille: "⠰⠼⠙⠆ ⠼⠊", back: "④ 9" },
        6: { src: "⑤ 10", braille: "⠰⠼⠑⠆ ⠼⠁⠚", back: "⑤ 10" },
      },
    },
    {
      no: 6,
      page: 2,
      bbox: { left: 12.5, top: 47.6, width: 33, height: 11.8 },
      blocks: [
        { type: "problem", html: "1보다 큰 두 실수 [sc]a[/sc], [sc]b[/sc] 가" },
        {
          type: "problem",
          html: "[sc]\\log_{a} b = 3[/sc], [sc]\\log_{3} \\dfrac{b}{a} = \\dfrac{1}{2}[/sc]",
        },
        {
          type: "problem",
          html: "을 만족시킬 때, [sc]\\log_{9} ab[/sc] 의 값은? [3점]",
        },
        {
          type: "choices",
          items: ["① 3/8", "② 1/2", "③ 5/8", "④ 3/4", "⑤ 7/8"],
        },
      ],
      lines: {
        1: {
          src: "1보다 큰 두 실수 a, b가",
          braille: "⠼⠁⠘⠊ ⠋⠵ ⠊⠍ ⠠⠕⠂⠠⠍ ⠁⠐ ⠃⠫",
          back: "1보다 큰 두 실수 a, b가",
        },
        2: {
          src: "log_a b = 3, log_3 (b/a) = 1/2",
          braille: "⠇⠕⠛ ⠁ ⠃ ⠶⠼⠉⠐ ⠇⠕⠛ ⠼⠉ ⠃⠌⠁ ⠶⠼⠁⠌⠼⠃",
          back: "log_a b = 3, log_3 (b/a) = 1/2",
        },
        3: {
          src: "을 만족시킬 때, log_9 ab 의 값은? [3점]",
          braille: "⠮ ⠑⠒⠨⠥⠁⠠⠕⠅⠕⠂ ⠠⠞⠐ ⠇⠕⠛ ⠼⠊ ⠁⠃ ⠺ ⠘⠣⠌⠵⠳ ⠦⠼⠉⠨⠎⠴",
          back: "을 만족시킬 때, log_9 ab 의 값은? [3점]",
        },
        4: { src: "① 3/8", braille: "⠰⠼⠁⠆ ⠼⠉⠌⠼⠓", back: "① 3/8" },
        5: { src: "② 1/2", braille: "⠰⠼⠃⠆ ⠼⠁⠌⠼⠃", back: "② 1/2" },
        6: { src: "③ 5/8", braille: "⠰⠼⠉⠆ ⠼⠑⠌⠼⠓", back: "③ 5/8" },
        7: { src: "④ 3/4", braille: "⠰⠼⠙⠆ ⠼⠉⠌⠼⠙", back: "④ 3/4" },
        8: { src: "⑤ 7/8", braille: "⠰⠼⠑⠆ ⠼⠛⠌⠼⠓", back: "⑤ 7/8" },
      },
    },
    {
      no: 7,
      page: 2,
      bbox: { left: 50, top: 16.4, width: 39, height: 29 },
      blocks: [
        {
          type: "problem",
          html: "두 곡선 [sc]y = x^{2}+3[/sc], [sc]y = -\\dfrac{1}{5}x^{2}+3[/sc] 과 직선 [sc]x = 2[/sc] 로",
        },
        { type: "problem", html: "둘러싸인 부분의 넓이는? [3점]" },
        {
          type: "choices",
          items: ["① 18/5", "② 7/2", "③ 17/5", "④ 33/10", "⑤ 16/5"],
        },
        {
          type: "graph",
          alt: "아래로 볼록한 곡선 y = x²+3과 위로 볼록한 곡선 y = −(1/5)x²+3이 점 (0, 3)에서 만나고, 두 곡선과 직선 x = 2로 둘러싸인 부분이 색칠되어 있다.",
        },
      ],
      lines: {
        1: {
          src: "두 곡선 y = x²+3, y = −(1/5)x²+3 과 직선 x = 2 로",
          braille: "⠊⠍ ⠈⠥⠁⠠⠎⠒ ⠽⠶⠭⠢⠼⠃⠬⠼⠉⠐ ⠽⠶⠔⠼⠁⠌⠼⠑⠭⠢⠼⠃⠬⠼⠉ ⠈⠧ ⠨⠕⠁⠠⠎⠒ ⠭⠶⠼⠃ ⠐⠥",
          back: "두 곡선 y = x²+3, y = −(1/5)x²+3 과 직선 x = 2 로",
        },
        2: {
          src: "둘러싸인 부분의 넓이는? [3점]",
          braille: "⠊⠯⠐⠎⠘⠁⠣⠕⠒ ⠘⠍⠘⠮⠺ ⠉⠎⠘⠕⠉⠵⠳ ⠦⠼⠉⠨⠎⠴",
          back: "둘러싸인 부분의 넓이는? [3점]",
        },
        3: { src: "① 18/5", braille: "⠰⠼⠁⠆ ⠼⠁⠓⠌⠼⠑", back: "① 18/5" },
        4: { src: "② 7/2", braille: "⠰⠼⠃⠆ ⠼⠛⠌⠼⠃", back: "② 7/2" },
        5: { src: "③ 17/5", braille: "⠰⠼⠉⠆ ⠼⠁⠛⠌⠼⠑", back: "③ 17/5" },
        6: { src: "④ 33/10", braille: "⠰⠼⠙⠆ ⠼⠉⠉⠌⠼⠁⠚", back: "④ 33/10" },
        7: { src: "⑤ 16/5", braille: "⠰⠼⠑⠆ ⠼⠁⠋⠌⠼⠑", back: "⑤ 16/5" },
        8: {
          src: "대체 텍스트: 아래로 볼록한 곡선 y = x²+3과 위로 볼록한 곡선 y = −(1/5)x²+3이 점 (0, 3)에서 만나고, 두 곡선과 직선 x = 2로 둘러싸인 부분이 색칠되어 있다.",
          braille: "⠊⠗⠰⠝ ⠓⠝⠄⠠⠪⠓⠪⠐ ⠣⠐⠗⠐⠥ ⠘⠥⠂⠐⠥⠁⠚⠒ ⠈⠥⠁⠠⠎⠒ ⠽⠶⠭⠢⠼⠃⠬⠼⠉",
          back: "대체 텍스트: 아래로 볼록한 곡선 y = x²+3과 위로 볼록한 곡선 y = −(1/5)x²+3이 점 (0, 3)에서 만나고, 두 곡선과 직선 x = 2로 둘러싸인 부분이 색칠되어 있다.",
        },
      },
    },
  ],
};
