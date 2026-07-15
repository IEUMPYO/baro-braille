"use client";

import { useState } from "react";
import { mockHistory, mockFiles } from "@/lib/mockData";
import { downloadFile } from "@/lib/utils";
import { useToast } from "@/components/layout/ToastContext";
import { FileText, Image, Clock, CheckCircle2, Search } from "lucide-react";

function HistoryItem({ item, onDownload }) {
  function getFileIcon(fileType) {
    if (fileType === "image") {
      return <Image size={34} strokeWidth={1.8} />;
    }
    return <FileText size={34} strokeWidth={1.8} />;
  }

  function getStatusBadge(status) {
    if (status === "completed") {
      return (
        <span className="status-badge status-completed">
          <CheckCircle2 size={14} />
          완료
        </span>
      );
    }
    return (
      <span className="status-badge status-processing">
        <Clock size={14} />
        진행 중
      </span>
    );
  }

  return (
    <div className="history-item">
      <div className="history-item-left">
        <div className="history-file-icon">{getFileIcon(item.fileType)}</div>
        <div className="history-file-info">
          <h3 className="history-file-name">{item.fileName}</h3>
          <p className="history-file-meta">
            {item.problemCount > 0 ? `${item.problemCount}문제` : "분석 중"}
          </p>
        </div>
      </div>

      <div className="history-item-center">{getStatusBadge(item.status)}</div>

      <div className="history-item-right">
        <span className="history-date">{item.date}</span>
        {item.status === "completed" && (
          <button
            className="btn-download"
            onClick={() => onDownload(item)}
            aria-label="파일 다운로드"
          >
            다운로드
          </button>
        )}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();

  const filteredHistory = mockHistory
    .filter((item) => {
      if (filter === "completed") return item.status === "completed";
      if (filter === "processing") return item.status === "processing";
      return true;
    })
    .filter((item) =>
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  function handleDownload(item) {
    // Mock: 첫 번째 파일 자동 다운로드 (BRF)
    const file = mockFiles[0];
    const downloadData = {
      fileName: item.fileName.replace(/\.[^.]+$/, file.ext),
      content: file.content,
      mime: file.mime,
    };
    downloadFile(downloadData);
    showToast("파일 다운로드를 시작했습니다.");
  }

  return (
    <div className="page-container">
      <h1 className="page-title">변환 내역</h1>

      <div className="history-controls">
        <div className="filter-tabs">
          <button
            className={filter === "all" ? "filter-tab active" : "filter-tab"}
            onClick={() => setFilter("all")}
            aria-pressed={filter === "all"}
          >
            전체
          </button>
          <button
            className={
              filter === "completed" ? "filter-tab active" : "filter-tab"
            }
            onClick={() => setFilter("completed")}
            aria-pressed={filter === "completed"}
          >
            완료
          </button>
          <button
            className={
              filter === "processing" ? "filter-tab active" : "filter-tab"
            }
            onClick={() => setFilter("processing")}
            aria-pressed={filter === "processing"}
          >
            진행 중
          </button>
        </div>

        <div className="search-box">
          <Search size={18} strokeWidth={2} />
          <input
            type="search"
            placeholder="파일명 검색"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="파일명 검색"
          />
        </div>
      </div>

      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} strokeWidth={1.5} />
            <p>변환 내역이 없습니다.</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              onDownload={handleDownload}
            />
          ))
        )}
      </div>
    </div>
  );
}
