"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import { loginAction, registerAction, type AuthState } from "@/app/actions/auth";

const initialState: AuthState = {};

type AuthFormProps = { mode: "login" | "register" };

export function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === "register";
  const action = isRegister ? registerAction : loginAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5" data-motion="panel">
      {isRegister ? (
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-300">Nome</span>
          <span className="relative block">
            <UserRound aria-hidden="true" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
            <input
              autoComplete="name"
              defaultValue={state.fields?.name}
              name="name"
              placeholder="Como devemos chamar você?"
              required
              className="w-full rounded-2xl border border-white/10 bg-white/[.04] py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/70 focus:bg-blue-400/[.04] focus:ring-4 focus:ring-blue-400/10"
            />
          </span>
        </label>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-300">E-mail</span>
        <span className="relative block">
          <Mail aria-hidden="true" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
          <input
            autoComplete="email"
            defaultValue={state.fields?.email}
            inputMode="email"
            name="email"
            placeholder="voce@email.com"
            required
            type="email"
            className="w-full rounded-2xl border border-white/10 bg-white/[.04] py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/70 focus:bg-blue-400/[.04] focus:ring-4 focus:ring-blue-400/10"
          />
        </span>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-300">Senha</span>
        <span className="relative block">
          <LockKeyhole aria-hidden="true" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
          <input
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={8}
            name="password"
            placeholder="Mínimo de 8 caracteres"
            required
            type="password"
            className="w-full rounded-2xl border border-white/10 bg-white/[.04] py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/70 focus:bg-blue-400/[.04] focus:ring-4 focus:ring-blue-400/10"
          />
        </span>
      </label>

      <div aria-live="polite" className="min-h-6 text-sm font-medium text-rose-300">
        {state.error ?? ""}
      </div>

      <button
        disabled={pending}
        type="submit"
        className="motion-button flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-5 py-4 font-black uppercase tracking-wide text-slate-950 shadow-[0_12px_45px_rgba(253,224,71,.18)] hover:bg-yellow-200 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : null}
        {pending ? "Processando..." : isRegister ? "Criar conta grátis" : "Entrar no Vault"}
      </button>

      <p className="text-center text-sm text-slate-400">
        {isRegister ? "Já possui uma conta?" : "Ainda não possui uma conta?"}{" "}
        <Link className="motion-button inline-flex font-bold text-blue-300 hover:text-blue-200" href={isRegister ? "/entrar" : "/cadastro"}>
          {isRegister ? "Entrar" : "Cadastre-se"}
        </Link>
      </p>
    </form>
  );
}
