// Petites aides pour les routes : contexte réel, jeton, réponses JSON.
import { getStore } from "./hashStore";
import type { Ctx } from "./server";

export function realCtx(): Ctx {
  return { store: getStore(), now: () => Date.now(), rng: Math.random };
}

export const tokenOf = (req: Request) => req.headers.get("x-player-token") ?? "";

export async function bodyOf(req: Request): Promise<Record<string, string>> {
  try {
    return (await req.json()) as Record<string, string>;
  } catch {
    return {};
  }
}

/** 200 si ok, 400 avec le message sinon ; 500 si le stockage est indisponible. */
export async function respond(run: () => Promise<{ ok: boolean; error?: string }>) {
  try {
    const result = await run();
    return Response.json(result, { status: result.ok ? 200 : 400 });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
