import {HttpsError} from "firebase-functions/v2/https";
import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {db} from "./firestore.js";

interface RateLimitWindow {
  count: number;
  windowStart: Timestamp;
  ttl: Timestamp;
}

const WINDOW_MS = 60 * 60 * 1000; // 1 hora

/*
 * Rate limiter baseado em Firestore com janela deslizante de 1 hora.
 * Usa transação para garantir atomicidade — sem race conditions em chamadas concorrentes.
 * O documento tem TTL de 2h para ser deletado automaticamente pelo Firestore.
 */
export async function enforceRateLimit(
  uid: string,
  action: string,
  maxPerHour: number
): Promise<void> {
  const ref = db.collection("rate_limits").doc(`${action}_${uid}`);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = Date.now();

    if (!snap.exists) {
      tx.set(ref, {
        count: 1,
        windowStart: Timestamp.fromMillis(now),
        ttl: Timestamp.fromMillis(now + WINDOW_MS * 2),
      });
      return;
    }

    const data = snap.data() as RateLimitWindow;
    const windowAge = now - data.windowStart.toMillis();

    if (windowAge > WINDOW_MS) {
      // Janela expirou — reseta
      tx.set(ref, {
        count: 1,
        windowStart: Timestamp.fromMillis(now),
        ttl: Timestamp.fromMillis(now + WINDOW_MS * 2),
      });
      return;
    }

    if (data.count >= maxPerHour) {
      throw new HttpsError(
        "resource-exhausted",
        "Rate limit exceeded. Try again in an hour."
      );
    }

    tx.update(ref, {count: FieldValue.increment(1)});
  });
}
