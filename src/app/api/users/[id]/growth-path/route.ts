import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { growthPath } = await req.json() as { growthPath: string };

  const user = await prisma.user.update({
    where: { id },
    data: { growthPath, growthPathUpdatedAt: new Date() },
  });

  return NextResponse.json(user);
}
