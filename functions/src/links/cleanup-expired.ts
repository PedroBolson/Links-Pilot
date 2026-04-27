import {onSchedule} from "firebase-functions/v2/scheduler";
import {Timestamp} from "firebase-admin/firestore";
import {db} from "../lib/firestore.js";
import type {Link, SlugIndex} from "../types/link.types.js";

const WRITE_BATCH_LIMIT = 400;
const EXPIRED_LINK_LIMIT = 100;
const ORPHAN_SCAN_LIMIT = 200;

function isExpiredTimestamp(value: unknown, now: Timestamp): boolean {
  if (!value || typeof value !== "object") return false;

  const candidate = value as {toMillis?: unknown};
  if (typeof candidate.toMillis !== "function") return false;

  return candidate.toMillis() <= now.toMillis();
}

async function deleteSlugIfMatches(slug: string, linkId: string): Promise<boolean> {
  const slugRef = db.collection("slugs").doc(slug);
  const slugSnap = await slugRef.get();

  if (!slugSnap.exists) return false;

  const slugData = slugSnap.data() as Partial<SlugIndex> | undefined;
  if (slugData?.linkId !== linkId) return false;

  await slugRef.delete();
  return true;
}

async function deleteClicksForLink(linkId: string): Promise<number> {
  let deleted = 0;
  let hasMore = true;

  while (hasMore) {
    const snap = await db
      .collection("clicks")
      .where("linkId", "==", linkId)
      .limit(WRITE_BATCH_LIMIT)
      .get();

    if (snap.empty) {
      hasMore = false;
      continue;
    }

    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    deleted += snap.size;
    hasMore = snap.size === WRITE_BATCH_LIMIT;
  }

  return deleted;
}

async function cleanupLinkDependencies(
  linkId: string,
  link: Link,
): Promise<{slugDeleted: boolean; clicksDeleted: number}> {
  const [slugDeleted, clicksDeleted] = await Promise.all([
    deleteSlugIfMatches(link.slug, linkId),
    deleteClicksForLink(linkId),
  ]);

  return {slugDeleted, clicksDeleted};
}

async function cleanupExpiredActiveLinks(now: Timestamp): Promise<void> {
  const snap = await db
    .collection("links")
    .where("status", "==", "active")
    .where("expiresAt", "<=", now)
    .limit(EXPIRED_LINK_LIMIT)
    .get();

  if (snap.empty) return;

  for (const doc of snap.docs) {
    const link = doc.data() as Link;
    await cleanupLinkDependencies(doc.id, link);
  }

  for (let i = 0; i < snap.docs.length; i += WRITE_BATCH_LIMIT) {
    const batch = db.batch();
    snap.docs.slice(i, i + WRITE_BATCH_LIMIT).forEach((doc) => {
      batch.update(doc.ref, {status: "expired"});
    });
    await batch.commit();
  }
}

async function cleanupStaleSlugs(now: Timestamp): Promise<void> {
  const snap = await db
    .collection("slugs")
    .where("expiresAt", "<=", now)
    .limit(ORPHAN_SCAN_LIMIT)
    .get();

  if (snap.empty) return;

  const batch = db.batch();
  let writeCount = 0;

  for (const slugDoc of snap.docs) {
    const slug = slugDoc.data() as Partial<SlugIndex>;
    if (!slug.linkId) continue;

    const linkSnap = await db.collection("links").doc(slug.linkId).get();

    if (!linkSnap.exists) {
      await deleteClicksForLink(slug.linkId);
      batch.delete(slugDoc.ref);
      writeCount++;
      continue;
    }

    const link = linkSnap.data() as Partial<Link> | undefined;
    const sameSlug = link?.slug === slugDoc.id;
    const expired = isExpiredTimestamp(link?.expiresAt, now);

    if (sameSlug && expired) {
      await deleteClicksForLink(slug.linkId);
      batch.delete(slugDoc.ref);
      writeCount++;
    }
  }

  if (writeCount > 0) await batch.commit();
}

async function cleanupStaleClicks(now: Timestamp): Promise<void> {
  const snap = await db.collection("clicks").limit(ORPHAN_SCAN_LIMIT).get();

  if (snap.empty) return;

  const linkState = new Map<string, boolean>();
  const batch = db.batch();
  let writeCount = 0;

  for (const clickDoc of snap.docs) {
    const click = clickDoc.data() as {linkId?: unknown};
    if (typeof click.linkId !== "string") continue;

    let shouldDelete = linkState.get(click.linkId);

    if (shouldDelete === undefined) {
      const linkSnap = await db.collection("links").doc(click.linkId).get();

      if (!linkSnap.exists) {
        shouldDelete = true;
      } else {
        const link = linkSnap.data() as Partial<Link> | undefined;
        shouldDelete = isExpiredTimestamp(link?.expiresAt, now);
      }

      linkState.set(click.linkId, shouldDelete);
    }

    if (shouldDelete) {
      batch.delete(clickDoc.ref);
      writeCount++;
    }
  }

  if (writeCount > 0) await batch.commit();
}

export const cleanupExpiredLinks = onSchedule(
  {
    schedule: "every 60 minutes",
    region: "southamerica-east1",
    timeoutSeconds: 540,
  },
  async () => {
    const now = Timestamp.now();

    await cleanupExpiredActiveLinks(now);
    await cleanupStaleSlugs(now);
    await cleanupStaleClicks(now);
  },
);
