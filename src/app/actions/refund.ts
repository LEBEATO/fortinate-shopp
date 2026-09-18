"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function refundAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  const purchaseId = String(formData.get("purchaseId") || "");
  if (!purchaseId) redirect("/historico?erro=invalido");
  let errorCode = "";
  try {
    await db.$transaction(async (tx) => {
      const purchase = await tx.purchase.findFirst({ where: { id: purchaseId, userId: user.id }, include: { items: true } });
      if (!purchase || purchase.status !== "COMPLETED") throw new Error("INVALID");
      const owned = await tx.userCosmetic.count({ where: { userId: user.id, purchaseId: purchase.id } });
      if (owned !== purchase.items.length) throw new Error("MISSING");
      await tx.userCosmetic.deleteMany({ where: { userId: user.id, purchaseId: purchase.id } });
      await tx.purchase.update({ where: { id: purchase.id }, data: { status: "REFUNDED", refundedAt: new Date() } });
      await tx.user.update({ where: { id: user.id }, data: { creditBalance: { increment: purchase.amount } } });
      await tx.refund.create({ data: { purchaseId: purchase.id, userId: user.id, amount: purchase.amount } });
    }, { isolationLevel: "Serializable" });
  } catch (error) {
    errorCode = error instanceof Error && error.message === "MISSING" ? "itens" : "invalido";
  }
  redirect(errorCode ? `/historico?erro=${errorCode}` : "/historico?reembolso=sucesso");
}
