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
        mobile: "(max-width: 767px)",
      },
      (context) => {
        const { desktop } = context.conditions as {
          desktop: boolean;
          mobile: boolean;
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
        cards.forEach((cardElement) => {
          const mediaElement = cardElement.querySelector<HTMLElement>("[data-card-media]");
          const copyElements = cardElement.querySelectorAll<HTMLElement>("[data-card-copy]");

          // Scroll reveal: cards rise softly into view instead of entering from the sides.
          const cardTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: cardElement,
              start: desktop ? "top 88%" : "top 94%",
              once: true,
            },
          });

          cardTimeline.fromTo(
            cardElement,
            { autoAlpha: 0, y: desktop ? 42 : 28, scale: 0.975 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: desktop ? 0.68 : 0.52,
              ease: "power3.out",
              clearProps: "transform,opacity,visibility",
            },
          );

          if (mediaElement) {
            cardTimeline.from(
              mediaElement,
              {
                autoAlpha: 0,
                scale: 0.94,
                duration: 0.38,
                ease: "power2.out",
                clearProps: "transform,opacity,visibility",
              },
              "-=0.38",
            );
          }

          if (copyElements.length) {
            cardTimeline.from(
              copyElements,
              {
                autoAlpha: 0,
                y: 12,
                duration: 0.32,
                ease: "power2.out",
                stagger: 0.055,
                clearProps: "transform,opacity,visibility",
              },
              "-=0.26",
            );
          }
        });

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

        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          if (!desktop) {
            gsap.utils.toArray<HTMLElement>("[data-motion-card]").forEach((card) => {
              if (card.getBoundingClientRect().top < window.innerHeight) gsap.set(card, { autoAlpha: 1 });
            });
          }
        });
      },
    );

    return () => media.revert();
  }, { dependencies: [pathname, searchKey], revertOnUpdate: true, scope: root });

  return <div ref={root}>{children}</div>;
}
