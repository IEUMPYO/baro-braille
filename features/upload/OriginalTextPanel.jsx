export default function OriginalTextPanel({ problem }) {
  return (
    <div className="text-panel">
      <div className="panel-header">
        <h3>원본 텍스트 (문항)</h3>
        <span className="page-indicator">1 / 4</span>
      </div>
      <div className="panel-content">
        <div className="problem-text">{problem.text}</div>
        {problem.choices && (
          <div className="problem-choices">
            {problem.choices.map((choice, index) => (
              <div key={index} className="choice-item">
                <span className="choice-number">{index + 1}</span>
                <span className="choice-text">{choice}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="panel-footer">
        <button className="btn-text">저장</button>
      </div>
    </div>
  );
}
