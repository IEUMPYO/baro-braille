export default function ProblemPreview({ problem }) {
  return (
    <div className="problem-preview">
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
  );
}
