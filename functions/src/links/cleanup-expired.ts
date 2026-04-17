import {onSchedule} from "firebase-functions/v2/scheduler";
import {Timestamp} from "firebase-admin/firestore";
import {db} from "../lib/firestore.js";

export const cleanupExpiredLinks = onSchedule(
  {schedule: "every 60 minutes", region: "southamerica-east1"},
  async () => {
    const now = Timestamp.now();

    const snap = await db
      .collection("links")
      .where("status", "==", "active")
      .where("expiresAt", "<=", now)
      .get();

    if (snap.empty) return;

    const BATCH_SIZE = 400;
    const docs = snap.docs;

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = db.batch();
      docs.slice(i, i + BATCH_SIZE).forEach((d) => {
        batch.update(d.ref, {status: "expired"});
      });
      await batch.commit();
    }
  },
);
