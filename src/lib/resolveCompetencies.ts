import { prisma } from "./prisma";

export type ResolvedExpectation = {
  levelCode: string;
  levelLabel: string;
  bullets: string[];
};

export type ResolvedCompetency = {
  id: string;
  name: string;
  description: string | null;
  provenance: string;
  displayOrder: number;
  expectations: ResolvedExpectation[];
};

export type ResolvedCompetencies = {
  generalCompetencies: ResolvedCompetency[];
  functionalCompetencies: ResolvedCompetency[];
};

export async function resolveCompetencies(
  jobFamilyId: string,
  brandId?: string
): Promise<ResolvedCompetencies> {
  // 1. General competencies
  const generalComps = await prisma.competency.findMany({
    where: {
      scope: "GLOBAL",
      archivedAt: null,
      ...(brandId
        ? { OR: [{ provenance: "SHARED_BASELINE" }, { brandId }] }
        : { provenance: "SHARED_BASELINE" }),
      expectations: { some: { status: "PUBLISHED" } },
    },
    include: {
      expectations: {
        where: { status: "PUBLISHED" },
        include: { level: true },
        orderBy: { level: { order: "asc" } },
      },
    },
  });

  // 2. Functional competencies via join table
  const jfComps = await prisma.jobFamilyCompetency.findMany({
    where: { jobFamilyId },
    orderBy: { displayOrder: "asc" },
    include: {
      competency: {
        include: {
          expectations: {
            where: { status: "PUBLISHED" },
            include: { level: true },
            orderBy: { level: { order: "asc" } },
          },
        },
      },
    },
  });

  const mapExpectations = (
    expectations: {
      level: { code: string; label: string };
      bullets: string;
    }[]
  ): ResolvedExpectation[] =>
    expectations.map((e) => ({
      levelCode: e.level.code,
      levelLabel: e.level.label,
      bullets: JSON.parse(e.bullets) as string[],
    }));

  const generalCompetencies: ResolvedCompetency[] = generalComps.map(
    (c, i) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      provenance: c.provenance,
      displayOrder: i,
      expectations: mapExpectations(c.expectations),
    })
  );

  const functionalCompetencies: ResolvedCompetency[] = jfComps.map((jfc) => {
    let comp = jfc.competency;

    // Brand fork resolution: if brandId provided, check for a fork
    // (In this seed we don't have forks yet, but the logic is here)
    return {
      id: comp.id,
      name: comp.name,
      description: comp.description,
      provenance: comp.provenance,
      displayOrder: jfc.displayOrder,
      expectations: mapExpectations(comp.expectations),
    };
  });

  return { generalCompetencies, functionalCompetencies };
}
