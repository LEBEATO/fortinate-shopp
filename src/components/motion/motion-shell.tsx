"use client";

import { useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function MotionShell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add(
      {
        desktop: "(min-width: 768px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { desktop, reduceMotion } = context.conditions as {
          desktop: boolean;
          reduceMotion: boolean;
        };
        const animated = "[data-motion='eyebrow'], [data-motion='title'], [data-motion='copy'], [data-motion='panel'], [data-motion-card]";

        if (reduceMotion) {
          gsap.set(animated, { clearProps: "all" });
          return;
        }

        const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        timeline
          .from("[data-motion='header']", { autoAlpha: 0, y: -14, duration: 0.38 })
          .from("[data-motion='eyebrow']", { autoAlpha: 0, y: 12, duration: 0.34 })
          .from("[data-motion='title']", { autoAlpha: 0, x: desktop ? -28 : -14, duration: 0.5 }, "-=0.2")
          .from("[data-motion='copy']", { autoAlpha: 0, y: 14, duration: 0.4 }, "-=0.27")
          .from("[data-motion='panel']", { autoAlpha: 0, y: 20, scale: 0.99, duration: 0.46 }, "-=0.2");

        const cards = gsap.utils.toArray<HTMLElement>("[data-motion-card]");
        if (cards.length) {
          gsap.from(cards, {
            autoAlpha: 0,
            y: desktop ? 28 : 18,
            scale: 0.985,
            duration: 0.46,
            ease: "power3.out",
            stagger: { amount: Math.min(0.42, cards.length * 0.035), from: "start" },
            delay: 0.18,
            clearProps: "transform,opacity,visibility",
          });
        }
      },
    );

    return () => media.revert();
  }, { dependencies: [pathname], revertOnUpdate: true, scope: root });

  return <div ref={root}>{children}</div>;
}
