"use client";

import Header from "./Header";
import { ToastProvider } from "./ToastContext";

export default function LayoutClient({ children }) {
  return (
    <ToastProvider>
      <Header />
      <main>{children}</main>
    </ToastProvider>
  );
}
