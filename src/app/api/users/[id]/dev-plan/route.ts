import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { devPlanFocusAreas, devPlanGapNotes } = await req.json() as {
    devPlanFocusAreas: string;
    devPlanGapNotes: string;
  };

  const user = await prisma.user.update({
    where: { id },
    data: { devPlanFocusAreas, devPlanGapNotes, devPlanUpdatedAt: new Date() },
  });

  return NextResponse.json(user);
}
