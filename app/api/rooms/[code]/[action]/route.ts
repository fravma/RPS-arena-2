import { bodyOf, realCtx, respond, tokenOf } from "@/lib/http";
import { advanceRound, joinRoom, leaveRoom, playMove, startGame } from "@/lib/server";

export const dynamic = "force-dynamic";

/** Actions : join { name }, start, move { move }, next, leave. */
export async function POST(req: Request, { params }: { params: Promise<{ code: string; action: string }> }) {
  const { code, action } = await params;
  const body = await bodyOf(req);
  const token = tokenOf(req);
  return respond(async () => {
    const ctx = realCtx();
    switch (action) {
      case "join": return joinRoom(ctx, code, body.name ?? "");
      case "start": return startGame(ctx, code, token);
      case "move": return playMove(ctx, code, token, body.move ?? "");
      case "next": return advanceRound(ctx, code, token);
      case "leave": return leaveRoom(ctx, code, token);
      default: return { ok: false, error: "Action inconnue" };
    }
  });
}
