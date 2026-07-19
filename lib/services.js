// 비즈니스 로직 (mock → API 전환 지점).
// 향후 Spring Boot 매핑:
//   convertDocument(file) → POST /api/braille/convert
//   backTranslate(cells)  → POST /api/braille/back-translate
// 전환 시 아래 mock 본문을 fetch로만 교체(시그니처 유지).
import { mockDoc } from "./mockData";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 업로드 문서를 점역 가능한 문서 구조로 변환 (mock)
 * @param {File} [file] - 업로드된 파일 (mock 단계에서는 사용 안 함)
 * @returns {Promise<Object>} 문서(mockDoc 형식: pages/problems)
 */
export async function convertDocument(file) {
  await delay(1200);
  return mockDoc;
}

/**
 * 편집된 점자 셀을 줄 단위로 역점역 재요청 (mock)
 * @param {string[]} brailleCells - 유니코드 점자 셀 배열
 * @returns {Promise<{back: string}>} 역점역 텍스트
 */
export async function backTranslate(brailleCells) {
  await delay(600);
  return { back: brailleCells.join("") };
}
