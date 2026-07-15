export default function ProblemNavigation({ currentIndex, total, onNavigate }) {
  return (
    <div className="problem-navigation">
      <h4>문제 목록</h4>
      <div className="problem-list">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            className={`problem-item ${i === currentIndex ? "active" : ""}`}
            onClick={() => onNavigate(i)}
          >
            #{i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
