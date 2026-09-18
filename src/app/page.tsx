import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(49,168,255,.14),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,.12),_transparent_35%),#060914] px-6 py-20">
      <section className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-start justify-center rounded-[2rem] border border-white/10 bg-slate-950/70 px-8 py-16 shadow-2xl backdrop-blur-xl md:px-16">
        <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-blue-300">Fundação Full Stack 2.0</span>
        <h1 className="mt-7 max-w-4xl text-5xl font-black uppercase italic leading-[.92] tracking-[-.06em] md:text-8xl">Fortnite <span className="text-yellow-300">Vault</span></h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">A nova arquitetura com Next.js, PostgreSQL e Prisma está pronta para receber autenticação, catálogo, compras, reembolsos e comunidade.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-xl bg-yellow-300 px-6 py-3 font-black uppercase text-slate-950 transition hover:-translate-y-1 hover:bg-yellow-200">Explorar catálogo</Link>
          <Link href="/entrar" className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-bold uppercase text-white transition hover:bg-white/10">Entrar</Link>
        </div>
      </section>
    </main>
  );
}
