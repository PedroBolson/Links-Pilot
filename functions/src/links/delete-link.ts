import {onCall, HttpsError} from "firebase-functions/v2/https";
import {FieldValue} from "firebase-admin/firestore";
import {db} from "../lib/firestore.js";
import {auditLog} from "../lib/audit.js";
import type {Link} from "../types/link.types.js";

export const deleteLink = onCall(
  {region: "southamerica-east1", cors: true},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const uid = request.auth.uid;
    const {linkId} = request.data as { linkId?: string };

    if (!linkId || typeof linkId !== "string") {
      throw new HttpsError("invalid-argument", "linkId is required.");
    }

    const linkRef = db.collection("links").doc(linkId);
    const linkSnap = await linkRef.get();

    if (!linkSnap.exists) {
      throw new HttpsError("not-found", "Link not found.");
    }

    const link = linkSnap.data() as Link;

    if (link.userId !== uid) {
      auditLog({
        action: "deleteLink",
        uid,
        result: "denied",
        metadata: {linkId, ownerUid: link.userId},
      });
      throw new HttpsError("permission-denied", "Access denied.");
    }

    const slugRef = db.collection("slugs").doc(link.slug);
    const userRef = db.collection("users").doc(uid);

    await db.runTransaction(async (tx) => {
      tx.delete(slugRef);
      tx.delete(linkRef);
      tx.update(userRef, {linkCount: FieldValue.increment(-1)});
    });

    auditLog({
      action: "deleteLink",
      uid,
      result: "success",
      metadata: {linkId, slug: link.slug},
    });

    return {success: true};
  }
);
