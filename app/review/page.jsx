"use client";

import { mockReviewQueue } from "@/lib/mockData";
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";

function ReviewItem({ item }) {
  function getStatusBadge() {
    if (item.status === "completed") {
      return (
        <span className="review-badge review-completed">
          <CheckCircle2 size={14} />
          검수 완료
        </span>
      );
    }
    if (item.status === "in_progress") {
      return (
        <span className="review-badge review-in-progress">
          <Clock size={14} />
          검수 중
        </span>
      );
    }
    return (
      <span className="review-badge review-pending">
        <AlertCircle size={14} />
        검수 대기
      </span>
    );
  }

  function getActionButton() {
    if (item.status === "completed") {
      return null;
    }
    if (item.status === "in_progress") {
      return (
        <button
          className="btn-review-action"
          onClick={() => alert("검수 화면으로 이동 (Mock)")}
        >
          계속하기
        </button>
      );
    }
    return (
      <button
        className="btn-review-action"
        onClick={() => alert("검수 화면으로 이동 (Mock)")}
      >
        검수 시작
      </button>
    );
  }

  return (
    <div className="review-item">
      <div className="review-item-left">
        <div className="review-file-icon">
          <FileText size={34} strokeWidth={1.8} />
        </div>
        <div className="review-file-info">
          <h3 className="review-file-name">{item.fileName}</h3>
          <p className="review-file-meta">{item.problemCount}문제</p>
        </div>
      </div>

      <div className="review-item-center">{getStatusBadge()}</div>

      <div className="review-item-right">{getActionButton()}</div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">검수 작업</h1>
      <p className="page-description">
        변환 결과를 검수하고 승인할 파일 목록입니다.
      </p>

      <div className="review-list">
        {mockReviewQueue.map((item) => (
          <ReviewItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
