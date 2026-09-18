"use client";

import { useRef, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function MotionShell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

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
        const pageElements = "[data-motion='eyebrow'], [data-motion='title'], [data-motion='copy'], [data-motion='panel']";

        if (reduceMotion) {
          gsap.set(pageElements, { clearProps: "all" });
        }

        if (!reduceMotion) {
          const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
          timeline
            .from("[data-motion='header']", { autoAlpha: 0, y: -14, duration: 0.38 })
            .from("[data-motion='eyebrow']", { autoAlpha: 0, y: 12, duration: 0.34 })
            .from("[data-motion='title']", { autoAlpha: 0, x: desktop ? -28 : -14, duration: 0.5 }, "-=0.2")
            .from("[data-motion='copy']", { autoAlpha: 0, y: 14, duration: 0.4 }, "-=0.27")
            .from("[data-motion='panel']", { autoAlpha: 0, y: 20, scale: 0.99, duration: 0.46 }, "-=0.2");
        }

        const cards = gsap.utils.toArray<HTMLElement>("[data-motion-card]");
        if (cards.length) {
          const side = (element: HTMLElement, fallbackIndex: number) => {
            const cardIndex = Number(element.dataset.cardIndex ?? fallbackIndex);
            return cardIndex % 2 === 0 ? -1 : 1;
          };

          gsap.set(cards, {
            autoAlpha: 0,
            x: (index, element: HTMLElement) => side(element, index) * (reduceMotion ? 40 : desktop ? 150 : 105),
            y: reduceMotion ? 0 : desktop ? 18 : 12,
            scale: reduceMotion ? 1 : desktop ? 0.95 : 0.97,
            rotationY: (index, element: HTMLElement) => side(element, index) * (reduceMotion ? 0 : desktop ? -8 : -5),
            rotationZ: (index, element: HTMLElement) => side(element, index) * (reduceMotion ? 0 : desktop ? -1.5 : -2),
            transformOrigin: "center center",
          });

          ScrollTrigger.batch(cards, {
            start: "top 82%",
            once: true,
            interval: 0.12,
            batchMax: desktop ? 2 : 1,
            onEnter: (batch) => {
              gsap.to(batch, {
                autoAlpha: 1,
                x: 0,
                y: 0,
                scale: 1,
                rotationY: 0,
                rotationZ: 0,
                duration: reduceMotion ? 0.28 : desktop ? 0.76 : 0.82,
                ease: "power3.out",
                stagger: 0.12,
                clearProps: "transform,opacity,visibility",
              });
            },
          });
        }
      },
    );

    return () => media.revert();
  }, { dependencies: [pathname, searchKey], revertOnUpdate: true, scope: root });

  return <div ref={root}>{children}</div>;
}
