"use client";

import { mockProvisions } from "@/lib/mockData";
import { FileText, Download } from "lucide-react";

function ProvisionItem({ item }) {
  function handleDownload() {
    alert(`${item.fileName} 다운로드 (Mock)`);
  }

  return (
    <div className="provision-item">
      <div className="provision-item-left">
        <div className="provision-file-icon">
          <FileText size={34} strokeWidth={1.8} />
        </div>
        <div className="provision-file-info">
          <h3 className="provision-file-name">{item.fileName}</h3>
          <p className="provision-recipient">수신자: {item.recipient}</p>
        </div>
      </div>

      <div className="provision-item-right">
        <span className="provision-date">{item.date}</span>
        <button
          className="btn-provision-download"
          onClick={handleDownload}
          aria-label="파일 다운로드"
        >
          <Download size={18} strokeWidth={2} />
          다운로드
        </button>
      </div>
    </div>
  );
}

export default function ProvisionPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">제공 내역</h1>
      <p className="page-description">
        학생 또는 기관에 제공한 점역 자료 목록입니다.
      </p>

      <div className="provision-list">
        {mockProvisions.map((item) => (
          <ProvisionItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
