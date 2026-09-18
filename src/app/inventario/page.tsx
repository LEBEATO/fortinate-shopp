import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PackageOpen } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { AppHeader } from "@/components/layout/app-header";
import { CatalogCard } from "@/components/catalog/catalog-card";

export const metadata: Metadata = { title: "Meu inventário" };
export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const user = await getCurrentUser(); if (!user) redirect("/entrar");
  const owned = await db.userCosmetic.findMany({ where: { userId: user.id }, orderBy: { acquiredAt: "desc" }, include: { cosmetic: true } });
  return <main className="min-h-screen bg-[radial-gradient(circle_at_85%_0%,rgba(16,185,129,.10),transparent_28%),#060914]"><AppHeader /><div className="page-container py-8 sm:py-10 lg:py-14">
    <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-300 sm:text-sm" data-motion="eyebrow">Sua coleção</p><h1 className="display-title mt-3 font-black uppercase italic tracking-[-.04em]" data-motion="title">Meu inventário</h1><p className="mt-3 text-slate-400" data-motion="copy">{owned.length} {owned.length === 1 ? "cosmético adquirido" : "cosméticos adquiridos"}</p>
    {owned.length ? <section className="mt-7 grid gap-4 sm:mt-9 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">{owned.map(({ cosmetic }, index) => <CatalogCard index={index} item={{ ...cosmetic, owned: true, offer: null }} key={cosmetic.id} />)}</section> : <section className="mt-8 rounded-[1.6rem] border border-dashed border-white/15 bg-white/[.025] px-5 py-16 text-center sm:mt-10 sm:py-20" data-motion="panel"><PackageOpen aria-hidden="true" className="mx-auto size-12 text-slate-600" /><h2 className="mt-5 text-2xl font-black">Seu inventário está vazio</h2><p className="mt-2 text-slate-400">Explore a loja e escolha seu primeiro cosmético.</p><Link className="motion-button mt-6 inline-flex rounded-xl bg-yellow-300 px-5 py-3 font-black uppercase text-slate-950" href="/catalogo?sale=1">Ver itens da loja</Link></section>}
  </div></main>;
}
