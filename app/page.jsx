"use client";

import { mockRecentActivity } from "@/lib/mockData";
import { FileText, CheckCircle2, Clock } from "lucide-react";

function StatCard({ label, value, color = "blue" }) {
  return (
    <div className="stat-card">
      <div className={`stat-value stat-${color}`}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function ActivityItem({ item }) {
  function getStatusIcon() {
    if (item.status === "completed") {
      return <CheckCircle2 size={18} strokeWidth={2} />;
    }
    return <Clock size={18} strokeWidth={2} />;
  }

  function getStatusText() {
    if (item.status === "completed") {
      return "변환 완료";
    }
    return "진행 중";
  }

  const statusClass =
    item.status === "completed" ? "status-completed" : "status-processing";

  return (
    <div className="activity-item">
      <div className="activity-icon">
        <FileText size={20} strokeWidth={1.8} />
      </div>
      <div className="activity-info">
        <div className="activity-header">
          <span className="activity-filename">{item.fileName}</span>
          <span className={`activity-status ${statusClass}`}>
            {getStatusIcon()}
            {getStatusText()}
          </span>
        </div>
        <span className="activity-time">{item.time}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">대시보드</h1>

      <div className="stats-grid">
        <StatCard label="전체 변환" value={42} color="blue" />
        <StatCard label="완료" value={28} color="green" />
        <StatCard label="진행 중" value={14} color="blue" />
      </div>

      <section className="recent-activity-section">
        <h2 className="section-title">최근 활동</h2>
        <div className="activity-list">
          {mockRecentActivity.map((item) => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
