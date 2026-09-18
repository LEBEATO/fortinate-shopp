"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, PackageOpen, ShoppingBag, WalletCards, X } from "lucide-react";
import { useEffect } from "react";

type PurchaseSuccessModalProps = {
  imageUrl: string | null;
  itemName: string;
  price: number;
  remainingBalance: number;
};

export function PurchaseSuccessModal({ imageUrl, itemName, price, remainingBalance }: PurchaseSuccessModalProps) {
  const pathname = usePathname();
  const router = useRouter();

  const close = () => router.replace(pathname, { scroll: false });

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
  });

  return <div aria-label="Compra realizada com sucesso" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-md" role="dialog">
    <button aria-label="Fechar confirmação" className="absolute inset-0 cursor-default" onClick={close} type="button" />
    <section className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-emerald-300/20 bg-[#0b1020] shadow-[0_30px_100px_rgba(0,0,0,.65)]">
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(52,211,153,.22),transparent_70%)]" />
      <button aria-label="Fechar" className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white" onClick={close} type="button"><X aria-hidden="true" className="size-5" /></button>
      <div className="relative px-6 pb-7 pt-8 text-center sm:px-8">
        <span className="mx-auto grid size-16 place-items-center rounded-full border border-emerald-300/30 bg-emerald-400/15 text-emerald-300 shadow-[0_0_35px_rgba(52,211,153,.18)]"><Check aria-hidden="true" className="size-8" strokeWidth={3} /></span>
        <p className="mt-5 text-sm font-black uppercase tracking-[.18em] text-emerald-300">Compra realizada</p>
        <h2 className="mt-2 text-3xl font-black uppercase italic tracking-[-.04em]">Item liberado no Vault</h2>

        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.04] p-4 text-left">
          <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-b from-violet-500/25 to-slate-950">
            {imageUrl ? <Image alt="" className="object-contain p-1" fill sizes="80px" src={imageUrl} /> : <PackageOpen aria-hidden="true" className="size-9 text-slate-500" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-white">{itemName}</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-yellow-300"><ShoppingBag aria-hidden="true" className="size-4" /> {price.toLocaleString("pt-BR")} V-Bucks</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm">
          <span className="inline-flex items-center gap-2 font-semibold text-slate-400"><WalletCards aria-hidden="true" className="size-4" /> Saldo restante</span>
          <strong className="text-base text-yellow-300">{remainingBalance.toLocaleString("pt-BR")} V-Bucks</strong>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-yellow-300 px-4 py-3 font-black uppercase text-slate-950 transition hover:-translate-y-0.5 hover:bg-yellow-200" href="/inventario"><PackageOpen aria-hidden="true" className="size-5" /> Ver inventário</Link>
          <Link className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-black uppercase text-white transition hover:bg-white/10" href="/catalogo">Continuar comprando</Link>
        </div>
      </div>
    </section>
  </div>;
}
