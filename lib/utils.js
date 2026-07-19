// 유니코드 점자(U+2800 블록) 인코딩 유틸.
// 6점 점자: 점 번호(1~6) → 비트 매핑. 셀당 1문자.

/** 점 번호 → 비트값 */
export const DOT_BIT = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32 };

/**
 * 비트 조합을 유니코드 점자 셀 문자로 변환
 * @param {number} bits - 점 비트 합(0~63)
 * @returns {string} 유니코드 점자 문자
 */
export function cellFromBits(bits) {
  return String.fromCharCode(0x2800 + bits);
}

/**
 * 유니코드 점자 셀 문자에서 점 비트 조합 추출
 * @param {string} ch - 유니코드 점자 문자
 * @returns {number} 점 비트 합(0~63)
 */
export function bitsFromCell(ch) {
  return ch.charCodeAt(0) - 0x2800;
}

/**
 * 특정 점(1~6)을 토글한 비트 조합 반환
 * @param {number} bits - 현재 점 비트 합
 * @param {number} dot - 토글할 점 번호(1~6)
 * @returns {number} 토글된 점 비트 합
 */
export function toggleDot(bits, dot) {
  return bits ^ DOT_BIT[dot];
}

// 유니코드 점자 → ASCII Braille (북미 표준, Braille ASCII / BRF).
// 인덱스 = 6점 비트값(0~63), 값 = 대응 ASCII 문자. BRF·BRL 파일 생성에 사용.
const BRAILLE_ASCII =
  " A1B'K2L@CIF/MSP\"E3H9O6R^DJG>NTQ,*5<-U8V.%[$+X!&;:4\\0Z7(_?W]#Y)=";

/**
 * 유니코드 점자 셀 하나를 ASCII Braille 문자로 변환
 * @param {string} ch - 유니코드 점자 문자(또는 공백 등 점자 외 문자)
 * @returns {string} ASCII Braille 문자(점자 외 문자는 그대로 반환)
 */
export function cellToAscii(ch) {
  const code = ch.charCodeAt(0);
  if (code >= 0x2800 && code <= 0x283f) return BRAILLE_ASCII[code - 0x2800];
  return ch; // 공백 등 점자 범위 밖 문자는 그대로
}

/**
 * 유니코드 점자 문자열을 ASCII Braille 문자열로 변환
 * @param {string} text - 유니코드 점자 문자열
 * @returns {string} ASCII Braille 문자열
 */
export function brailleToAscii(text) {
  return Array.from(text).map(cellToAscii).join("");
}

/**
 * 파일을 다운로드한다
 * @param {Object} file - 다운로드할 파일 객체
 * @param {string} file.fileName - 파일명
 * @param {string} file.content - 파일 내용
 * @param {string} file.mime - MIME 타입
 */
export function downloadFile(file) {
  const blob = new Blob([file.content], { type: file.mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
