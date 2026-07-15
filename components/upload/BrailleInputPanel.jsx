export default function BrailleInputPanel({ brailleText, onTextChange }) {
  function handleKeyClick(key) {
    // Mock: 토스트 메시지만 표시
    console.log("Braille key clicked:", key);
  }

  return (
    <div className="text-panel">
      <div className="panel-header">
        <h3>점자 입력</h3>
      </div>
      <div className="panel-content">
        <div className="braille-display">
          {brailleText || "점자 텍스트 없음"}
        </div>
      </div>
      <div className="panel-footer">
        <BrailleKeyboard onKeyClick={handleKeyClick} />
      </div>
    </div>
  );
}

function BrailleKeyboard({ onKeyClick }) {
  const keys = ["⠁", "⠃", "⠉", "⠙", "⠑", "⠋", "⠛", "⠓"];

  return (
    <div className="braille-keyboard">
      {keys.map((key, index) => (
        <button
          key={index}
          className="braille-key"
          onClick={() => onKeyClick(key)}
          aria-label={`점자 키 ${key}`}
        >
          {key}
        </button>
      ))}
    </div>
  );
}
