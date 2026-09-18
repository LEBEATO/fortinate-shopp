import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Package, ShoppingBag, Sparkles, Tag } from "lucide-react";

type CardOffer = { finalPrice: number; regularPrice: number; isPromotional: boolean };
type CatalogCardProps = {
  item: {
    id: string; name: string; description: string | null; typeLabel: string;
    rarity: string; rarityLabel: string; images: unknown; isNew: boolean;
    owned: boolean; offer: CardOffer | null;
  };
  index: number;
};

const rarityGradients: Record<string, string> = {
  common: "from-slate-500/35 to-slate-950", uncommon: "from-emerald-500/35 to-slate-950",
  rare: "from-blue-500/40 to-slate-950", epic: "from-violet-500/45 to-slate-950",
  legendary: "from-orange-500/45 to-slate-950", marvel: "from-red-500/45 to-slate-950",
};

function imageUrl(images: unknown) {
  if (!images || typeof images !== "object") return null;
  const data = images as Record<string, unknown>;
  for (const key of ["featured", "icon", "smallIcon"]) if (typeof data[key] === "string" && data[key]) return data[key] as string;
  return null;
}

export function CatalogCard({ item, index }: CatalogCardProps) {
  const image = imageUrl(item.images);
  return (
    <Link href={`/catalogo/${item.id}`} data-card-index={index} data-motion-card className="catalog-card motion-card group flex min-h-[23rem] flex-col overflow-hidden rounded-[1.4rem] border border-white/10 bg-slate-950/80 shadow-[0_18px_60px_rgba(0,0,0,.24)] hover:border-blue-400/40 hover:shadow-[0_28px_80px_rgba(37,99,235,.18)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/30 sm:min-h-[26rem] sm:rounded-[1.6rem]">
      <div className={`relative aspect-square overflow-hidden bg-gradient-to-b ${rarityGradients[item.rarity] ?? rarityGradients.common}`}>
        <div aria-hidden="true" className="absolute inset-x-8 bottom-2 h-8 rounded-full bg-black/50 blur-xl transition-transform duration-300 group-hover:scale-110" />
        {image ? <Image alt={item.name} className="object-contain p-3 transition-transform duration-500 ease-[cubic-bezier(.2,0,0,1)] group-hover:scale-110" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" src={image} /> : <div className="grid h-full place-items-center text-slate-600"><Package aria-hidden="true" className="size-16" /></div>}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {item.isNew ? <span className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-2.5 py-1 text-xs font-black uppercase text-white shadow-lg"><Sparkles aria-hidden="true" className="size-3.5" /> Novo</span> : null}
          {item.offer ? <span className="inline-flex items-center gap-1 rounded-full bg-yellow-300 px-2.5 py-1 text-xs font-black uppercase text-slate-950 shadow-lg"><ShoppingBag aria-hidden="true" className="size-3.5" /> Loja</span> : null}
          {item.offer?.isPromotional ? <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-black uppercase text-white shadow-lg"><Tag aria-hidden="true" className="size-3.5" /> Oferta</span> : null}
        </div>
        {item.owned ? <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-emerald-400 text-slate-950 shadow-lg" title="Você possui este item"><BadgeCheck aria-label="Adquirido" className="size-5" /></span> : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider text-slate-500"><span>{item.typeLabel}</span><span>{item.rarityLabel}</span></div>
        <h2 className="mt-3 text-xl font-black tracking-tight text-white transition-colors group-hover:text-blue-200">{item.name}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{item.description || "Sem descrição disponível."}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          {item.offer ? <div>{item.offer.isPromotional ? <span className="block text-xs text-slate-500 line-through">{item.offer.regularPrice.toLocaleString("pt-BR")}</span> : null}<span className="font-black text-yellow-300">{item.offer.finalPrice.toLocaleString("pt-BR")} V-Bucks</span></div> : <span className="text-sm font-semibold text-slate-500">Fora da loja</span>}
          <span className="motion-icon hidden text-sm font-bold text-blue-300 opacity-0 transition-opacity group-hover:opacity-100 sm:inline">Ver detalhes →</span>
        </div>
      </div>
    </Link>
  );
}
