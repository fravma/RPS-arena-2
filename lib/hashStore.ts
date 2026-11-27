// Stockage : une salle = un « hash » Redis (une clé, des champs).
// Chaque écriture touche un seul champ, donc deux joueurs n'écrasent jamais le travail de l'autre.

import { Redis } from "@upstash/redis";

export interface HashStore {
  getAll(key: string): Promise<Record<string, string> | null>;
  /** Écrit le champ seulement s'il n'existe pas encore. Renvoie true si écrit. */
  setIfAbsent(key: string, field: string, value: string): Promise<boolean>;
  set(key: string, fields: Record<string, string>): Promise<void>;
  /** Incrémente un compteur de façon atomique et renvoie la nouvelle valeur. */
  increment(key: string, field: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
}

/** Faux stockage en mémoire : tests et vérification locale. */
export class MemoryHashStore implements HashStore {
  private data = new Map<string, Record<string, string>>();

  async getAll(key: string) {
    const h = this.data.get(key);
    return h ? { ...h } : null;
  }

  async setIfAbsent(key: string, field: string, value: string) {
    const h = this.data.get(key) ?? {};
    if (field in h) return false;
    h[field] = value;
    this.data.set(key, h);
    return true;
  }

  async set(key: string, fields: Record<string, string>) {
    this.data.set(key, { ...(this.data.get(key) ?? {}), ...fields });
  }

  async increment(key: string, field: string) {
    const h = this.data.get(key) ?? {};
    h[field] = String(Number(h[field] ?? 0) + 1);
    this.data.set(key, h);
    return Number(h[field]);
  }

  async expire() {
    // Pas d'expiration en mémoire : sans objet pour les tests.
  }
}

/**
 * Sans désérialisation automatique, le client Upstash renvoie HGETALL sous forme de liste
 * [champ, valeur, champ, valeur...] et non d'objet (constaté sur la preview T2a).
 */
export function pairsToObject(raw: unknown): Record<string, string> | null {
  if (!raw) return null;
  const out: Record<string, string> = {};
  if (Array.isArray(raw)) {
    for (let i = 0; i + 1 < raw.length; i += 2) out[String(raw[i])] = String(raw[i + 1]);
  } else {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) out[k] = String(v);
  }
  return Object.keys(out).length > 0 ? out : null;
}

/** Stockage Redis (Upstash, via la Marketplace Vercel). */
export class UpstashHashStore implements HashStore {
  constructor(private redis: Redis) {}

  async getAll(key: string) {
    return pairsToObject(await this.redis.hgetall(key));
  }

  async setIfAbsent(key: string, field: string, value: string) {
    return (await this.redis.hsetnx(key, field, value)) === 1;
  }

  async set(key: string, fields: Record<string, string>) {
    await this.redis.hset(key, fields);
  }

  async increment(key: string, field: string) {
    return Number(await this.redis.hincrby(key, field, 1));
  }

  async expire(key: string, seconds: number) {
    await this.redis.expire(key, seconds);
  }
}

const g = globalThis as unknown as { __rpsMemoryStore?: MemoryHashStore };

/**
 * Redis si les variables de l'intégration Vercel sont présentes,
 * faux stockage en mémoire si RPS_MEMORY_STORE=1 (vérification locale), sinon erreur explicite.
 */
export function getStore(): HashStore {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return new UpstashHashStore(new Redis({ url, token, automaticDeserialization: false }));
  if (process.env.RPS_MEMORY_STORE === "1") return (g.__rpsMemoryStore ??= new MemoryHashStore());
  throw new Error("Base Redis non configurée (variables KV_REST_API_URL et KV_REST_API_TOKEN absentes)");
}
