import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = { page: number; pages: number; params: URLSearchParams };
function pageHref(params: URLSearchParams, page: number) { const next = new URLSearchParams(params); next.set("page", String(page)); return `/catalogo?${next.toString()}`; }

export function Pagination({ page, pages, params }: PaginationProps) {
  if (pages <= 1) return null;
  return <nav aria-label="Paginação do catálogo" className="mt-12 flex items-center justify-center gap-3">
    <Link aria-disabled={page === 1} className={`inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 font-bold transition ${page === 1 ? "pointer-events-none opacity-40" : "hover:border-blue-400/40 hover:bg-blue-400/10"}`} href={pageHref(params, Math.max(1, page - 1))}><ChevronLeft aria-hidden="true" className="size-4" /> Anterior</Link>
    <span className="rounded-xl bg-white/5 px-4 py-2.5 text-sm text-slate-300"><strong className="text-white">{page}</strong> de {pages}</span>
    <Link aria-disabled={page === pages} className={`inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 font-bold transition ${page === pages ? "pointer-events-none opacity-40" : "hover:border-blue-400/40 hover:bg-blue-400/10"}`} href={pageHref(params, Math.min(pages, page + 1))}>Próxima <ChevronRight aria-hidden="true" className="size-4" /></Link>
  </nav>;
}
