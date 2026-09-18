import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageOpen, UserRound } from "lucide-react";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { Pagination } from "@/components/catalog/pagination";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;
type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> { const { id } = await params; const user = await db.user.findUnique({ where: { id }, select: { name: true } }); return { title: user ? `Coleção de ${user.name}` : "Perfil" }; }

export default async function PublicProfilePage({ params, searchParams }: Props) {
  const { id } = await params; const raw = await searchParams; const requestedPage = Math.max(1, Number.parseInt(raw.page || "1", 10) || 1);
  const profile = await db.user.findUnique({ where: { id }, select: { id: true, name: true, createdAt: true, _count: { select: { cosmetics: true } } } }); if (!profile) notFound();
  const pages = Math.max(1, Math.ceil(profile._count.cosmetics / PAGE_SIZE)); const page = Math.min(requestedPage, pages);
  const owned = await db.userCosmetic.findMany({ where: { userId: id }, orderBy: { acquiredAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, include: { cosmetic: true } });
  return <main className="min-h-screen bg-[radial-gradient(circle_at_15%_0%,rgba(124,58,237,.14),transparent_30%),#060914]"><AppHeader /><div className="page-container py-8 sm:py-10 lg:py-14">
    <Link className="motion-button inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white" data-motion="eyebrow" href="/comunidade"><ArrowLeft aria-hidden="true" className="motion-icon size-4" /> Voltar à comunidade</Link>
    <section className="mt-6 flex flex-col gap-5 rounded-[1.5rem] border border-white/10 bg-white/[.035] p-5 sm:mt-7 sm:flex-row sm:items-center sm:gap-6 sm:p-7" data-motion="panel"><span className="grid size-16 shrink-0 place-items-center rounded-[1.4rem] bg-violet-400/15 text-violet-300 sm:size-20"><UserRound aria-hidden="true" className="size-8 sm:size-10" /></span><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.15em] text-violet-300 sm:text-sm">Perfil público</p><h1 className="mt-2 break-words text-3xl font-black sm:text-5xl">{profile.name}</h1><p className="mt-2 text-slate-400">Colecionador desde {profile.createdAt.toLocaleDateString("pt-BR")} · {profile._count.cosmetics} {profile._count.cosmetics === 1 ? "item" : "itens"}</p></div></section>
    {owned.length ? <section className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{owned.map(({ cosmetic }, index) => <CatalogCard index={index} item={{ ...cosmetic, owned: true, offer: null }} key={cosmetic.id} />)}</section> : <section className="mt-10 rounded-[1.6rem] border border-dashed border-white/15 py-20 text-center"><PackageOpen aria-hidden="true" className="mx-auto size-12 text-slate-600" /><h2 className="mt-5 text-2xl font-black">Coleção vazia</h2></section>}
    <Pagination basePath={`/comunidade/${id}`} page={page} pages={pages} params={new URLSearchParams()} />
  </div></main>;
}
