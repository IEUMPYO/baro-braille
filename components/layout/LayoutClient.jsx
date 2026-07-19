"use client";

import Header from "./Header";
import { ToastProvider } from "./ToastContext";
import { WorkflowProvider } from "@/lib/store";

export default function LayoutClient({ children }) {
  return (
    <WorkflowProvider>
      <ToastProvider>
        <Header />
        <main>{children}</main>
      </ToastProvider>
    </WorkflowProvider>
  );
}
