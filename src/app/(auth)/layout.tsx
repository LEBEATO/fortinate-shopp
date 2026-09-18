import Link from "next/link";
import { Gamepad2, ShieldCheck, Sparkles } from "lucide-react";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060914] px-5 py-8 sm:px-8">
      <div aria-hidden="true" className="absolute -left-32 top-1/4 size-96 rounded-full bg-violet-600/15 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-32 top-0 size-[30rem] rounded-full bg-blue-500/15 blur-3xl" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/75 shadow-2xl backdrop-blur-xl lg:grid-cols-[1.05fr_.95fr]">
        <aside className="relative hidden overflow-hidden border-r border-white/10 bg-[linear-gradient(145deg,rgba(37,99,235,.22),rgba(76,29,149,.15)_55%,transparent)] p-12 lg:flex lg:flex-col lg:justify-between">
          <Link className="flex items-center gap-3 font-black uppercase tracking-tight" href="/">
            <span className="grid size-11 place-items-center rounded-xl bg-yellow-300 text-slate-950"><Gamepad2 aria-hidden="true" /></span>
            Fortnite Vault
          </Link>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-200">
              <Sparkles aria-hidden="true" className="size-4" /> Sua coleção começa aqui
            </span>
            <h1 className="mt-6 text-5xl font-black uppercase italic leading-[.95] tracking-[-.05em]">Descubra.<br />Colecione.<br /><span className="text-yellow-300">Domine.</span></h1>
            <p className="mt-6 max-w-md leading-7 text-slate-300">Explore cosméticos, acompanhe a loja e construa sua coleção com 10.000 V-Bucks fictícios.</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400"><ShieldCheck aria-hidden="true" className="size-5 text-emerald-400" /> Senhas protegidas e sessão segura</div>
        </aside>
        <section className="flex items-center justify-center p-6 sm:p-12">{children}</section>
      </div>
    </main>
  );
}
