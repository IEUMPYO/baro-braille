import { mockProblem, mockFiles } from "./mockData";

/**
 * 파일을 점자로 변환하는 Mock 서비스
 * @param {File} file - 업로드된 파일
 * @param {Object} callbacks - 진행 상태 콜백
 * @param {Function} callbacks.onProgress - 진행률 업데이트 (percent: number)
 * @param {Function} callbacks.onRecognized - 문제 인식 완료 (problem: object)
 * @param {Function} callbacks.onConverting - 점역 변환 시작
 * @param {Function} callbacks.onComplete - 변환 완료 (files: array)
 * @returns {Function} cleanup 함수 (타이머 정리용)
 */
export function convertToBraille(file, callbacks) {
  const timers = [
    window.setTimeout(() => {
      callbacks.onProgress(42);
      callbacks.onRecognized(mockProblem);
    }, 700),
    window.setTimeout(() => {
      callbacks.onConverting();
      callbacks.onProgress(72);
    }, 1500),
    window.setTimeout(() => {
      callbacks.onComplete(mockFiles);
      callbacks.onProgress(100);
    }, 2400),
  ];

  return () => {
    timers.forEach(window.clearTimeout);
  };
}
