import {defineSecret} from "firebase-functions/params";

export const safeBrowsingApiKey = defineSecret("SAFE_BROWSING_API_KEY");

const THREAT_TYPES = [
  "MALWARE",
  "SOCIAL_ENGINEERING",
  "UNWANTED_SOFTWARE",
  "POTENTIALLY_HARMFUL_APPLICATION",
];

interface SafeBrowsingMatch {
  threatType: string;
}

interface SafeBrowsingResponse {
  matches?: SafeBrowsingMatch[];
}

/*
 * Verifica uma URL contra a Google Safe Browsing API v4.
 * Fail-open: se a API retornar erro (instabilidade, timeout), permite a criação do link
 * e registra um warning — nunca bloqueia usuários legítimos por falha da API externa.
 */
export async function checkUrlSafety(
  url: string,
  apiKey: string
): Promise<{ safe: boolean; threats: string[] }> {
  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

  const body = {
    client: {clientId: "linkspilot", clientVersion: "1.0"},
    threatInfo: {
      threatTypes: THREAT_TYPES,
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{url}],
    },
  };

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3000),
    });
  } catch (err) {
    // Timeout ou falha de rede — fail-open para não bloquear usuários legítimos
    console.warn("Safe Browsing API unreachable:", err);
    return {safe: true, threats: []};
  }

  if (!response.ok) {
    console.warn("Safe Browsing API error status:", response.status);
    return {safe: true, threats: []};
  }

  const data = (await response.json()) as SafeBrowsingResponse;

  if (!data.matches || data.matches.length === 0) {
    return {safe: true, threats: []};
  }

  return {
    safe: false,
    threats: data.matches.map((m) => m.threatType),
  };
}
