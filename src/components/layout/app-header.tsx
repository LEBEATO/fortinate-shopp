import Link from "next/link";
import { Gamepad2, History, PackageOpen, UserRound, UsersRound, WalletCards } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";

export async function AppHeader() {
  const user = await getCurrentUser();
  return <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060914]/85 backdrop-blur-xl" data-motion="header">
    <div className="mx-auto flex min-h-16 max-w-[90rem] items-center justify-between gap-1.5 px-3 py-2 sm:min-h-20 sm:gap-3 sm:px-5 lg:px-8">
      <Link className="motion-button flex shrink-0 items-center gap-3 font-black uppercase tracking-tight" href="/"><span className="grid size-9 place-items-center rounded-xl bg-yellow-300 text-slate-950 sm:size-10"><Gamepad2 aria-hidden="true" className="size-5" /></span><span className="hidden xl:inline">Fortnite <span className="text-yellow-300">Vault</span></span></Link>
      <nav aria-label="Navegação principal" className="flex min-w-0 items-center justify-center gap-0 overflow-x-auto text-xs font-bold text-slate-300 sm:gap-1 sm:text-sm">
        <Link className="motion-button rounded-xl px-2 py-2 hover:bg-white/5 hover:text-white sm:px-3" href="/catalogo">Catálogo</Link>
        <Link aria-label="Comunidade" className="motion-button inline-flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-white/5 hover:text-white sm:px-3" href="/comunidade"><UsersRound aria-hidden="true" className="size-4" /><span className="hidden md:inline">Comunidade</span></Link>
        {user ? <><Link aria-label="Inventário" className="motion-button inline-flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-white/5 hover:text-white sm:px-3" href="/inventario"><PackageOpen aria-hidden="true" className="size-4" /><span className="hidden md:inline">Inventário</span></Link><Link aria-label="Histórico" className="motion-button inline-flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-white/5 hover:text-white sm:px-3" href="/historico"><History aria-hidden="true" className="size-4" /><span className="hidden md:inline">Histórico</span></Link></> : null}
      </nav>
      <div className="flex shrink-0 items-center gap-2">{user ? <><span className="hidden items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm font-bold text-yellow-300 lg:flex"><WalletCards aria-hidden="true" className="size-4" />{user.creditBalance.toLocaleString("pt-BR")}</span><Link className="motion-button grid size-9 place-items-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 sm:size-10" href={`/comunidade/${user.id}`} aria-label="Meu perfil público"><UserRound aria-hidden="true" className="size-5" /></Link></> : <Link className="motion-button rounded-xl bg-yellow-300 px-3 py-2 text-xs font-black uppercase text-slate-950 hover:bg-yellow-200 sm:px-4 sm:py-2.5 sm:text-sm" href="/entrar">Entrar</Link>}</div>
    </div>
  </header>;
}
