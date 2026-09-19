"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { History, LogOut, Menu, PackageOpen, UserRound, UsersRound, WalletCards, X } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

type MobileNavProps = {
  user: { id: string; name: string; creditBalance: number } | null;
};

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="motion-button relative grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
      >
        <Menu className={`absolute size-5 transition-all duration-300 ${open ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
        <X className={`absolute size-5 transition-all duration-300 ${open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} />
      </button>

      <button aria-label="Fechar menu" onClick={() => setOpen(false)} className={`fixed inset-0 top-16 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />

      <div className={`fixed right-0 top-16 z-50 h-[calc(100dvh-4rem)] w-[min(86vw,22rem)] border-l border-white/10 bg-[#080c19]/95 p-5 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="mb-5 border-b border-white/10 pb-5">
          <p className="text-xs font-black uppercase tracking-[.2em] text-blue-300">Fortnite Vault</p>
          {user ? <><p className="mt-2 truncate text-lg font-black text-white">{user.name}</p><div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-yellow-300/10 px-3 py-2 text-sm font-black text-yellow-300"><WalletCards className="size-4" />{user.creditBalance.toLocaleString("pt-BR")} V-Bucks</div></> : <p className="mt-2 text-sm text-slate-400">Entre para acessar seu inventário.</p>}
        </div>

        <nav className="grid gap-2" aria-label="Menu móvel">
          <Link onClick={() => setOpen(false)} href="/catalogo" className="mobile-nav-item">Catálogo</Link>
          <Link onClick={() => setOpen(false)} href="/comunidade" className="mobile-nav-item"><UsersRound className="size-5" />Comunidade</Link>
          {user ? <>
            <Link onClick={() => setOpen(false)} href="/inventario" className="mobile-nav-item"><PackageOpen className="size-5" />Inventário</Link>
            <Link onClick={() => setOpen(false)} href="/historico" className="mobile-nav-item"><History className="size-5" />Histórico</Link>
            <Link onClick={() => setOpen(false)} href={`/comunidade/${user.id}`} className="mobile-nav-item"><UserRound className="size-5" />Meu perfil</Link>
            <form action={logoutAction} className="mt-3 border-t border-white/10 pt-4">
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 font-black text-red-200 transition hover:bg-red-500/20"><LogOut className="size-5" />Sair da conta</button>
            </form>
          </> : <Link onClick={() => setOpen(false)} href="/entrar" className="mt-3 rounded-xl bg-yellow-300 px-4 py-3 text-center font-black uppercase text-slate-950">Entrar</Link>}
        </nav>
      </div>
    </div>
  );
}
