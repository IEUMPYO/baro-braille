import "./globals.css";
import LayoutClient from "@/components/layout/LayoutClient";

export const metadata = {
  title: "바로점자",
  description: "수능 수학 문제를 점자로 변환하는 AI SaaS 프로토타입",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
