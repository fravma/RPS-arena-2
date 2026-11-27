import { bodyOf, realCtx, respond } from "@/lib/http";
import { createRoom } from "@/lib/server";

export const dynamic = "force-dynamic";

/** Créer une salle. Corps : { name }. */
export async function POST(req: Request) {
  const { name = "" } = await bodyOf(req);
  return respond(() => createRoom(realCtx(), name));
}
