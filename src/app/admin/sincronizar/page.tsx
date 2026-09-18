import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Clock3, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { SyncCatalogForm } from "@/components/admin/sync-catalog-form";
import { AppHeader } from "@/components/layout/app-header";

export const metadata: Metadata = { title: "Sincronizar catálogo", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const statusLabel = { RUNNING: "Em execução", COMPLETED: "Concluída", FAILED: "Falhou" } as const;
const statusClass = {
  RUNNING: "bg-blue-400/15 text-blue-300",
  COMPLETED: "bg-emerald-400/15 text-emerald-300",
  FAILED: "bg-rose-400/15 text-rose-300",
} as const;

export default async function SyncCatalogPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  const runs = await db.syncRun.findMany({ orderBy: { startedAt: "desc" }, take: 5 });

  return <main className="min-h-screen bg-[radial-gradient(circle_at_85%_0%,rgba(37,99,235,.14),transparent_30%),radial-gradient(circle_at_0%_45%,rgba(124,58,237,.10),transparent_25%),#060914]">
    <AppHeader />
    <div className="page-container max-w-4xl py-8 sm:py-10 lg:py-14">
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-blue-300 sm:text-sm" data-motion="eyebrow"><ShieldCheck aria-hidden="true" className="size-4" /> Operação protegida</p>
      <h1 className="display-title mt-3 font-black uppercase italic tracking-[-.04em]" data-motion="title">Sincronizar catálogo</h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate-400" data-motion="copy">Importe cosméticos, novidades, preços e ofertas da Fortnite API para o banco Neon.</p>

      <section className="mt-9"><SyncCatalogForm /></section>

      <section className="mt-8 rounded-[1.6rem] border border-white/10 bg-white/[.025] p-5 sm:p-7" data-motion="panel">
        <div className="flex items-center gap-3"><Clock3 aria-hidden="true" className="size-5 text-slate-400" /><h2 className="text-lg font-black">Últimas execuções</h2></div>
        {runs.length ? <div className="mt-5 space-y-3">{runs.map((run, index) => <article className="motion-card rounded-xl border border-white/10 bg-slate-950/50 p-4" data-card-index={index} data-motion-card key={run.id}>
          <div className="flex flex-wrap items-center justify-between gap-3"><span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${statusClass[run.status]}`}>{statusLabel[run.status]}</span><time className="text-xs text-slate-500" dateTime={run.startedAt.toISOString()}>{run.startedAt.toLocaleString("pt-BR")}</time></div>
          <p className="mt-3 text-sm text-slate-300">{run.itemCount.toLocaleString("pt-BR")} registros processados</p>
          {run.error ? <p className="mt-2 break-words text-sm text-rose-300">{run.error}</p> : null}
        </article>)}</div> : <p className="mt-5 rounded-xl border border-dashed border-white/15 p-6 text-center text-slate-500">Nenhuma sincronização executada ainda.</p>}
      </section>
    </div>
  </main>;
}
