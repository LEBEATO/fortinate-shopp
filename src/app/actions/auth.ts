"use server";

import { compare, hash } from "bcryptjs";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/auth/session";
import { loginSchema, registerSchema } from "@/lib/auth/validation";

export type AuthState = { error?: string; fields?: { name?: string; email?: string } };

export async function registerAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const result = registerSchema.safeParse({ name: formData.get("name"), email: formData.get("email"), password: formData.get("password") });
  if (!result.success) return { error: result.error.issues[0]?.message ?? "Dados inválidos." };
  try {
    const user = await db.user.create({
      data: { name: result.data.name, email: result.data.email, passwordHash: await hash(result.data.password, 12) },
      select: { id: true },
    });
    await createSession(user.id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Este e-mail já está cadastrado.", fields: { name: result.data.name, email: result.data.email } };
    }
    return { error: "Não foi possível criar sua conta agora." };
  }
  redirect("/catalogo");
}

export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const result = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!result.success) return { error: result.error.issues[0]?.message ?? "Dados inválidos." };
  const user = await db.user.findUnique({ where: { email: result.data.email }, select: { id: true, passwordHash: true } });
  if (!user || !(await compare(result.data.password, user.passwordHash))) {
    return { error: "E-mail ou senha incorretos.", fields: { email: result.data.email } };
  }
  await createSession(user.id);
  redirect("/catalogo");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/");
}
