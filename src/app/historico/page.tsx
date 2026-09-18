import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RotateCcw, ShoppingBag } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { refundAction } from "@/app/actions/refund";
import { AppHeader } from "@/components/layout/app-header";

export const metadata: Metadata = { title: "Histórico" };
export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ reembolso?: string; erro?: string }> };

export default async function HistoryPage({ searchParams }: Props) {
  const user = await getCurrentUser(); if (!user) redirect("/entrar"); const feedback = await searchParams;
  const purchases = await db.purchase.findMany({ where: { userId: user.id }, orderBy: { purchasedAt: "desc" }, include: { items: { include: { cosmetic: { select: { id: true, name: true } } } }, refund: true } });
  return <main className="min-h-screen bg-[radial-gradient(circle_at_15%_0%,rgba(37,99,235,.12),transparent_28%),#060914]"><AppHeader /><div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
    <p className="text-sm font-bold uppercase tracking-[.16em] text-blue-300">Compras e devoluções</p><h1 className="mt-3 text-4xl font-black uppercase italic tracking-[-.04em] sm:text-6xl">Histórico</h1>
    {feedback.reembolso === "sucesso" ? <p className="mt-7 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 font-bold text-emerald-300">Reembolso concluído e V-Bucks devolvidos ao saldo.</p> : null}{feedback.erro ? <p className="mt-7 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 font-bold text-rose-300">Não foi possível realizar este reembolso.</p> : null}
    {purchases.length ? <section className="mt-9 space-y-4">{purchases.map((purchase) => <article className="rounded-[1.4rem] border border-white/10 bg-white/[.035] p-5 sm:p-6" key={purchase.id}><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-black">{purchase.displayName}</h2><span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${purchase.status === "COMPLETED" ? "bg-emerald-400/15 text-emerald-300" : "bg-slate-500/15 text-slate-400"}`}>{purchase.status === "COMPLETED" ? "Concluída" : "Reembolsada"}</span></div><p className="mt-2 text-sm text-slate-500">{purchase.purchasedAt.toLocaleString("pt-BR")} · {purchase.items.map(({ cosmetic }) => cosmetic.name).join(", ")}</p><p className="mt-4 text-xl font-black text-yellow-300">{purchase.amount.toLocaleString("pt-BR")} V-Bucks</p></div>{purchase.status === "COMPLETED" ? <form action={refundAction}><input name="purchaseId" type="hidden" value={purchase.id} /><button className="inline-flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 font-bold text-rose-300 transition hover:bg-rose-400/20" type="submit"><RotateCcw aria-hidden="true" className="size-4" /> Reembolsar</button></form> : purchase.refund ? <p className="text-sm text-slate-500">Devolvido em {purchase.refund.createdAt.toLocaleDateString("pt-BR")}</p> : null}</div></article>)}</section> : <section className="mt-10 rounded-[1.6rem] border border-dashed border-white/15 py-20 text-center"><ShoppingBag aria-hidden="true" className="mx-auto size-12 text-slate-600" /><h2 className="mt-5 text-2xl font-black">Nenhuma compra ainda</h2><p className="mt-2 text-slate-400">Suas compras e reembolsos aparecerão aqui.</p></section>}
  </div></main>;
}
