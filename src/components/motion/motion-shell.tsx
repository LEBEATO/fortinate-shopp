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
      },
      (context) => {
        const { desktop } = context.conditions as {
          desktop: boolean;
        };
        const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        timeline
          .from("[data-motion='header']", { autoAlpha: 0, y: -14, duration: 0.38 })
          .from("[data-motion='eyebrow']", { autoAlpha: 0, y: 12, duration: 0.34 })
          .from("[data-motion='title']", { autoAlpha: 0, x: desktop ? -28 : -18, duration: 0.55 }, "-=0.2")
          .from("[data-motion='copy']", { autoAlpha: 0, y: 16, duration: 0.44 }, "-=0.27")
          .from("[data-motion='panel']", { autoAlpha: 0, y: 24, scale: 0.985, duration: 0.5 }, "-=0.2");

        const cards = gsap.utils.toArray<HTMLElement>("[data-motion-card]");
        if (cards.length) {
          const side = (element: HTMLElement, fallbackIndex: number) => {
            const cardIndex = Number(element.dataset.cardIndex ?? fallbackIndex);
            return cardIndex % 2 === 0 ? -1 : 1;
          };

          gsap.set(cards, {
            autoAlpha: 0,
            x: (index, element: HTMLElement) => side(element, index) * (desktop ? 150 : 105),
            y: desktop ? 18 : 12,
            scale: desktop ? 0.95 : 0.97,
            rotationY: (index, element: HTMLElement) => side(element, index) * (desktop ? -8 : -5),
            rotationZ: (index, element: HTMLElement) => side(element, index) * (desktop ? -1.5 : -2),
            transformOrigin: "center center",
          });

          ScrollTrigger.batch(cards, {
            start: "top 82%",
            once: true,
            interval: 0.12,
            batchMax: desktop ? 2 : 1,
            onEnter: (batch) => {
              batch.forEach((card, order) => {
                const cardElement = card as HTMLElement;
                const cardSide = side(cardElement, cards.indexOf(cardElement));
                const mediaElement = cardElement.querySelector<HTMLElement>("[data-card-media]");
                const copyElements = cardElement.querySelectorAll<HTMLElement>("[data-card-copy]");
                const cardTimeline = gsap.timeline({ delay: order * 0.12 });

                cardTimeline.to(cardElement, {
                  autoAlpha: 1, x: 0, y: 0, scale: 1, rotationY: 0, rotationZ: 0,
                  duration: desktop ? 0.76 : 0.82, ease: "power3.out",
                  clearProps: "transform,opacity,visibility",
                });

                if (mediaElement) {
                  cardTimeline.from(mediaElement, {
                    autoAlpha: 0, scale: 0.78, rotation: cardSide * -4,
                    duration: 0.48, ease: "back.out(1.35)", clearProps: "transform,opacity,visibility",
                  }, "-=0.54");
                }

                if (copyElements.length) {
                  cardTimeline.from(copyElements, {
                    autoAlpha: 0, x: cardSide * 24, y: 12,
                    duration: 0.4, ease: "power2.out", stagger: 0.07,
                    clearProps: "transform,opacity,visibility",
                  }, "-=0.34");
                }
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
