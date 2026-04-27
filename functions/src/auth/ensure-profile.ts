import {onCall, HttpsError} from "firebase-functions/v2/https";
import {FieldValue} from "firebase-admin/firestore";
import {db} from "../lib/firestore.js";
import {auditLog} from "../lib/audit.js";
import {CALLABLE_CORS, FUNCTION_REGION} from "../lib/http-options.js";

export const ensureProfile = onCall(
  {region: FUNCTION_REGION, cors: CALLABLE_CORS},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email ?? "";
    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        email,
        plan: "free",
        billingStatus: "none",
        linkCount: 0,
        createdAt: FieldValue.serverTimestamp(),
      });

      auditLog({action: "ensureProfile", uid, result: "success", metadata: {created: true}});
      return {created: true};
    }

    auditLog({action: "ensureProfile", uid, result: "success", metadata: {created: false}});
    return {created: false};
  }
);
