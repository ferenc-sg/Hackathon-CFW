import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { completed } = await req.json() as { completed: boolean };

  const todo = await prisma.todoItem.update({
    where: { id },
    data: { completedAt: completed ? new Date() : null },
  });

  return NextResponse.json(todo);
}
