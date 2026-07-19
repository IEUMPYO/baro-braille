"use client";

// 워크플로우 상태 저장소 (ADR-010): 단계(업로드→교열→점역→출력) 간 공유 상태를
// React Context에 두고 sessionStorage에 백업한다. 정적 빌드라 서버 세션이 없으므로
// 새로고침에도 작업이 보존되도록 한다. SSR 안전: 마운트 후에만 sessionStorage 접근.
import { createContext, useContext, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "baro-braille-workflow";

const INITIAL_STATE = {
  doc: null, // 업로드·변환된 문서 (convertDocument 결과)
  proofread: {}, // 교열 결과: { [problemNo]: { blocks } } override
  braille: {}, // 편집 중 점자: { [problemNo]: { [lineNo]: { cells, back, modified } } }
};

const WorkflowContext = createContext(null);

export function WorkflowProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);
  const hydrated = useRef(false);

  // 마운트 후 sessionStorage에서 복원 (SSR 안전)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {
      // 파싱 실패 시 초기 상태 유지
    }
    hydrated.current = true;
  }, []);

  // 상태 변경 시 백업 (복원 완료 전에는 건너뜀)
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 저장 실패는 무시 (용량 초과 등)
    }
  }, [state]);

  const setDoc = (doc) => setState((s) => ({ ...s, doc }));
  const setProofread = (problemNo, blocks) =>
    setState((s) => ({
      ...s,
      proofread: { ...s.proofread, [problemNo]: { blocks } },
    }));
  const setBrailleLine = (problemNo, lineNo, data) =>
    setState((s) => ({
      ...s,
      braille: {
        ...s.braille,
        [problemNo]: { ...s.braille[problemNo], [lineNo]: data },
      },
    }));
  const reset = () => setState(INITIAL_STATE);

  const value = { state, setDoc, setProofread, setBrailleLine, reset };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) {
    throw new Error(
      "useWorkflow는 WorkflowProvider 내부에서만 사용할 수 있습니다.",
    );
  }
  return ctx;
}
