"use client";

import { useScroll, useTransform, type MotionValue } from "motion/react";
import * as m from "motion/react-m";
import { useRef } from "react";

/** A heading whose words light up left to right as it scrolls into view. */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.7"] });
  const words = text.split(" ");
  return (
    <h2 ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <Word key={i} p={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>{w}</Word>
        ))}
      </span>
    </h2>
  );
}

function Word({ p, range, children }: { p: MotionValue<number>; range: [number, number]; children: string }) {
  const opacity = useTransform(p, range, [0.18, 1]);
  return <m.span style={{ opacity }}>{children} </m.span>;
}
