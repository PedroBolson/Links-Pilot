import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getFirestore, FieldValue} from "firebase-admin/firestore";

export const ensureProfile = onCall(
  {region: "southamerica-east1", cors: true},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email ?? "";
    const db = getFirestore();
    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        email,
        plan: "free",
        linkCount: 0,
        createdAt: FieldValue.serverTimestamp(),
      });
      return {created: true};
    }

    return {created: false};
  },
);
