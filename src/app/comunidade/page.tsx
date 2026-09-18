import type { Metadata } from "next";
import Link from "next/link";
import { PackageOpen, UserRound, UsersRound } from "lucide-react";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { Pagination } from "@/components/catalog/pagination";

export const metadata: Metadata = { title: "Comunidade" };
export const dynamic = "force-dynamic";
const PAGE_SIZE = 12;
type Props = { searchParams: Promise<{ page?: string }> };

export default async function CommunityPage({ searchParams }: Props) {
  const raw = await searchParams; const requestedPage = Math.max(1, Number.parseInt(raw.page || "1", 10) || 1);
  const total = await db.user.count({ where: { cosmetics: { some: {} } } }); const pages = Math.max(1, Math.ceil(total / PAGE_SIZE)); const page = Math.min(requestedPage, pages);
  const users = await db.user.findMany({ where: { cosmetics: { some: {} } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, select: { id: true, name: true, createdAt: true, _count: { select: { cosmetics: true } }, cosmetics: { take: 4, orderBy: { acquiredAt: "desc" }, select: { cosmetic: { select: { images: true, name: true } } } } } });
  return <main className="min-h-screen bg-[radial-gradient(circle_at_80%_0%,rgba(124,58,237,.14),transparent_30%),#060914]"><AppHeader /><div className="page-container py-8 sm:py-10 lg:py-14">
    <p className="text-xs font-bold uppercase tracking-[.16em] text-violet-300 sm:text-sm" data-motion="eyebrow">Coleções públicas</p><h1 className="display-title mt-3 font-black uppercase italic tracking-[-.04em]" data-motion="title">Comunidade</h1><p className="mt-3 max-w-2xl text-slate-400" data-motion="copy">Conheça outros colecionadores e explore os cosméticos que eles já conquistaram.</p>
    {users.length ? <section className="mt-7 grid max-w-6xl gap-4 sm:mt-9 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">{users.map((user, index) => <Link className="catalog-card motion-card group min-w-0 rounded-[1.5rem] border border-white/10 bg-white/[.035] p-5 hover:border-violet-400/35 hover:bg-violet-400/[.05] sm:p-6" data-card-index={index} data-motion-card href={`/comunidade/${user.id}`} key={user.id}><div className="flex items-center gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-400/15 text-violet-300 sm:size-14"><UserRound aria-hidden="true" className="size-7" /></span><div className="min-w-0"><h2 className="truncate text-xl font-black group-hover:text-violet-200">{user.name}</h2><p className="mt-1 text-sm text-slate-500">Membro desde {user.createdAt.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p></div></div><div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-5 font-bold text-slate-300"><PackageOpen aria-hidden="true" className="motion-icon size-5 text-yellow-300" /> {user._count.cosmetics} {user._count.cosmetics === 1 ? "item" : "itens"} na coleção</div></Link>)}</section> : <section className="mt-8 rounded-[1.6rem] border border-dashed border-white/15 px-5 py-16 text-center sm:mt-10 sm:py-20" data-motion="panel"><UsersRound aria-hidden="true" className="mx-auto size-12 text-slate-600" /><h2 className="mt-5 text-2xl font-black">A comunidade está começando</h2><p className="mt-2 text-slate-400">Os perfis aparecerão depois da primeira compra.</p></section>}
    <Pagination basePath="/comunidade" page={page} pages={pages} params={new URLSearchParams()} />
  </div></main>;
}
