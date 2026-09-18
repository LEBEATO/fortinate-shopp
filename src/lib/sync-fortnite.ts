import "server-only";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { fetchFortniteSnapshot, type ApiCosmetic, type ApiShopEntry } from "@/lib/fortnite-api";

const INSERT_BATCH_SIZE = 500;
const UPDATE_BATCH_SIZE = 100;

function optionalDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function cosmeticData(item: ApiCosmetic, newIds: Set<string>): Prisma.CosmeticUncheckedCreateInput {
  return {
    externalId: item.id,
    name: item.name?.trim() || "Item sem nome",
    description: item.description?.trim() || null,
    type: item.type?.value || "unknown",
    typeLabel: item.type?.displayValue || "Cosmético",
    rarity: item.rarity?.value || "common",
    rarityLabel: item.rarity?.displayValue || "Comum",
    images: (item.images ?? {}) as Prisma.InputJsonValue,
    apiAddedAt: optionalDate(item.added),
    isNew: newIds.has(item.id),
  };
}

async function inBatches<T>(values: T[], work: (batch: T[]) => Promise<void>) {
  for (let index = 0; index < values.length; index += UPDATE_BATCH_SIZE) {
    await work(values.slice(index, index + UPDATE_BATCH_SIZE));
  }
}

function offerId(entry: ApiShopEntry) {
  return entry.offerId || entry.devName || `shop-${entry.brItems?.map((item) => item.id).join("-") || "unknown"}`;
}

function cosmeticImage(item?: ApiCosmetic) {
  const images = item?.images;
  if (!images) return null;
  return images.featured || images.large || images.icon || images.small || images.smallIcon || images.background || Object.values(images.other ?? {}).find(Boolean) || null;
}

export async function syncFortniteData() {
  const run = await db.syncRun.create({ data: { source: "fortnite-api.com" } });

  try {
    const snapshot = await fetchFortniteSnapshot();
    const newIds = new Set(snapshot.newCosmetics.map((item) => item.id));
    const allCosmetics = new Map(snapshot.cosmetics.map((item) => [item.id, item]));
    for (const item of snapshot.newCosmetics) allCosmetics.set(item.id, item);
    for (const entry of snapshot.shopEntries) {
      for (const item of entry.brItems ?? []) allCosmetics.set(item.id, item);
    }

    const cosmetics = [...allCosmetics.values()];
    await db.cosmetic.updateMany({ data: { isNew: false } });

    // A primeira sincronização contém milhares de itens. Inserções em lote
    // evitam uma operação de upsert para cada cosmético e mantêm a função
    // dentro do tempo de execução da Vercel.
    for (let index = 0; index < cosmetics.length; index += INSERT_BATCH_SIZE) {
      const batch = cosmetics.slice(index, index + INSERT_BATCH_SIZE);
      await db.cosmetic.createMany({
        data: batch.map((item) => cosmeticData(item, newIds)),
        skipDuplicates: true,
      });
    }

    // Atualiza os itens que mudam com frequência: novidades e ofertas atuais.
    const activeIds = new Set<string>(newIds);
    for (const entry of snapshot.shopEntries) {
      for (const item of entry.brItems ?? []) activeIds.add(item.id);
    }
    const activeCosmetics = cosmetics.filter((item) => activeIds.has(item.id));
    for (let index = 0; index < activeCosmetics.length; index += UPDATE_BATCH_SIZE) {
      const batch = activeCosmetics.slice(index, index + UPDATE_BATCH_SIZE);
      await db.$transaction(batch.map((item) => {
        const data = cosmeticData(item, newIds);
        return db.cosmetic.upsert({
          where: { externalId: item.id },
          create: data,
          update: { ...data, externalId: undefined },
        });
      }));
    }

    const cosmeticRows = await db.cosmetic.findMany({
      where: { externalId: { in: [...allCosmetics.keys()] } },
      select: { id: true, externalId: true },
    });
    const cosmeticIds = new Map(cosmeticRows.map((item) => [item.externalId, item.id]));
    const seenAt = new Date();

    await db.shopOffer.updateMany({ data: { isActive: false } });
    await inBatches(snapshot.shopEntries, async (batch) => {
      for (const entry of batch) {
        const externalId = offerId(entry);
        const items = (entry.brItems ?? []).flatMap((item, position) => {
          const cosmeticId = cosmeticIds.get(item.id);
          return cosmeticId ? [{ cosmeticId, position }] : [];
        });
        if (items.length === 0) continue;

        await db.$transaction(async (tx) => {
          const offer = await tx.shopOffer.upsert({
            where: { externalId },
            create: {
              externalId,
              name: entry.bundle?.name || entry.brItems?.[0]?.name || null,
              regularPrice: Number(entry.regularPrice) || Number(entry.finalPrice) || 0,
              finalPrice: Number(entry.finalPrice) || 0,
              isPromotional: Number(entry.finalPrice) < Number(entry.regularPrice),
              section: entry.layout?.name || null,
              imageUrl: entry.bundle?.image || entry.newDisplayAsset?.renderImages?.[0]?.image || cosmeticImage(entry.brItems?.[0]),
              startsAt: optionalDate(entry.inDate),
              endsAt: optionalDate(entry.outDate),
              lastSeenAt: seenAt,
              items: { create: items },
            },
            update: {
              name: entry.bundle?.name || entry.brItems?.[0]?.name || null,
              regularPrice: Number(entry.regularPrice) || Number(entry.finalPrice) || 0,
              finalPrice: Number(entry.finalPrice) || 0,
              isPromotional: Number(entry.finalPrice) < Number(entry.regularPrice),
              section: entry.layout?.name || null,
              imageUrl: entry.bundle?.image || entry.newDisplayAsset?.renderImages?.[0]?.image || cosmeticImage(entry.brItems?.[0]),
              startsAt: optionalDate(entry.inDate),
              endsAt: optionalDate(entry.outDate),
              isActive: true,
              lastSeenAt: seenAt,
            },
          });
          await tx.shopOfferItem.deleteMany({ where: { offerId: offer.id } });
          await tx.shopOfferItem.createMany({ data: items.map((item) => ({ ...item, offerId: offer.id })) });
        });
      }
    });

    const itemCount = allCosmetics.size + snapshot.shopEntries.length;
    await db.syncRun.update({ where: { id: run.id }, data: { status: "COMPLETED", itemCount, finishedAt: new Date() } });
    return { cosmetics: allCosmetics.size, newCosmetics: newIds.size, offers: snapshot.shopEntries.length };
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 1000) : "Erro desconhecido";
    await db.syncRun.update({ where: { id: run.id }, data: { status: "FAILED", error: message, finishedAt: new Date() } });
    throw error;
  }
}
