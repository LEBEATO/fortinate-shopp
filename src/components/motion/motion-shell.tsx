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
        gsap.from("[data-motion='header']", {
          autoAlpha: 0,
          y: -14,
          duration: 0.38,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
        });

        const pageElements = gsap.utils.toArray<HTMLElement>(
          "[data-motion='eyebrow'],[data-motion='title'],[data-motion='copy'],[data-motion='panel']",
        );

        pageElements.forEach((element) => {
          const kind = element.dataset.motion;
          const isTitle = kind === "title";
          const isPanel = kind === "panel";

          gsap.fromTo(
            element,
            {
              autoAlpha: 0,
              x: isTitle ? (desktop ? -38 : -30) : 0,
              y: isTitle ? 0 : isPanel ? 28 : 18,
              scale: isPanel ? 0.985 : 1,
            },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration: isTitle ? 0.62 : 0.5,
              ease: "power3.out",
              clearProps: "transform,opacity,visibility",
              scrollTrigger: {
                trigger: element,
                start: desktop ? "top 88%" : "top 92%",
                once: true,
              },
            },
          );
        });

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

          cards.forEach((cardElement, index) => {
            const cardSide = side(cardElement, index);
            const mediaElement = cardElement.querySelector<HTMLElement>("[data-card-media]");
            const copyElements = cardElement.querySelectorAll<HTMLElement>("[data-card-copy]");
            const cardTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: cardElement,
                start: desktop ? "top 86%" : "top 90%",
                once: true,
              },
            });

            cardTimeline.to(cardElement, {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              rotationY: 0,
              rotationZ: 0,
              duration: desktop ? 0.76 : 0.72,
              ease: "power3.out",
              clearProps: "transform,opacity,visibility",
            });

            if (mediaElement) {
              cardTimeline.from(
                mediaElement,
                {
                  autoAlpha: 0,
                  scale: 0.78,
                  rotation: cardSide * -4,
                  duration: 0.48,
                  ease: "back.out(1.35)",
                  clearProps: "transform,opacity,visibility",
                },
                "-=0.5",
              );
            }

            if (copyElements.length) {
              cardTimeline.from(
                copyElements,
                {
                  autoAlpha: 0,
                  x: cardSide * 26,
                  y: 12,
                  duration: 0.4,
                  ease: "power2.out",
                  stagger: 0.07,
                  clearProps: "transform,opacity,visibility",
                },
                "-=0.32",
              );
            }
          });
        }

        const buttons = gsap.utils.toArray<HTMLElement>(".motion-button");
        buttons.forEach((button) => {
          gsap.fromTo(
            button,
            { autoAlpha: 0, y: 14, scale: 0.92 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.42,
              ease: "back.out(1.3)",
              clearProps: "transform,opacity,visibility",
              scrollTrigger: {
                trigger: button,
                start: "top 94%",
                once: true,
              },
            },
          );
        });

        ScrollTrigger.refresh();
      },
    );

    return () => media.revert();
  }, { dependencies: [pathname, searchKey], revertOnUpdate: true, scope: root });

  return <div ref={root}>{children}</div>;
}
