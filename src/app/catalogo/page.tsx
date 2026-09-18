import type { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { Pagination } from "@/components/catalog/pagination";
import { AppHeader } from "@/components/layout/app-header";

export const metadata: Metadata = { title: "Catálogo" };
export const dynamic = "force-dynamic";
const PAGE_SIZE = 24;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const value = (input: string | string[] | undefined) => typeof input === "string" ? input : "";

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const q = value(raw.q).trim(); const type = value(raw.type); const rarity = value(raw.rarity);
  const dateFrom = value(raw.dateFrom); const dateTo = value(raw.dateTo);
  const onlyNew = value(raw.new) === "1"; const onSale = value(raw.sale) === "1"; const promotional = value(raw.promo) === "1";
  const requestedPage = Math.max(1, Number.parseInt(value(raw.page) || "1", 10) || 1);
  const user = await getCurrentUser();
  const validFrom = /^\d{4}-\d{2}-\d{2}$/.test(dateFrom) ? new Date(`${dateFrom}T00:00:00.000Z`) : null;
  const validTo = /^\d{4}-\d{2}-\d{2}$/.test(dateTo) ? new Date(`${dateTo}T23:59:59.999Z`) : null;

  const where: Prisma.CosmeticWhereInput = {
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}), ...(type ? { type } : {}), ...(rarity ? { rarity } : {}),
    ...(onlyNew ? { isNew: true } : {}),
    ...(validFrom || validTo ? { apiAddedAt: { ...(validFrom ? { gte: validFrom } : {}), ...(validTo ? { lte: validTo } : {}) } } : {}),
    ...(onSale || promotional ? { offerItems: { some: { offer: { isActive: true, ...(promotional ? { isPromotional: true } : {}) } } } } : {}),
  };

  const [total, types, rarities] = await Promise.all([
    db.cosmetic.count({ where }), db.cosmetic.groupBy({ by: ["type", "typeLabel"], orderBy: { typeLabel: "asc" } }),
    db.cosmetic.groupBy({ by: ["rarity", "rarityLabel"], orderBy: { rarityLabel: "asc" } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE)); const page = Math.min(requestedPage, pages);
  const cosmetics = await db.cosmetic.findMany({
    where, orderBy: [{ isNew: "desc" }, { apiAddedAt: "desc" }, { name: "asc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
    include: {
      offerItems: { where: { offer: { isActive: true } }, take: 1, include: { offer: { select: { finalPrice: true, regularPrice: true, isPromotional: true } } } },
      owners: user ? { where: { userId: user.id }, select: { userId: true } } : false,
    },
  });
  const activeFilters = Boolean(q || type || rarity || dateFrom || dateTo || onlyNew || onSale || promotional);
  const params = new URLSearchParams(Object.entries(raw).flatMap(([key, entry]) => typeof entry === "string" ? [[key, entry]] : []));

  return <main className="min-h-screen bg-[radial-gradient(circle_at_85%_0%,rgba(37,99,235,.14),transparent_28%),radial-gradient(circle_at_0%_35%,rgba(124,58,237,.10),transparent_24%),#060914]">
    <AppHeader />
    <div className="page-container py-8 sm:py-10 lg:py-14">
      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-blue-300 sm:text-sm" data-motion="eyebrow"><Sparkles aria-hidden="true" className="size-4" /> Coleção completa</span>
      <h1 className="display-title mt-3 max-w-5xl font-black uppercase italic tracking-[-.04em]" data-motion="title">Catálogo de cosméticos</h1><p className="mt-3 text-sm text-slate-400 sm:text-base" data-motion="copy">{total.toLocaleString("pt-BR")} {total === 1 ? "item encontrado" : "itens encontrados"}</p>
      <form className="mt-7 rounded-[1.4rem] border border-white/10 bg-white/[.035] p-4 shadow-xl backdrop-blur sm:mt-9 md:p-5" data-motion="panel">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
          <label className="relative sm:col-span-2 lg:col-span-4"><span className="sr-only">Buscar por nome</span><Search aria-hidden="true" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" /><input className="h-12 w-full min-w-0 rounded-xl border border-white/10 bg-slate-950/70 pl-12 pr-4 outline-none transition placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-400/10" defaultValue={q} name="q" placeholder="Buscar cosmético..." /></label>
          <select aria-label="Filtrar por tipo" className="h-12 min-w-0 rounded-xl border border-white/10 bg-slate-950 px-4 outline-none focus:border-blue-400/60 lg:col-span-2" defaultValue={type} name="type"><option value="">Todos os tipos</option>{types.map((item) => <option key={item.type} value={item.type}>{item.typeLabel}</option>)}</select>
          <select aria-label="Filtrar por raridade" className="h-12 min-w-0 rounded-xl border border-white/10 bg-slate-950 px-4 outline-none focus:border-blue-400/60 lg:col-span-2" defaultValue={rarity} name="rarity"><option value="">Todas as raridades</option>{rarities.map((item) => <option key={item.rarity} value={item.rarity}>{item.rarityLabel}</option>)}</select>
          <input aria-label="Data inicial" className="h-12 min-w-0 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-slate-300 outline-none focus:border-blue-400/60 lg:col-span-2" defaultValue={dateFrom} name="dateFrom" type="date" />
          <input aria-label="Data final" className="h-12 min-w-0 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-slate-300 outline-none focus:border-blue-400/60 lg:col-span-2" defaultValue={dateTo} name="dateTo" type="date" />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {[{ name: "new", label: "Novidades", checked: onlyNew }, { name: "sale", label: "Na loja", checked: onSale }, { name: "promo", label: "Em promoção", checked: promotional }].map((filter) => <label key={filter.name} className="motion-button flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm font-semibold text-slate-300 hover:border-blue-400/30 sm:px-4"><input className="size-4 accent-blue-500" defaultChecked={filter.checked} name={filter.name} type="checkbox" value="1" />{filter.label}</label>)}
          <button className="motion-button inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 font-black uppercase text-white hover:bg-blue-400 sm:ml-auto sm:w-auto" type="submit"><SlidersHorizontal aria-hidden="true" className="motion-icon size-4" /> Aplicar filtros</button>
          {activeFilters ? <Link className="motion-button inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 font-bold text-slate-300 hover:bg-white/5 sm:w-auto" href="/catalogo"><X aria-hidden="true" className="size-4" /> Limpar</Link> : null}
        </div>
      </form>
      {cosmetics.length ? <section aria-label="Resultados do catálogo" className="mt-7 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">{cosmetics.map((item, index) => <CatalogCard index={index} item={{ ...item, owned: Array.isArray(item.owners) && item.owners.length > 0, offer: item.offerItems[0]?.offer ?? null }} key={item.id} />)}</section> : <section className="mt-8 rounded-[1.6rem] border border-dashed border-white/15 bg-white/[.025] px-5 py-16 text-center sm:px-6 sm:py-20" data-motion="panel"><Search aria-hidden="true" className="mx-auto size-10 text-slate-600" /><h2 className="mt-4 text-2xl font-black">Nenhum cosmético encontrado</h2><p className="mt-2 text-slate-400">Tente remover alguns filtros ou buscar outro nome.</p><Link className="motion-button mt-6 inline-flex rounded-xl bg-white/10 px-5 py-3 font-bold hover:bg-white/15" href="/catalogo">Limpar filtros</Link></section>}
      <Pagination page={page} pages={pages} params={params} />
    </div>
  </main>;
}
