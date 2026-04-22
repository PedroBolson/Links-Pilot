import {onRequest} from "firebase-functions/v2/https";
import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {createHash} from "crypto";
import {db} from "../lib/firestore.js";
import {auditLog} from "../lib/audit.js";
import type {Link, SlugIndex} from "../types/link.types.js";

// Rate limiter in-memory por instância Cloud Run (60 req/min por IP)
const IP_WINDOW_MS = 60_000;
const IP_MAX_PER_WINDOW = 60;
const CLEANUP_INTERVAL = 500; // limpa entradas expiradas a cada 500 requests

interface IpWindow {
  count: number;
  resetAt: number;
}

const ipLimits = new Map<string, IpWindow>();
let requestsSinceCleanup = 0;

function getClientIp(req: import("express").Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip ?? "unknown";
}

/* SHA-256 do IP + data do dia — muda diariamente para limitar correlação */
function hashIp(ip: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${ip}:${today}`).digest("hex").slice(0, 16);
}

/* Retorna false se o IP excedeu o limite; incrementa caso contrário */
function checkIpRateLimit(ipHash: string): boolean {
  const now = Date.now();

  // Cleanup periódico para evitar crescimento ilimitado do Map
  requestsSinceCleanup++;
  if (requestsSinceCleanup >= CLEANUP_INTERVAL) {
    for (const [key, entry] of ipLimits) {
      if (now > entry.resetAt) ipLimits.delete(key);
    }
    requestsSinceCleanup = 0;
  }

  const entry = ipLimits.get(ipHash);

  if (!entry || now > entry.resetAt) {
    ipLimits.set(ipHash, {count: 1, resetAt: now + IP_WINDOW_MS});
    return true;
  }

  if (entry.count >= IP_MAX_PER_WINDOW) return false;

  entry.count++;
  return true;
}

export const redirect = onRequest(
  {region: "southamerica-east1"},
  async (req, res) => {
    const slug = req.path.replace(/^\/r\//, "").split("/")[0];

    if (!slug) {
      res.status(400).send("Bad Request");
      return;
    }

    const ip = getClientIp(req);
    const ipHash = hashIp(ip);

    // Rate limit por IP — proteção contra flood no endpoint público
    if (!checkIpRateLimit(ipHash)) {
      auditLog({action: "redirect", result: "rate_limited", metadata: {slug}});
      res.status(429).send("Too Many Requests");
      return;
    }

    const slugSnap = await db.collection("slugs").doc(slug).get();

    if (!slugSnap.exists) {
      auditLog({action: "redirect", result: "not_found", metadata: {slug}});
      res.redirect(302, "/expired?reason=not_found");
      return;
    }

    const slugData = slugSnap.data() as SlugIndex;
    const linkSnap = await db.collection("links").doc(slugData.linkId).get();

    if (!linkSnap.exists) {
      auditLog({action: "redirect", result: "not_found", metadata: {slug}});
      res.redirect(302, "/expired?reason=not_found");
      return;
    }

    const link = linkSnap.data() as Link;
    const now = Timestamp.now();

    if (link.expiresAt.toMillis() <= now.toMillis()) {
      auditLog({action: "redirect", result: "expired", metadata: {slug}});
      res.redirect(302, `/expired?slug=${encodeURIComponent(slug)}`);
      return;
    }

    // Chave de dedup: linkId + ipHash + janela horária — evita inflação de cliques
    const hourWindow = Math.floor(Date.now() / 3_600_000);
    const dedupKey = `${slugData.linkId}_${ipHash}_${hourWindow}`;
    const dedupRef = db.collection("click_dedup").doc(dedupKey);

    // Leitura não-transacional antes da transação para short-circuit rápido
    const dedupSnap = await dedupRef.get();

    if (dedupSnap.exists) {
      // Clique duplicado — redireciona sem registrar
      auditLog({
        action: "redirect",
        result: "click_deduped",
        metadata: {slug, linkId: slugData.linkId},
      });
      res.redirect(302, link.originalUrl);
      return;
    }

    const clickRef = db.collection("clicks").doc();
    const linkRef = db.collection("links").doc(slugData.linkId);
    const ttlExpiry = Timestamp.fromMillis(Date.now() + 2 * 3_600_000);

    await db.runTransaction(async (tx) => {
      // Re-lê dentro da transação para garantir consistência
      const dedupCheck = await tx.get(dedupRef);
      if (dedupCheck.exists) return; // outro request ganhou a corrida

      tx.set(clickRef, {
        linkId: slugData.linkId,
        userId: link.userId,
        timestamp: FieldValue.serverTimestamp(),
        userAgent: req.headers["user-agent"] ?? null,
        referer: req.headers["referer"] ?? null,
      });

      tx.set(dedupRef, {ttl: ttlExpiry});

      tx.update(linkRef, {clickCount: FieldValue.increment(1)});
    });

    auditLog({
      action: "redirect",
      result: "success",
      metadata: {slug, linkId: slugData.linkId},
    });

    res.redirect(302, link.originalUrl);
  }
);
