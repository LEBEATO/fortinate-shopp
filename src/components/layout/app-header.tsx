import Link from "next/link";
import { Gamepad2, History, PackageOpen, UserRound, UsersRound, WalletCards } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";

export async function AppHeader() {
  const user = await getCurrentUser();
  return <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060914]/80 backdrop-blur-xl">
    <div className="mx-auto flex min-h-20 max-w-[90rem] items-center justify-between gap-4 px-5 py-3 lg:px-8">
      <Link className="flex shrink-0 items-center gap-3 font-black uppercase tracking-tight" href="/"><span className="grid size-10 place-items-center rounded-xl bg-yellow-300 text-slate-950"><Gamepad2 aria-hidden="true" className="size-5" /></span><span className="hidden lg:inline">Fortnite <span className="text-yellow-300">Vault</span></span></Link>
      <nav aria-label="Navegação principal" className="flex items-center gap-1 overflow-x-auto text-sm font-bold text-slate-300">
        <Link className="rounded-xl px-3 py-2 transition hover:bg-white/5 hover:text-white" href="/catalogo">Catálogo</Link>
        <Link className="inline-flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white/5 hover:text-white" href="/comunidade"><UsersRound aria-hidden="true" className="size-4" /><span className="hidden sm:inline">Comunidade</span></Link>
        {user ? <><Link className="inline-flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white/5 hover:text-white" href="/inventario"><PackageOpen aria-hidden="true" className="size-4" /><span className="hidden sm:inline">Inventário</span></Link><Link className="inline-flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white/5 hover:text-white" href="/historico"><History aria-hidden="true" className="size-4" /><span className="hidden sm:inline">Histórico</span></Link></> : null}
      </nav>
      <div className="flex shrink-0 items-center gap-2">{user ? <><span className="hidden items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm font-bold text-yellow-300 md:flex"><WalletCards aria-hidden="true" className="size-4" />{user.creditBalance.toLocaleString("pt-BR")}</span><Link className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10" href={`/comunidade/${user.id}`} aria-label="Meu perfil público"><UserRound aria-hidden="true" className="size-5" /></Link></> : <Link className="rounded-xl bg-yellow-300 px-4 py-2.5 text-sm font-black uppercase text-slate-950 hover:bg-yellow-200" href="/entrar">Entrar</Link>}</div>
    </div>
  </header>;
}
