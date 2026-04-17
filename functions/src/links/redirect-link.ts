import {onRequest} from "firebase-functions/v2/https";
import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {db} from "../lib/firestore.js";
import type {Link, SlugIndex} from "../types/link.types.js";

export const redirect = onRequest(
  {region: "southamerica-east1"},
  async (req, res) => {
    const slug = req.path.replace(/^\/r\//, "").split("/")[0];

    if (!slug) {
      res.status(400).send("Bad Request");
      return;
    }

    const slugSnap = await db.collection("slugs").doc(slug).get();

    if (!slugSnap.exists) {
      res.redirect(302, "/expired?reason=not_found");
      return;
    }

    const slugData = slugSnap.data() as SlugIndex;
    const linkSnap = await db.collection("links").doc(slugData.linkId).get();

    if (!linkSnap.exists) {
      res.redirect(302, "/expired?reason=not_found");
      return;
    }

    const link = linkSnap.data() as Link;
    const now = Timestamp.now();

    if (link.expiresAt.toMillis() <= now.toMillis()) {
      res.redirect(302, `/expired?slug=${encodeURIComponent(slug)}`);
      return;
    }

    const clickRef = db.collection("clicks").doc();
    const linkRef = db.collection("links").doc(slugData.linkId);

    await db.runTransaction(async (tx) => {
      tx.set(clickRef, {
        linkId: slugData.linkId,
        userId: link.userId,
        timestamp: FieldValue.serverTimestamp(),
        userAgent: req.headers["user-agent"] ?? null,
        referer: req.headers["referer"] ?? null,
      });
      tx.update(linkRef, {clickCount: FieldValue.increment(1)});
    });

    res.redirect(302, link.originalUrl);
  },
);
