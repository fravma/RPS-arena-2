import { realCtx, respond, tokenOf } from "@/lib/http";
import { getView } from "@/lib/server";

export const dynamic = "force-dynamic";

/** État de la salle vu par le joueur du jeton (appelé toutes les 2 s). */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return respond(() => getView(realCtx(), code, tokenOf(req)));
}
