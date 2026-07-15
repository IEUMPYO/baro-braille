"use client";

import { HelpCircle, Bell, UserRound } from "lucide-react";

export default function Header({ onOpenModal }) {
  function handleNotificationClick() {
    console.log("알림 클릭 (Mock)");
  }

  return (
    <header className="header">
      <div className="header-left">
        <div className="braille-dots braille-dots-small" aria-hidden="true">
          {Array.from({ length: 9 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
        <div>
          <div className="header-title">바로점자</div>
          <div className="header-subtitle">학습자료 점근성 변환 서비스</div>
        </div>
      </div>

      <div className="header-right">
        <button
          type="button"
          className="header-icon-btn"
          onClick={() => onOpenModal && onOpenModal("guide")}
          aria-label="도움말"
        >
          <HelpCircle size={22} strokeWidth={1.8} />
        </button>

        <button
          type="button"
          className="header-icon-btn"
          onClick={handleNotificationClick}
          aria-label="알림"
        >
          <Bell size={22} strokeWidth={1.8} />
          <span className="notification-badge">3</span>
        </button>

        <button
          type="button"
          className="profile-btn"
          onClick={() => onOpenModal && onOpenModal("profile")}
          aria-label="프로필"
        >
          <UserRound size={20} strokeWidth={1.8} />
          <span>홍길동 선생님</span>
        </button>
      </div>
    </header>
  );
}
