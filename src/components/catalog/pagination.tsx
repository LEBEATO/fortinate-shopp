import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = { page: number; pages: number; params: URLSearchParams; basePath?: string };
function pageHref(basePath: string, params: URLSearchParams, page: number) { const next = new URLSearchParams(params); next.set("page", String(page)); return `${basePath}?${next.toString()}`; }

export function Pagination({ page, pages, params, basePath = "/catalogo" }: PaginationProps) {
  if (pages <= 1) return null;
  return <nav aria-label="Paginação" className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:mt-12 sm:gap-3" data-motion="panel">
    <Link aria-disabled={page === 1} className={`motion-button inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-bold sm:gap-2 sm:px-4 sm:text-base ${page === 1 ? "pointer-events-none opacity-40" : "hover:border-blue-400/40 hover:bg-blue-400/10"}`} href={pageHref(basePath, params, Math.max(1, page - 1))}><ChevronLeft aria-hidden="true" className="size-4" /> Anterior</Link>
    <span className="rounded-xl bg-white/5 px-4 py-2.5 text-sm text-slate-300"><strong className="text-white">{page}</strong> de {pages}</span>
    <Link aria-disabled={page === pages} className={`motion-button inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-bold sm:gap-2 sm:px-4 sm:text-base ${page === pages ? "pointer-events-none opacity-40" : "hover:border-blue-400/40 hover:bg-blue-400/10"}`} href={pageHref(basePath, params, Math.min(pages, page + 1))}>Próxima <ChevronRight aria-hidden="true" className="size-4" /></Link>
  </nav>;
}
