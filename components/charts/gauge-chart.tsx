"use client";

import { useEffect, useState } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { useRef } from "react";

export function GaugeChart({
  value,
  label = "Efficiency",
}: {
  value: number;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 80, damping: 20 });
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);
  useEffect(() => spring.on("change", (v) => setPct(v)), [spring]);

  const radius = 90;
  const cx = 110;
  const cy = 110;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div ref={ref} className="flex flex-col items-center">
      <svg viewBox="0 0 220 130" className="w-full max-w-[260px]">
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth={18}
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#8B5CF6"
          strokeWidth={18}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <p className="-mt-6 text-h2 text-primary-500 tabular-nums">
        {(pct * 100).toFixed(2)}%
      </p>
      <p className="mt-1 text-caption text-neutral-500">{label}</p>
    </div>
  );
}
