"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function purchaseAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  const offerId = String(formData.get("offerId") || "");
  const cosmeticId = String(formData.get("cosmeticId") || "");
  if (!offerId || !cosmeticId) redirect("/catalogo");

  try {
    await db.$transaction(async (tx) => {
      const offer = await tx.shopOffer.findFirst({ where: { id: offerId, isActive: true }, include: { items: true } });
      if (!offer || offer.items.length === 0) throw new Error("UNAVAILABLE");
      const cosmeticIds = offer.items.map((item) => item.cosmeticId);
      const ownedCount = await tx.userCosmetic.count({ where: { userId: user.id, cosmeticId: { in: cosmeticIds } } });
      if (ownedCount > 0) throw new Error("OWNED");
      const debit = await tx.user.updateMany({ where: { id: user.id, creditBalance: { gte: offer.finalPrice } }, data: { creditBalance: { decrement: offer.finalPrice } } });
      if (debit.count !== 1) throw new Error("BALANCE");
      const purchase = await tx.purchase.create({ data: { userId: user.id, offerId: offer.id, displayName: offer.name || "Oferta Fortnite", amount: offer.finalPrice } });
      await tx.purchaseItem.createMany({ data: cosmeticIds.map((id) => ({ purchaseId: purchase.id, cosmeticId: id })) });
      await tx.userCosmetic.createMany({ data: cosmeticIds.map((id) => ({ userId: user.id, cosmeticId: id, purchaseId: purchase.id })) });
    }, { isolationLevel: "Serializable" });
  } catch (error) {
    const reason = error instanceof Error && ["UNAVAILABLE", "OWNED", "BALANCE"].includes(error.message) ? error.message.toLowerCase() : "falha";
    redirect(`/catalogo/${cosmeticId}?erro=${reason}`);
  }
  redirect(`/catalogo/${cosmeticId}?compra=sucesso`);
}
