import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, CalendarDays, Package, ShoppingBag, Sparkles, Tag } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { purchaseAction } from "@/app/actions/purchase";

export const dynamic = "force-dynamic";
type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ compra?: string; erro?: string }> };

function imageUrl(images: unknown) {
  if (!images || typeof images !== "object") return null;
  const data = images as Record<string, unknown>;
  for (const key of ["featured", "icon", "smallIcon"]) if (typeof data[key] === "string" && data[key]) return data[key] as string;
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await db.cosmetic.findUnique({ where: { id }, select: { name: true, description: true } });
  return item ? { title: item.name, description: item.description || `Detalhes de ${item.name}` } : { title: "Cosmético" };
}

export default async function CosmeticDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const feedback = await searchParams;
  const user = await getCurrentUser();
  const item = await db.cosmetic.findUnique({
    where: { id },
    include: {
      offerItems: { where: { offer: { isActive: true } }, take: 1, include: { offer: { include: { items: { include: { cosmetic: { select: { id: true, name: true } } } } } } } },
      owners: user ? { where: { userId: user.id }, select: { userId: true } } : false,
    },
  });
  if (!item) notFound();
  const image = imageUrl(item.images); const offer = item.offerItems[0]?.offer; const owned = Array.isArray(item.owners) && item.owners.length > 0;

  return <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,.18),transparent_30%),radial-gradient(circle_at_90%_70%,rgba(37,99,235,.12),transparent_25%),#060914] px-5 py-8 lg:px-8">
    <div className="mx-auto max-w-6xl">
      <Link className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-bold text-slate-300 transition hover:bg-white/10" href="/catalogo"><ArrowLeft aria-hidden="true" className="size-4" /> Voltar ao catálogo</Link>
      <article className="mt-7 grid overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/75 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
        <div className="relative grid min-h-[26rem] place-items-center overflow-hidden bg-gradient-to-b from-violet-500/25 to-slate-950 lg:min-h-[42rem]">
          <div aria-hidden="true" className="absolute size-72 rounded-full bg-blue-500/20 blur-3xl" />
          {image ? <Image alt={item.name} className="object-contain p-8" fill priority sizes="(max-width: 1024px) 100vw, 50vw" src={image} /> : <Package aria-label="Imagem indisponível" className="size-24 text-slate-600" />}
        </div>
        <div className="flex flex-col p-7 sm:p-10 lg:p-12">
          <div className="flex flex-wrap gap-2">{item.isNew ? <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-black uppercase"><Sparkles aria-hidden="true" className="size-4" /> Novo</span> : null}{offer ? <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-300 px-3 py-1.5 text-xs font-black uppercase text-slate-950"><ShoppingBag aria-hidden="true" className="size-4" /> Disponível</span> : null}{offer?.isPromotional ? <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-black uppercase"><Tag aria-hidden="true" className="size-4" /> Promoção</span> : null}{owned ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-black uppercase text-slate-950"><BadgeCheck aria-hidden="true" className="size-4" /> Adquirido</span> : null}</div>
          <p className="mt-7 text-sm font-bold uppercase tracking-[.15em] text-blue-300">{item.typeLabel} · {item.rarityLabel}</p>
          <h1 className="mt-3 text-4xl font-black uppercase italic tracking-[-.04em] sm:text-6xl">{item.name}</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">{item.description || "Sem descrição disponível."}</p>
          {item.apiAddedAt ? <p className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500"><CalendarDays aria-hidden="true" className="size-4" /> Adicionado em {item.apiAddedAt.toLocaleDateString("pt-BR")}</p> : null}
          {offer?.items && offer.items.length > 1 ? <div className="mt-7 rounded-2xl border border-white/10 bg-white/[.035] p-5"><h2 className="font-black uppercase">Conteúdo do pacote</h2><ul className="mt-3 space-y-2 text-sm text-slate-300">{offer.items.map(({ cosmetic }) => <li key={cosmetic.id}>• {cosmetic.name}</li>)}</ul></div> : null}
          <div className="mt-auto pt-10">
            {feedback.compra === "sucesso" ? <p className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 font-bold text-emerald-300">Compra concluída. O item já está no seu inventário.</p> : null}
            {feedback.erro ? <p className="mb-5 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 font-bold text-rose-300">{feedback.erro === "balance" ? "Saldo insuficiente para esta compra." : feedback.erro === "owned" ? "Você já possui um item desta oferta." : feedback.erro === "unavailable" ? "Esta oferta não está mais disponível." : "Não foi possível concluir a compra."}</p> : null}
            {offer ? <div className="mb-5">{offer.isPromotional ? <span className="mr-3 text-lg text-slate-500 line-through">{offer.regularPrice.toLocaleString("pt-BR")}</span> : null}<span className="text-3xl font-black text-yellow-300">{offer.finalPrice.toLocaleString("pt-BR")} V-Bucks</span></div> : <p className="mb-5 font-semibold text-slate-500">Este item não está disponível na loja agora.</p>}
            {owned ? <button className="w-full cursor-default rounded-2xl bg-emerald-400/15 px-6 py-4 font-black uppercase text-emerald-300" type="button"><BadgeCheck aria-hidden="true" className="mr-2 inline size-5" /> Item adquirido</button> : offer ? user ? <form action={purchaseAction}><input name="offerId" type="hidden" value={offer.id} /><input name="cosmeticId" type="hidden" value={item.id} /><button className="w-full rounded-2xl bg-yellow-300 px-6 py-4 text-center font-black uppercase text-slate-950 shadow-[0_15px_45px_rgba(253,224,71,.18)] transition hover:-translate-y-1 hover:bg-yellow-200" type="submit">Comprar agora</button></form> : <Link className="block w-full rounded-2xl bg-yellow-300 px-6 py-4 text-center font-black uppercase text-slate-950 transition hover:bg-yellow-200" href="/entrar">Entrar para comprar</Link> : null}
          </div>
        </div>
      </article>
    </div>
  </main>;
}
