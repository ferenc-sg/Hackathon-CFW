import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo users...");

  // Get references
  const central = await prisma.brand.findFirst({ where: { name: "Central saas.group" } });
  const pmFamily = await prisma.jobFamily.findFirst({ where: { name: "Product Management" } });
  const icTrack = await prisma.track.findFirst({ where: { name: "IC" } });
  const mTrack = await prisma.track.findFirst({ where: { name: "M" } });

  if (!central || !pmFamily || !icTrack || !mTrack) {
    throw new Error("Run the main seed first: npm run db:seed");
  }

  const ic3 = await prisma.level.findFirst({ where: { code: "IC3" } });
  const ic4 = await prisma.level.findFirst({ where: { code: "IC4" } });
  const m4 = await prisma.level.findFirst({ where: { code: "M4" } });

  // Get all competencies for PM family
  const { generalCompetencies, functionalCompetencies } = await resolveCompetencies(pmFamily.id);
  const allCompetencies = [...generalCompetencies, ...functionalCompetencies];

  // HR Admin
  const admin = await prisma.user.upsert({
    where: { email: "anna@saas.group" },
    update: {},
    create: {
      name: "Anna Bularz",
      email: "anna@saas.group",
      brandId: central.id,
      role: "HR_ADMIN",
      jobFamilyId: pmFamily.id,
      trackId: icTrack.id,
      levelId: ic4!.id,
      growthPath: "ADVANCE_LEVEL",
      growthPathUpdatedAt: new Date("2026-03-01"),
      devPlanFocusAreas: "Strengthen product vision & roadmapping at IC5 level. Focus on cross-functional alignment across brands.",
      devPlanGapNotes: "Market sensitivity — needs more exposure to competitive intelligence processes.",
      devPlanUpdatedAt: new Date("2026-04-15"),
    },
  });

  // Manager
  const manager = await prisma.user.upsert({
    where: { email: "anna@saas.group" },
    update: {},
    create: {
      name: "Anna Bularz",
      email: "anna@saas.group",
      brandId: central.id,
      role: "HR_ADMIN",
    },
  });

  // Team member 1 — IC3 PM
  const alice = await prisma.user.upsert({
    where: { email: "alice@saas.group" },
    update: {},
    create: {
      name: "Alice Chen",
      email: "alice@saas.group",
      brandId: central.id,
      managerId: admin.id,
      role: "TEAM_MEMBER",
      jobFamilyId: pmFamily.id,
      trackId: icTrack.id,
      levelId: ic3!.id,
      growthPath: "ADVANCE_LEVEL",
      growthPathUpdatedAt: new Date("2026-01-10"),
      devPlanFocusAreas: "Develop stronger data fluency — currently relies on analysts. Push toward independent analysis of complex datasets.",
      devPlanGapNotes: "Stakeholder management with senior leadership needs work. Tends to under-communicate delivery risks.",
      devPlanUpdatedAt: new Date("2026-02-20"),
    },
  });

  // Team member 2 — unlevelled, new joiner
  const bob = await prisma.user.upsert({
    where: { email: "bob@saas.group" },
    update: {},
    create: {
      name: "Bob Richter",
      email: "bob@saas.group",
      brandId: central.id,
      managerId: admin.id,
      role: "TEAM_MEMBER",
      jobFamilyId: pmFamily.id,
      trackId: icTrack.id,
      levelId: null,
    },
  });

  // Manager user
  const mgr = await prisma.user.upsert({
    where: { email: "marc@saas.group" },
    update: {},
    create: {
      name: "Marc Svensson",
      email: "marc@saas.group",
      brandId: central.id,
      role: "MANAGER",
      jobFamilyId: pmFamily.id,
      trackId: mTrack.id,
      levelId: m4!.id,
      growthPath: "GROW_IN_LEVEL",
      growthPathUpdatedAt: new Date("2026-01-05"),
    },
  });

  // Assign competencies to Alice (IC3, assessed)
  for (const c of allCompetencies) {
    await prisma.userCompetency.upsert({
      where: { userId_competencyId: { userId: alice.id, competencyId: c.id } },
      update: {},
      create: {
        userId: alice.id,
        competencyId: c.id,
        assessedLevelId: ic3!.id,
        assessedAt: new Date("2026-02-20"),
      },
    });
  }

  // Assign competencies to admin (IC4, assessed)
  for (const c of allCompetencies) {
    await prisma.userCompetency.upsert({
      where: { userId_competencyId: { userId: admin.id, competencyId: c.id } },
      update: {},
      create: {
        userId: admin.id,
        competencyId: c.id,
        assessedLevelId: ic4!.id,
        assessedAt: new Date("2026-04-15"),
      },
    });
  }

  // Assign unassessed competencies to Bob
  for (const c of allCompetencies) {
    await prisma.userCompetency.upsert({
      where: { userId_competencyId: { userId: bob.id, competencyId: c.id } },
      update: {},
      create: {
        userId: bob.id,
        competencyId: c.id,
        assessedLevelId: null,
        assessedAt: null,
      },
    });
  }

  // Levelling history for Alice
  const existing = await prisma.levellingHistoryRecord.findFirst({ where: { userId: alice.id } });
  if (!existing) {
    await prisma.levellingHistoryRecord.create({
      data: {
        userId: alice.id,
        cycleLabel: "Q4 2025 — performance cycle",
        trackId: icTrack.id,
        levelId: ic3!.id,
        method: "MANAGER_MANUAL",
        finalisedById: admin.id,
        finalisedAt: new Date("2025-12-10"),
      },
    });
  }

  // Levelling history for admin
  const adminHistoryExists = await prisma.levellingHistoryRecord.findFirst({ where: { userId: admin.id } });
  if (!adminHistoryExists) {
    await prisma.levellingHistoryRecord.createMany({
      data: [
        {
          userId: admin.id,
          cycleLabel: "Q2 2025 — development cycle",
          trackId: icTrack.id,
          levelId: ic3!.id,
          method: "MANAGER_MANUAL",
          finalisedById: admin.id,
          finalisedAt: new Date("2025-06-15"),
        },
        {
          userId: admin.id,
          cycleLabel: "Q4 2025 — performance cycle",
          trackId: icTrack.id,
          levelId: ic4!.id,
          method: "LEVELLING_FLOW",
          finalisedById: admin.id,
          finalisedAt: new Date("2025-12-10"),
        },
      ],
    });
  }

  // Onboarding todos for Bob
  const bobTodos = await prisma.todoItem.findFirst({ where: { userId: bob.id } });
  if (!bobTodos) {
    await prisma.todoItem.createMany({
      data: [
        { userId: bob.id, title: "Complete career framework onboarding", triggerType: "ONBOARDING" },
        { userId: bob.id, title: "Read the framework materials", triggerType: "ONBOARDING" },
        { userId: bob.id, title: "Complete self-levelling exercise", triggerType: "ONBOARDING" },
      ],
    });
  }

  // Todos for Alice
  const aliceTodos = await prisma.todoItem.findFirst({ where: { userId: alice.id } });
  if (!aliceTodos) {
    await prisma.todoItem.createMany({
      data: [
        {
          userId: alice.id,
          title: "Complete self-assessment for Q2 2026 — development cycle",
          triggerType: "CYCLE",
        },
        {
          userId: alice.id,
          title: "Schedule development conversation with manager",
          triggerType: "MANUAL",
          createdById: admin.id,
        },
      ],
    });
  }

  console.log("Demo users seeded: Anna (HR Admin/IC4), Alice (IC3 PM), Bob (new joiner), Marc (Manager/M4)");
}

// Inline resolveCompetencies for seed context
async function resolveCompetencies(jobFamilyId: string) {
  const generalComps = await prisma.competency.findMany({
    where: { scope: "GLOBAL", archivedAt: null },
    select: { id: true, name: true },
  });
  const jfComps = await prisma.jobFamilyCompetency.findMany({
    where: { jobFamilyId },
    include: { competency: { select: { id: true, name: true } } },
    orderBy: { displayOrder: "asc" },
  });
  return {
    generalCompetencies: generalComps.map((c) => ({ id: c.id, name: c.name })),
    functionalCompetencies: jfComps.map((jfc) => ({ id: jfc.competency.id, name: jfc.competency.name })),
  };
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
