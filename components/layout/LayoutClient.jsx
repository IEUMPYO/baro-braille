"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { mockProfile } from "@/lib/mockData";

function Modal({ type, onClose }) {
  const isGuide = type === "guide";

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={isGuide ? "사용 가이드" : "내 정보"}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="닫기"
        >
          <X size={22} />
        </button>

        {isGuide ? (
          <>
            <h2>사용 가이드</h2>
            <ol className="guide-list">
              <li>PDF, JPG, PNG 형식의 수학 문제 파일을 업로드합니다.</li>
              <li>문서 인식과 점역 변환 단계가 순서대로 진행됩니다.</li>
              <li>생성된 BRF, 전자점자, PDF 파일을 다운로드합니다.</li>
            </ol>
          </>
        ) : (
          <>
            <h2>내 정보</h2>
            <dl className="profile-list">
              <div>
                <dt>기관</dt>
                <dd>{mockProfile.org}</dd>
              </div>
              <div>
                <dt>사용자</dt>
                <dd>{mockProfile.user}</dd>
              </div>
              <div>
                <dt>플랜</dt>
                <dd>{mockProfile.plan}</dd>
              </div>
              <div>
                <dt>사용량</dt>
                <dd>{mockProfile.quota}</dd>
              </div>
            </dl>
          </>
        )}
      </section>
    </div>
  );
}

export default function LayoutClient({ children }) {
  const [openModal, setOpenModal] = useState(null);

  useEffect(() => {
    if (!openModal) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpenModal(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openModal]);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Header onOpenModal={setOpenModal} />
        <main className="main-content">{children}</main>
      </div>
      {openModal ? (
        <Modal type={openModal} onClose={() => setOpenModal(null)} />
      ) : null}
    </div>
  );
}
