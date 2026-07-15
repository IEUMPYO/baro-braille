import { FileText, Printer, CheckCircle2 } from "lucide-react";
import { stageCopy, stageOrder } from "@/lib/mockData";
import "./ConversionSteps.css";

/**
 * 브레일 점 애니메이션 컴포넌트 (내부용)
 */
function BrailleDots({ small = false }) {
  return (
    <span
      className={small ? "braille-dots braille-dots-small" : "braille-dots"}
      aria-hidden="true"
    >
      {Array.from({ length: 9 }).map((_, index) => (
        <span key={index} />
      ))}
    </span>
  );
}

/**
 * 단계 아이콘 컴포넌트 (내부용)
 */
function StepIcon({ icon: Icon, label, state, activeBraille = false }) {
  return (
    <div className="step">
      <div className={`step-icon ${state}`}>
        {state === "done" ? (
          <CheckCircle2 size={34} strokeWidth={2.1} />
        ) : activeBraille ? (
          <BrailleDots small />
        ) : (
          <Icon size={34} strokeWidth={1.8} />
        )}
      </div>
      <span>{label}</span>
    </div>
  );
}

/**
 * 점역 변환 진행 단계 표시
 * @param {Object} props
 * @param {string} props.status - 현재 상태 ("idle" | "recognizing" | "converting" | "complete")
 * @param {number} props.progress - 진행률 (0~100)
 */
export default function ConversionSteps({ status, progress }) {
  const currentStageIndex = stageOrder.indexOf(status);

  function getStageState(index) {
    if (status === "idle") {
      return "idle";
    }
    if (index < currentStageIndex || status === "complete") {
      return "done";
    }
    if (index === currentStageIndex) {
      return "active";
    }
    return "idle";
  }

  return (
    <section className="stage-card">
      <h2>변환 진행 단계</h2>
      <div className="steps">
        <StepIcon icon={FileText} label="문서 인식" state={getStageState(0)} />
        <div className="step-arrow" aria-hidden="true">
          →
        </div>
        <StepIcon
          icon={FileText}
          label="점역 변환"
          state={getStageState(1)}
          activeBraille={status === "converting"}
        />
        <div className="step-arrow" aria-hidden="true">
          →
        </div>
        <StepIcon icon={Printer} label="결과 출력" state={getStageState(2)} />
      </div>
      <div className="progress-track" aria-label="변환 진행률">
        <span style={{ width: `${progress}%` }} />
      </div>
      <p className="stage-copy">{stageCopy[status]}</p>
    </section>
  );
}
