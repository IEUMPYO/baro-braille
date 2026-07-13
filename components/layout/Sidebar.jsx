"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Upload,
  FileText,
  CheckSquare,
  Archive,
  Settings,
} from "lucide-react";

function BrailleDots() {
  return (
    <span className="braille-dots" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, index) => (
        <span key={index} />
      ))}
    </span>
  );
}

const navItems = [
  { href: "/", label: "대시보드", icon: Home },
  { href: "/upload", label: "업로드/변환", icon: Upload },
  { href: "/history", label: "변환 내역", icon: FileText },
  { href: "/review", label: "검수 작업", icon: CheckSquare },
  { href: "/delivery", label: "제공 내역", icon: Archive },
  { href: "/settings", label: "설정", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar" role="navigation" aria-label="주 메뉴">
      <div className="sidebar-header">
        <Link className="brand" href="/" aria-label="바로점자 홈">
          <BrailleDots />
          <span>바로점자</span>
        </Link>
        <div className="header-subtitle" style={{ marginTop: "8px" }}>
          학습자료 점근성 변환 서비스
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
