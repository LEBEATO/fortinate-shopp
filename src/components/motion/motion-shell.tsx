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

        // Catalog cards stay visible and static. Motion is reserved for page text and controls.
        gsap.set("[data-motion-card]", { clearProps: "all" });

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

        requestAnimationFrame(() => ScrollTrigger.refresh());
      },
    );

    return () => media.revert();
  }, { dependencies: [pathname, searchKey], revertOnUpdate: true, scope: root });

  return <div ref={root}>{children}</div>;
}
