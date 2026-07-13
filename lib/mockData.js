import { FileArchive, FileText } from "lucide-react";

const mockGraphSvg = (
  <svg
    className="graph"
    viewBox="0 0 520 230"
    role="img"
    aria-label="함수 그래프"
  >
    <defs>
      <marker
        id="arrow"
        markerHeight="8"
        markerWidth="8"
        orient="auto"
        refX="4"
        refY="4"
      >
        <path d="M0,0 L8,4 L0,8 Z" fill="#111827" />
      </marker>
    </defs>
    <line
      x1="88"
      y1="178"
      x2="452"
      y2="178"
      stroke="#111827"
      strokeWidth="2"
      markerEnd="url(#arrow)"
    />
    <line
      x1="150"
      y1="198"
      x2="150"
      y2="44"
      stroke="#111827"
      strokeWidth="2"
      markerEnd="url(#arrow)"
    />
    <path
      d="M150 112 C210 42 290 36 358 94 C392 122 418 154 430 178"
      fill="none"
      stroke="#2f343d"
      strokeLinecap="round"
      strokeWidth="3"
    />
    <circle cx="150" cy="112" r="5" fill="#111827" />
    <circle cx="430" cy="178" r="5" fill="#111827" />
    <text x="122" y="114" className="graph-text">
      2
    </text>
    <text x="414" y="205" className="graph-text">
      3
    </text>
    <text x="128" y="205" className="graph-text">
      O
    </text>
    <text x="129" y="58" className="graph-text">
      y
    </text>
    <text x="462" y="186" className="graph-text">
      x
    </text>
    <text x="328" y="80" className="graph-label">
      y = f(x)
    </text>
  </svg>
);

export const mockProblems = [
  {
    id: 1,
    text: "함수 f(x) = x² - 2x + 3의 최솟값을 구하시오.",
    choices: ["1", "2", "3", "4", "5"],
    graph: null,
  },
  {
    id: 2,
    text: "다음 그림과 같이 함수 y = f(x)의 그래프가 두 점 (0, 2), (3, 0)을 지날 때, 보기 중 f(1)의 값으로 옳은 것은?",
    choices: ["1/2", "1", "3/2", "2", "5/2"],
    graph: mockGraphSvg,
  },
  {
    id: 3,
    text: "방정식 2x + 5 = 13의 해를 구하시오.",
    choices: ["2", "3", "4", "5", "6"],
    graph: null,
  },
  {
    id: 4,
    text: "삼각형의 내각의 합은 몇 도인가?",
    choices: ["90°", "120°", "180°", "270°", "360°"],
    graph: null,
  },
  {
    id: 5,
    text: "원의 넓이를 구하는 공식은? (반지름 r)",
    choices: ["πr", "2πr", "πr²", "2πr²", "πr³"],
    graph: null,
  },
];

export const mockProblem = mockProblems[1]; // 그래프가 있는 문제를 기본으로

export const mockFiles = [
  {
    label: "BRF",
    ext: ".brf",
    tone: "mint",
    icon: FileText,
    fileName: "baro-braille-math-14.brf",
    mime: "text/plain;charset=utf-8",
    content:
      "BARO BRAILLE MOCK BRF\n\n문항 14\n함수 y=f(x)의 그래프가 (0,2), (3,0)을 지날 때 f(1)의 값을 구하는 문제입니다.\n\n정답 후보: 1/2, 1, 3/2, 2, 5/2\n",
  },
  {
    label: "전자점자",
    ext: ".zip",
    tone: "violet",
    icon: FileArchive,
    fileName: "baro-braille-e-braille.zip",
    mime: "application/zip",
    content:
      "MOCK ZIP PACKAGE\n\n실제 서비스에서는 전자점자 패키지 파일이 생성됩니다.\n이 파일은 프로토타입 다운로드 흐름 확인용 mock 데이터입니다.\n",
  },
  {
    label: "PDF",
    ext: ".pdf",
    tone: "rose",
    icon: FileText,
    fileName: "baro-braille-result.pdf",
    mime: "application/pdf",
    content:
      "%PDF-1.4\n% Baro Braille mock PDF\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 0 >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n",
  },
];

export const mockProfile = {
  org: "서울특별시교육청",
  user: "수능 수학 점역 담당자",
  plan: "기관 베타",
  quota: "이번 달 18 / 50건",
};

export const stageCopy = {
  idle: "업로드할 문서를 기다리고 있습니다.",
  recognizing: "문서에서 수학 문항과 그래프를 인식하고 있습니다.",
  converting: "인식된 수식을 점자 규칙에 맞게 변환하고 있습니다.",
  complete: "BRF, 전자점자, PDF 결과 파일이 생성되었습니다.",
};

export const stageOrder = ["recognizing", "converting", "complete"];
