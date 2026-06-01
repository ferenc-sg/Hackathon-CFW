import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, email, brandId, jobFamilyId, role } = await req.json() as {
    name: string;
    email: string;
    brandId: string;
    jobFamilyId: string;
    role: string;
  };

  if (!name || !email || !brandId || !jobFamilyId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  // Resolve competencies for the job family
  const generalComps = await prisma.competency.findMany({
    where: { scope: "GLOBAL", archivedAt: null },
  });
  const jfComps = await prisma.jobFamilyCompetency.findMany({
    where: { jobFamilyId },
    include: { competency: true },
  });
  const allCompIds = [
    ...generalComps.map((c) => c.id),
    ...jfComps.map((jfc) => jfc.competency.id),
  ];

  const user = await prisma.user.create({
    data: {
      name,
      email,
      brandId,
      jobFamilyId,
      role: role ?? "TEAM_MEMBER",
      competencies: {
        create: allCompIds.map((competencyId) => ({ competencyId })),
      },
      todos: {
        create: [
          { title: "Complete career framework onboarding", triggerType: "ONBOARDING" },
          { title: "Read the framework materials", triggerType: "ONBOARDING" },
          { title: "Complete self-levelling exercise", triggerType: "ONBOARDING" },
        ],
      },
    },
  });

  return NextResponse.json(user, { status: 201 });
}
