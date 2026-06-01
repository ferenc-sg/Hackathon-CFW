import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const jobFamilies = await prisma.jobFamily.findMany({
    where: { archivedAt: null },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">CF</span>
          </div>
          <span className="font-semibold text-gray-900">
            Career Framework · saas.group
          </span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Career Framework
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            The single source of truth for competencies, levels, and growth
            paths across saas.group. Browse the framework library or view your
            profile.
          </p>
        </div>

        {/* Nav cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <Link
            href="/library"
            className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900 mb-1">
              Framework Library
            </h2>
            <p className="text-sm text-gray-500">
              Browse all competencies, levels, and job families. The structured
              source of truth.
            </p>
          </Link>

          <div className="bg-white rounded-xl border border-gray-200 p-6 opacity-50 cursor-not-allowed">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900 mb-1">
              User Profile
              <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                coming soon
              </span>
            </h2>
            <p className="text-sm text-gray-500">
              Your personal career record — assessed levels, growth path, and
              development plan.
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
            Framework at a glance
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold text-gray-900">5</div>
              <div className="text-sm text-gray-500 mt-0.5">
                General competencies
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {jobFamilies.length}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">Job families</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">7</div>
              <div className="text-sm text-gray-500 mt-0.5">
                Levels (IC2–IC5, M4–M6)
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
