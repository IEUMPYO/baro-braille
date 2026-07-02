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
