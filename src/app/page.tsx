import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(49,168,255,.14),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,.12),_transparent_35%),#060914] px-4 py-6 sm:px-6 sm:py-12 lg:py-20">
      <section className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-6xl flex-col items-start justify-center rounded-[1.5rem] border border-white/10 bg-slate-950/70 px-5 py-12 shadow-2xl backdrop-blur-xl sm:min-h-[70vh] sm:rounded-[2rem] sm:px-8 sm:py-16 md:px-16" data-motion="panel">
        <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-blue-300" data-motion="eyebrow">Fortnite API em tempo real</span>
        <h1 className="mt-7 max-w-4xl text-[clamp(3rem,10vw,6rem)] font-black uppercase italic leading-[.9] tracking-[-.06em]" data-motion="title">Fortnite <span className="text-yellow-300">Vault</span></h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8" data-motion="copy">Explore a loja atual, descubra novos cosméticos e construa sua coleção com V-Bucks fictícios.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/catalogo" className="motion-button rounded-xl bg-yellow-300 px-6 py-3 font-black uppercase text-slate-950 hover:bg-yellow-200">Explorar catálogo</Link>
          <Link href="/entrar" className="motion-button rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-bold uppercase text-white hover:bg-white/10">Entrar</Link>
        </div>
      </section>
    </main>
  );
}
