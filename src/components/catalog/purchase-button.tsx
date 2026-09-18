"use client";

import Image from "next/image";
import { AlertTriangle, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { purchaseAction } from "@/app/actions/purchase";

gsap.registerPlugin(useGSAP);

type PurchaseButtonProps = {
  cosmeticId: string;
  imageUrl: string | null;
  itemName: string;
  offerId: string;
  price: number;
};

function ConfirmButton() {
  const { pending } = useFormStatus();
  return <button className="motion-button inline-flex min-h-12 items-center justify-center rounded-xl bg-yellow-300 px-5 py-3 font-black uppercase text-slate-950 hover:bg-yellow-200 disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">
    {pending ? "Finalizando..." : "Sim, comprar"}
  </button>;
}

export function PurchaseButton({ cosmeticId, imageUrl, itemName, offerId, price }: PurchaseButtonProps) {
  const [open, setOpen] = useState(false);
  const modalRoot = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!open || !modalRoot.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline
      .from(modalRoot.current, { autoAlpha: 0, duration: 0.2 })
      .from("[data-modal-panel]", { autoAlpha: 0, y: 24, scale: 0.94, duration: 0.38 }, "-=0.08")
      .from("[data-modal-item]", { autoAlpha: 0, y: 10, duration: 0.28, stagger: 0.045 }, "-=0.18");
  }, { dependencies: [open], revertOnUpdate: true, scope: modalRoot });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return <>
    <button className="motion-button w-full rounded-2xl bg-yellow-300 px-6 py-4 text-center font-black uppercase text-slate-950 shadow-[0_15px_45px_rgba(253,224,71,.18)] hover:bg-yellow-200" onClick={() => setOpen(true)} type="button">Comprar agora</button>

    {open ? <div aria-label="Confirmar compra" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-3 backdrop-blur-md sm:p-4" ref={modalRoot} role="dialog">
      <button aria-label="Cancelar compra" className="absolute inset-0 cursor-default" onClick={() => setOpen(false)} type="button" />
      <section className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-[1.5rem] border border-yellow-300/20 bg-[#0b1020] p-5 text-center shadow-[0_30px_100px_rgba(0,0,0,.65)] sm:rounded-[2rem] sm:p-8" data-modal-panel>
        <button aria-label="Fechar" className="motion-button absolute right-3 top-3 grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 sm:right-4 sm:top-4" onClick={() => setOpen(false)} type="button"><X aria-hidden="true" className="size-5" /></button>
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-yellow-300/15 text-yellow-300" data-modal-item><AlertTriangle aria-hidden="true" className="size-7" /></span>
        <p className="mt-5 text-xs font-black uppercase tracking-[.16em] text-yellow-300 sm:text-sm" data-modal-item>Confirmar compra</p>
        <h2 className="mt-2 text-xl font-black text-white sm:text-2xl" data-modal-item>Deseja comprar este item?</h2>

        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-3 text-left sm:mt-6 sm:gap-4 sm:p-4" data-modal-item>
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-violet-500/25 to-slate-950">
            {imageUrl ? <Image alt="" className="object-contain p-1" fill sizes="64px" src={imageUrl} /> : null}
          </div>
          <div className="min-w-0"><p className="truncate font-black text-white">{itemName}</p><p className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-yellow-300"><ShoppingBag aria-hidden="true" className="size-4" /> {price.toLocaleString("pt-BR")} V-Bucks</p></div>
        </div>

        <form action={purchaseAction} className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2" data-modal-item>
          <input name="offerId" type="hidden" value={offerId} />
          <input name="cosmeticId" type="hidden" value={cosmeticId} />
          <ConfirmButton />
          <button className="motion-button min-h-12 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-black uppercase text-white hover:bg-white/10" onClick={() => setOpen(false)} type="button">Não, cancelar</button>
        </form>
      </section>
    </div> : null}
  </>;
}
