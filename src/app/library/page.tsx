import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { resolveCompetencies } from "@/lib/resolveCompetencies";
import CompetencyGrid from "@/components/CompetencyGrid";

type Props = {
  searchParams: Promise<{ family?: string; track?: string }>;
};

export default async function LibraryPage({ searchParams }: Props) {
  const params = await searchParams;

  const jobFamilies = await prisma.jobFamily.findMany({
    where: { archivedAt: null },
    orderBy: { displayOrder: "asc" },
  });

  const tracks = await prisma.track.findMany({ orderBy: { name: "asc" } });
  const icTrack = tracks.find((t) => t.name === "IC")!;
  const mTrack = tracks.find((t) => t.name === "M")!;

  const activeFamily = params.family ?? null;
  const activeTrack = params.track ?? "IC";

  // Decide which section to show
  const isGeneralView = !activeFamily || activeFamily === "general";

  let competencies = null;
  let levels: { code: string; label: string }[] = [];

  if (isGeneralView) {
    // General competencies for the selected track
    const trackRecord = activeTrack === "M" ? mTrack : icTrack;
    const trackLevels = await prisma.level.findMany({
      where: { trackId: trackRecord.id },
      orderBy: { order: "asc" },
    });
    levels = trackLevels.map((l) => ({ code: l.code, label: l.label }));

    const generalComps = await prisma.competency.findMany({
      where: { scope: "GLOBAL", archivedAt: null },
      include: {
        expectations: {
          where: {
            status: "PUBLISHED",
            levelId: { in: trackLevels.map((l) => l.id) },
          },
          include: { level: true },
          orderBy: { level: { order: "asc" } },
        },
      },
    });

    competencies = generalComps.map((c, i) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      provenance: c.provenance,
      displayOrder: i,
      expectations: c.expectations.map((e) => ({
        levelCode: e.level.code,
        levelLabel: e.level.label,
        bullets: JSON.parse(e.bullets) as string[],
      })),
    }));
  } else {
    // Functional competencies for selected job family — always IC track for now
    const trackRecord = activeTrack === "M" ? mTrack : icTrack;
    const trackLevels = await prisma.level.findMany({
      where: { trackId: trackRecord.id },
      orderBy: { order: "asc" },
    });
    levels = trackLevels.map((l) => ({ code: l.code, label: l.label }));

    const resolved = await resolveCompetencies(activeFamily);
    competencies = resolved.functionalCompetencies;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">CF</span>
            </div>
            <span className="font-semibold text-gray-900">
              Career Framework · saas.group
            </span>
          </Link>
          <span className="text-gray-300 mx-1">/</span>
          <span className="text-gray-500">Framework Library</span>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-gray-200 bg-white px-3 py-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            General
          </p>
          <nav className="space-y-0.5 mb-6">
            <SidebarLink
              href={`/library?family=general&track=IC`}
              active={isGeneralView && activeTrack !== "M"}
              label="General — IC track"
            />
            <SidebarLink
              href={`/library?family=general&track=M`}
              active={isGeneralView && activeTrack === "M"}
              label="General — Manager track"
            />
          </nav>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Job families
          </p>
          <nav className="space-y-0.5">
            {jobFamilies.map((jf) => (
              <SidebarLink
                key={jf.id}
                href={`/library?family=${jf.id}&track=IC`}
                active={activeFamily === jf.id}
                label={jf.name}
              />
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-x-auto">
          <div className="px-8 py-6">
            {/* Section title */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900">
                  {isGeneralView
                    ? `General Competencies — ${activeTrack === "M" ? "Manager" : "IC"} Track`
                    : jobFamilies.find((jf) => jf.id === activeFamily)?.name ??
                      "Job Family"}
                </h1>
                {isGeneralView && (
                  <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">
                    SHARED BASELINE
                  </span>
                )}
                {!isGeneralView && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                    FUNCTIONAL
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {isGeneralView
                  ? "Applies to all roles regardless of job family. These five competencies are a non-removable shared standard."
                  : "Competencies specific to this job family, for both IC and Manager tracks."}
              </p>
            </div>

            {/* Track toggle for functional families */}
            {!isGeneralView && (
              <div className="flex gap-2 mb-5">
                <Link
                  href={`/library?family=${activeFamily}&track=IC`}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    activeTrack !== "M"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  IC Track (IC2–IC5)
                </Link>
                <Link
                  href={`/library?family=${activeFamily}&track=M`}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    activeTrack === "M"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Manager Track (M4–M6)
                </Link>
              </div>
            )}

            {/* Competency grid */}
            {competencies && competencies.length > 0 ? (
              <CompetencyGrid competencies={competencies} levels={levels} />
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p className="text-sm">No competencies found for this view.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? "bg-indigo-50 text-indigo-700 font-medium"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );
}
