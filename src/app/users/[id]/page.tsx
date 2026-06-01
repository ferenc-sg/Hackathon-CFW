import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveCompetencies } from "@/lib/resolveCompetencies";
import SetLevelButton from "@/components/SetLevelButton";
import GrowthPathSelect from "@/components/GrowthPathSelect";
import DevPlanEditor from "@/components/DevPlanEditor";
import TodoList from "@/components/TodoList";

const ROLE_LABELS: Record<string, string> = {
  HR_ADMIN: "HR Admin",
  BRAND_ADMIN: "Brand Admin",
  MANAGER: "Manager",
  TEAM_MEMBER: "Team Member",
};

const GROWTH_PATH_LABELS: Record<string, string> = {
  GROW_IN_LEVEL: "Grow within current level",
  ADVANCE_LEVEL: "Advance to next level",
  BECOME_MANAGER: "Become a people manager",
  RETURN_TO_IC: "Return to individual contributor",
  ADJUST_SCOPE: "Adjust scope of current role",
  INTERNAL_MOBILITY: "Internal mobility",
  BECOME_MENTOR: "Become a mentor",
  CHANGE_FAMILY: "Change job family",
};

const METHOD_LABELS: Record<string, string> = {
  LEVELLING_FLOW: "Levelling flow",
  MANAGER_MANUAL: "Manager (manual)",
  HR_ADMIN_MANUAL: "HR Admin (manual)",
};

