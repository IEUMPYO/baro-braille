"use client";

import { useState } from "react";
import { mockProfile } from "@/lib/mockData";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    convertComplete: true,
    reviewRequest: false,
  });

  function handleSave() {
    alert("설정이 저장되었습니다.");
  }

  return (
    <div className="page-container">
      <h1 className="page-title">설정</h1>

      <section className="settings-section">
        <h2 className="section-title">계정 정보</h2>
        <div className="settings-card">
          <div className="settings-item">
            <label className="settings-label">기관</label>
            <span className="settings-value">{mockProfile.org}</span>
          </div>
          <div className="settings-item">
            <label className="settings-label">사용자</label>
            <span className="settings-value">{mockProfile.user}</span>
          </div>
          <div className="settings-item">
            <label className="settings-label">플랜</label>
            <span className="settings-value">{mockProfile.plan}</span>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="section-title">알림 설정</h2>
        <div className="settings-card">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={notifications.convertComplete}
              onChange={(e) =>
                setNotifications({
                  ...notifications,
                  convertComplete: e.target.checked,
                })
              }
            />
            <span>변환 완료 알림</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={notifications.reviewRequest}
              onChange={(e) =>
                setNotifications({
                  ...notifications,
                  reviewRequest: e.target.checked,
                })
              }
            />
            <span>검수 요청 알림</span>
          </label>
        </div>
      </section>

      <button className="btn-primary btn-save" onClick={handleSave}>
        저장
      </button>
    </div>
  );
}
