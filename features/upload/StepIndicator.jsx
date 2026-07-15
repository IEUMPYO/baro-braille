export default function StepIndicator({ currentStep }) {
  const steps = ["자료 업로드", "AI 분석 결과", "검수 화면"];

  return (
    <div className="step-indicator">
      {steps.map((label, index) => (
        <div
          key={index}
          className={`step ${index + 1 <= currentStep ? "active" : ""}`}
        >
          <span className="step-number">{index + 1}</span>
          <span className="step-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