type Props = { params: Promise<{ id: string }> };

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      brand: true,
      jobFamily: true,
      level: true,
      track: true,
      manager: true,
      competencies: {
        where: { archivedAt: null },
        include: {
          competency: true,
          assessedLevel: true,
        },
      },
      levellingHistory: {
        include: { level: true, track: true, finalisedBy: true },
        orderBy: { finalisedAt: "desc" },
      },
      todos: {
        where: { archivedAt: null },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) notFound();

  // Get all available levels for the set-level UI
  const allLevels = await prisma.level.findMany({
    include: { track: true },
    orderBy: [{ track: { name: "asc" } }, { order: "asc" }],
  });

  // Resolve competency definitions from the library
  const resolved = user.jobFamilyId
    ? await resolveCompetencies(user.jobFamilyId, user.brandId ?? undefined)
    : { generalCompetencies: [], functionalCompetencies: [] };

  // Map competency id -> assessed info
  const assessedMap = new Map(
    user.competencies.map((uc) => [uc.competencyId, uc])
  );

  const pendingTodos = user.todos.filter((t) => !t.completedAt);
  const completedTodos = user.todos.filter((t) => t.completedAt);

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">CF</span>
            </div>
            <span className="font-semibold text-gray-900">Career Framework · saas.group</span>
          </Link>
          <span className="text-gray-300 mx-1">/</span>
          <Link href="/users" className="text-gray-500 hover:text-gray-700 transition-colors">People</Link>
          <span className="text-gray-300 mx-1">/</span>
          <span className="text-gray-500">{user.name}</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full">
        <div className="grid grid-cols-3 gap-6">

          {/* Left column — identity + role + todos */}
          <div className="col-span-1 space-y-5">

            {/* Identity card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-indigo-700">{initials}</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{user.name}</h1>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <dl className="space-y-3 text-sm">
                <Row label="Role" value={ROLE_LABELS[user.role] ?? user.role} />
                <Row label="Brand" value={user.brand?.name ?? "—"} />
                <Row label="Manager" value={user.manager?.name ?? "—"} />
              </dl>
            </div>

            {/* Role & level card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Role & Level
              </h2>
              <dl className="space-y-3 text-sm mb-4">
                <Row label="Job family" value={user.jobFamily?.name ?? "—"} />
                <Row label="Track" value={user.track?.name ?? "—"} />
                <div>
                  <dt className="text-xs text-gray-400 mb-1">Level</dt>
                  <dd className="flex items-center justify-between">
                    <span className={`font-semibold ${user.level ? "text-gray-900" : "text-gray-400 italic"}`}>
                      {user.level
                        ? `${user.level.code} · ${user.level.label}`
                        : "N/A — not yet levelled"}
                    </span>
                  </dd>
                </div>
              </dl>
              <SetLevelButton
                userId={user.id}
                currentLevelId={user.levelId}
                currentTrackId={user.trackId}
                levels={allLevels}
              />
            </div>

            {/* Growth path card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Growth Path
              </h2>
              <GrowthPathSelect
                userId={user.id}
                currentPath={user.growthPath}
                updatedAt={user.growthPathUpdatedAt?.toISOString() ?? null}
              />
            </div>

            {/* To-do list */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                To-dos
                {pendingTodos.length > 0 && (
                  <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full px-1.5 py-0.5">
                    {pendingTodos.length}
                  </span>
                )}
              </h2>
              <TodoList
                pending={pendingTodos.map((t) => ({ id: t.id, title: t.title, triggerType: t.triggerType }))}
                completed={completedTodos.map((t) => ({ id: t.id, title: t.title, triggerType: t.triggerType }))}
              />
            </div>
          </div>

          {/* Right column — competencies + dev plan + history */}
          <div className="col-span-2 space-y-5">

            {/* General competencies */}
            {resolved.generalCompetencies.length > 0 && (
              <CompetencySection
                title="General Competencies"
                description="Shared across all roles — non-removable standard."
                badge="SHARED BASELINE"
                badgeClass="bg-indigo-50 text-indigo-700 border-indigo-200"
                competencies={resolved.generalCompetencies}
                assessedMap={assessedMap}
              />
            )}

            {/* Functional competencies */}
            {resolved.functionalCompetencies.length > 0 && (
              <CompetencySection
                title={`${user.jobFamily?.name ?? "Functional"} Competencies`}
                description="Specific to this job family, for both IC and Manager tracks."
                badge="FUNCTIONAL"
                badgeClass="bg-emerald-50 text-emerald-700 border-emerald-200"
                competencies={resolved.functionalCompetencies}
                assessedMap={assessedMap}
              />
            )}

            {resolved.generalCompetencies.length === 0 && resolved.functionalCompetencies.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 shadow-sm">
                <p className="text-sm">No competencies assigned. Set a job family to load the competency set.</p>
              </div>
            )}

            {/* Development plan */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Development Plan
                </h2>
                {user.devPlanUpdatedAt && (
                  <span className="text-xs text-gray-400">
                    Updated {new Date(user.devPlanUpdatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </div>
              <DevPlanEditor
                userId={user.id}
                focusAreas={user.devPlanFocusAreas ?? ""}
                gapNotes={user.devPlanGapNotes ?? ""}
              />
            </div>

            {/* Levelling history */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Levelling History
              </h2>
              {user.levellingHistory.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No levelling history yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-100">
                      <th className="text-left pb-2 font-medium">Date</th>
                      <th className="text-left pb-2 font-medium">Cycle</th>
                      <th className="text-left pb-2 font-medium">Track</th>
                      <th className="text-left pb-2 font-medium">Level</th>
                      <th className="text-left pb-2 font-medium">Method</th>
                      <th className="text-left pb-2 font-medium">By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.levellingHistory.map((h) => (
                      <tr key={h.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-2.5 text-gray-500 pr-4 whitespace-nowrap">
                          {new Date(h.finalisedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                        </td>
                        <td className="py-2.5 text-gray-600 pr-4">{h.cycleLabel}</td>
                        <td className="py-2.5 text-gray-600 pr-4">{h.track.name}</td>
                        <td className="py-2.5 font-semibold text-gray-900 pr-4">{h.level.code}</td>
                        <td className="py-2.5 pr-4">
                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {METHOD_LABELS[h.method] ?? h.method}
                          </span>
                        </td>
                        <td className="py-2.5 text-gray-500">{h.finalisedBy.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
      <dd className="font-medium text-gray-800">{value}</dd>
    </div>
  );
}

function CompetencySection({
  title,
  description,
  badge,
  badgeClass,
  competencies,
  assessedMap,
}: {
  title: string;
  description: string;
  badge: string;
  badgeClass: string;
  competencies: { id: string; name: string; description: string | null }[];
  assessedMap: Map<string, { assessedLevel: { code: string; label: string } | null; assessedAt: Date | null }>;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
            <span className={`text-xs font-medium border px-2 py-0.5 rounded-full ${badgeClass}`}>
              {badge}
            </span>
          </div>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {competencies.map((comp) => {
          const assessed = assessedMap.get(comp.id);
          const level = assessed?.assessedLevel;
          const assessedAt = assessed?.assessedAt;
          return (
            <div key={comp.id} className="px-5 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{comp.name}</div>
                {comp.description && (
                  <div className="text-xs text-gray-400 truncate mt-0.5">{comp.description}</div>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {level ? (
                  <>
                    <span className="text-sm font-semibold text-gray-900">{level.code}</span>
                    <span className="text-xs text-gray-400">{level.label}</span>
                    {assessedAt && (
                      <span className="text-xs text-gray-300">
                        {new Date(assessedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-gray-400 italic">N/A</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
