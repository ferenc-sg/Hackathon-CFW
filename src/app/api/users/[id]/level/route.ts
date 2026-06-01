import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json() as { levelId: string; trackId: string; cycleLabel: string; method: string; finalisedById: string };
  const { levelId, trackId, cycleLabel, method, finalisedById } = body;

  if (!levelId || !trackId || !cycleLabel || !method || !finalisedById) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { levelId, trackId },
  });

  await prisma.levellingHistoryRecord.create({
    data: { userId: id, levelId, trackId, cycleLabel, method, finalisedById },
  });

  return NextResponse.json(user);
}
