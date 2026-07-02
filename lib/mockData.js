import { FileArchive, FileText } from "lucide-react";

export const mockProblem = {
  number: 14,
  points: 3,
  lines: [
    <>
      다음 그림과 같이 함수 <em>y = f(x)</em>의 그래프가
    </>,
    <>
      두 점 <span>(0, 2)</span>, <span>(3, 0)</span>을 지날 때, 보기 중
    </>,
    <>
      <em>f(1)</em>의 값으로 옳은 것은?
    </>,
  ],
  answers: ["1/2", "1", "3/2", "2", "5/2"],
};

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
