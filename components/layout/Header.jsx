"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const steps = [
  { href: "/", label: "문서 업로드" },
  { href: "/proofread", label: "교열" },
  { href: "/braille", label: "점역" },
  { href: "/output", label: "출력" },
];

export default function Header() {
  const pathname = usePathname();
  const currentIndex = steps.findIndex((step) => step.href === pathname);

  return (
    <header className="app">
      <Link className="logo" href="/" aria-label="바로점자 홈으로">
        바로점자
      </Link>
      <nav className="steps" aria-label="진행 단계">
        {steps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isDone = currentIndex > -1 && index < currentIndex;
          const className = `step${isCurrent ? " current" : ""}${
            isDone ? " done" : ""
          }`;

          return (
            <span key={step.href} style={{ display: "contents" }}>
              {index > 0 && <span className="step-arrow">›</span>}
              <Link
                className={className}
                href={step.href}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span className="num">{index + 1}</span> {step.label}
              </Link>
            </span>
          );
        })}
      </nav>
    </header>
  );
}
