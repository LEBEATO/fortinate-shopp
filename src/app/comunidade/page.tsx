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
  return <main className="min-h-screen bg-[radial-gradient(circle_at_80%_0%,rgba(124,58,237,.14),transparent_30%),#060914]"><AppHeader /><div className="mx-auto max-w-[90rem] px-5 py-10 lg:px-8 lg:py-14">
    <p className="text-sm font-bold uppercase tracking-[.16em] text-violet-300">Coleções públicas</p><h1 className="mt-3 text-4xl font-black uppercase italic tracking-[-.04em] sm:text-6xl">Comunidade</h1><p className="mt-3 max-w-2xl text-slate-400">Conheça outros colecionadores e explore os cosméticos que eles já conquistaram.</p>
    {users.length ? <section className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{users.map((user, index) => <Link className="catalog-card group rounded-[1.5rem] border border-white/10 bg-white/[.035] p-6 transition hover:-translate-y-1 hover:border-violet-400/35 hover:bg-violet-400/[.05]" href={`/comunidade/${user.id}`} key={user.id} style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}><div className="flex items-center gap-4"><span className="grid size-14 place-items-center rounded-2xl bg-violet-400/15 text-violet-300"><UserRound aria-hidden="true" className="size-7" /></span><div><h2 className="text-xl font-black group-hover:text-violet-200">{user.name}</h2><p className="mt-1 text-sm text-slate-500">Membro desde {user.createdAt.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p></div></div><div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-5 font-bold text-slate-300"><PackageOpen aria-hidden="true" className="size-5 text-yellow-300" /> {user._count.cosmetics} {user._count.cosmetics === 1 ? "item" : "itens"} na coleção</div></Link>)}</section> : <section className="mt-10 rounded-[1.6rem] border border-dashed border-white/15 py-20 text-center"><UsersRound aria-hidden="true" className="mx-auto size-12 text-slate-600" /><h2 className="mt-5 text-2xl font-black">A comunidade está começando</h2><p className="mt-2 text-slate-400">Os perfis aparecerão depois da primeira compra.</p></section>}
    <Pagination page={page} pages={pages} params={new URLSearchParams()} />
  </div></main>;
}
