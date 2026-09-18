"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, DatabaseZap, LoaderCircle, TriangleAlert } from "lucide-react";

type SyncResult = {
  cosmetics: number;
  newCosmetics: number;
  offers: number;
};

type Feedback =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "success"; result: SyncResult }
  | { kind: "error"; message: string };

export function SyncCatalogForm() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback>({ kind: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback({ kind: "running" });
    try {
      const response = await fetch("/api/sync", {
        method: "POST",
      });
      const body = (await response.json().catch(() => null)) as ({ error?: string } & Partial<SyncResult>) | null;

      if (!response.ok) {
        const message = response.status === 401
          ? "Sua sessão expirou. Entre novamente e tente outra vez."
          : body?.error || "A sincronização falhou. Consulte o histórico abaixo.";
        setFeedback({ kind: "error", message });
        return;
      }

      setFeedback({
        kind: "success",
        result: {
          cosmetics: body?.cosmetics ?? 0,
          newCosmetics: body?.newCosmetics ?? 0,
          offers: body?.offers ?? 0,
        },
      });
      router.refresh();
    } catch {
      setFeedback({ kind: "error", message: "A conexão foi interrompida antes do fim da sincronização." });
    }
  }

  const running = feedback.kind === "running";

  return <div className="rounded-[1.6rem] border border-white/10 bg-white/[.035] p-5 shadow-2xl sm:p-7" data-motion="panel">
    <div className="flex items-start gap-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-500/15 text-blue-300"><DatabaseZap aria-hidden="true" className="size-6" /></span>
      <div><h2 className="text-xl font-black">Importar dados da Fortnite API</h2><p className="mt-1 text-sm leading-6 text-slate-400">A primeira execução pode levar alguns minutos. Mantenha esta página aberta até aparecer o resultado.</p></div>
    </div>

    <form className="mt-7" onSubmit={handleSubmit}>
      <p className="text-sm leading-6 text-slate-400">Sua sessão autenticada será usada para autorizar esta operação.</p>
      <button className="motion-button mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 font-black uppercase text-white hover:bg-blue-400 disabled:cursor-wait disabled:opacity-70 sm:w-auto" disabled={running} type="submit">
        {running ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : <DatabaseZap aria-hidden="true" className="size-5" />}
        {running ? "Sincronizando catálogo..." : "Sincronizar catálogo"}
      </button>
    </form>

    {feedback.kind === "success" ? <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-200" role="status">
      <div className="flex gap-3"><CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0" /><div><p className="font-black">Catálogo sincronizado com sucesso.</p><p className="mt-1 text-sm">{feedback.result.cosmetics.toLocaleString("pt-BR")} cosméticos, {feedback.result.newCosmetics.toLocaleString("pt-BR")} novidades e {feedback.result.offers.toLocaleString("pt-BR")} ofertas.</p><Link className="mt-3 inline-flex font-bold underline underline-offset-4" href="/catalogo">Abrir catálogo</Link></div></div>
    </div> : null}

    {feedback.kind === "error" ? <div className="mt-6 flex gap-3 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-rose-200" role="alert"><TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" /><p className="font-bold">{feedback.message}</p></div> : null}
  </div>;
}
