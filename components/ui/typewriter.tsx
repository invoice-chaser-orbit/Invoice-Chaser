"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function Typewriter({
  text,
  className,
  charDelay = 0.035,
  cursor = true,
}: {
  text: string;
  className?: string;
  charDelay?: number;
  cursor?: boolean;
}) {
  return (
    <motion.span
      aria-label={text}
      className={cn("inline-block", className)}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: charDelay } } }}
    >
      <span aria-hidden="true">
        {text.split("").map((char, i) => (
          <motion.span key={i} variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
            {char === " " ? " " : char}
          </motion.span>
        ))}
      </span>
      {cursor && (
        <motion.span
          aria-hidden="true"
          className="ml-0.5 inline-block w-[2px] bg-current align-[-0.1em]"
          style={{ height: "0.9em" }}
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{
            delay: text.length * charDelay,
            duration: 0.9,
            times: [0, 0.5, 0.5, 1],
            repeat: Infinity,
          }}
        />
      )}
    </motion.span>
  );
}
