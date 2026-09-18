import type { Metadata } from "next";
import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
      <Link className="motion-button mb-8 flex items-center gap-3 font-black uppercase tracking-tight sm:mb-10 lg:hidden" href="/">
        <span className="grid size-10 place-items-center rounded-xl bg-yellow-300 text-slate-950"><Gamepad2 aria-hidden="true" className="size-5" /></span>
        Fortnite Vault
      </Link>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-300 sm:text-sm" data-motion="eyebrow">10.000 V-Bucks de boas-vindas</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl" data-motion="title">Crie sua conta</h2>
      <p className="mt-3 leading-7 text-slate-400" data-motion="copy">Comece sua coleção gratuitamente. Os créditos são fictícios e exclusivos da plataforma.</p>
      <AuthForm mode="register" />
    </div>
  );
}
