"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, PackageOpen, ShoppingBag, WalletCards, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type PurchaseSuccessModalProps = {
  imageUrl: string | null;
  itemName: string;
  price: number;
  remainingBalance: number;
};

export function PurchaseSuccessModal({ imageUrl, itemName, price, remainingBalance }: PurchaseSuccessModalProps) {
  const pathname = usePathname();
  const router = useRouter();
  const modalRoot = useRef<HTMLDivElement>(null);

  const close = useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline
      .from(modalRoot.current, { autoAlpha: 0, duration: 0.2 })
      .from("[data-success-panel]", { autoAlpha: 0, y: 26, scale: 0.94, duration: 0.4 }, "-=0.08")
      .from("[data-success-check]", { scale: 0.45, rotation: -12, duration: 0.42, ease: "back.out(1.8)" }, "-=0.18")
      .from("[data-success-item]", { autoAlpha: 0, y: 10, duration: 0.3, stagger: 0.045 }, "-=0.2");
  }, { scope: modalRoot });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [close]);

  return <div aria-label="Compra realizada com sucesso" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-3 backdrop-blur-md sm:p-4" ref={modalRoot} role="dialog">
    <button aria-label="Fechar confirmação" className="absolute inset-0 cursor-default" onClick={close} type="button" />
    <section className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-[1.5rem] border border-emerald-300/20 bg-[#0b1020] shadow-[0_30px_100px_rgba(0,0,0,.65)] sm:rounded-[2rem]" data-success-panel>
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(52,211,153,.22),transparent_70%)]" />
      <button aria-label="Fechar" className="motion-button absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white sm:right-4 sm:top-4" onClick={close} type="button"><X aria-hidden="true" className="size-5" /></button>
      <div className="relative px-5 pb-6 pt-7 text-center sm:px-8 sm:pb-7 sm:pt-8">
        <span className="mx-auto grid size-14 place-items-center rounded-full border border-emerald-300/30 bg-emerald-400/15 text-emerald-300 shadow-[0_0_35px_rgba(52,211,153,.18)] sm:size-16" data-success-check><Check aria-hidden="true" className="size-7 sm:size-8" strokeWidth={3} /></span>
        <p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-emerald-300 sm:mt-5 sm:text-sm" data-success-item>Compra realizada</p>
        <h2 className="mt-2 text-2xl font-black uppercase italic tracking-[-.04em] sm:text-3xl" data-success-item>Item liberado no Vault</h2>

        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-3 text-left sm:mt-6 sm:gap-4 sm:p-4" data-success-item>
          <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-b from-violet-500/25 to-slate-950">
            {imageUrl ? <Image alt="" className="object-contain p-1" fill sizes="80px" src={imageUrl} /> : <PackageOpen aria-hidden="true" className="size-9 text-slate-500" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-white">{itemName}</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-yellow-300"><ShoppingBag aria-hidden="true" className="size-4" /> {price.toLocaleString("pt-BR")} V-Bucks</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm sm:px-4" data-success-item>
          <span className="inline-flex items-center gap-2 font-semibold text-slate-400"><WalletCards aria-hidden="true" className="size-4" /> Saldo restante</span>
          <strong className="text-base text-yellow-300">{remainingBalance.toLocaleString("pt-BR")} V-Bucks</strong>
        </div>

        <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2" data-success-item>
          <Link className="motion-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-yellow-300 px-4 py-3 font-black uppercase text-slate-950 hover:bg-yellow-200" href="/inventario"><PackageOpen aria-hidden="true" className="motion-icon size-5" /> Ver inventário</Link>
          <Link className="motion-button inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-black uppercase text-white hover:bg-white/10" href="/catalogo">Continuar comprando</Link>
        </div>
      </div>
    </section>
  </div>;
}
