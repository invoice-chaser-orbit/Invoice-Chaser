"use client";

import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

function CountUp({
  value,
  format,
}: {
  value: number;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  useEffect(() => spring.on("change", (v) => setDisplay(v)), [spring]);

  return <span ref={ref}>{format ? format(display) : Math.round(display)}</span>;
}

export function KpiCard({
  label,
  value,
  format,
  trend,
  caption,
  icon,
  className,
}: {
  label: string;
  value: number;
  format?: (n: number) => string;
  trend?: { direction: "up" | "down"; text: string; good?: boolean };
  caption?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-100 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 text-primary-500">
            {icon}
          </span>
        )}
        <p className="text-caption text-neutral-500 uppercase">{label}</p>
      </div>
      <p className="mt-4 text-h2 text-neutral-900 tabular-nums">
        <CountUp value={value} format={format} />
      </p>
      {trend && (
        <p
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-caption",
            trend.good === false ? "text-danger-text" : "text-success-text",
          )}
        >
          {trend.direction === "up" ? (
            <ChevronUp size={14} strokeWidth={2} />
          ) : (
            <ChevronDown size={14} strokeWidth={2} />
          )}
          {trend.text}
        </p>
      )}
      {caption && !trend && (
        <p className="mt-2 text-caption text-neutral-500">{caption}</p>
      )}
    </div>
  );
}

export function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
      }}
    >
      {children}
    </motion.div>
  );
}
