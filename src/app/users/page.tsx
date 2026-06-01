import Link from "next/link";
import { prisma } from "@/lib/prisma";

const ROLE_LABELS: Record<string, string> = {
  HR_ADMIN: "HR Admin",
  BRAND_ADMIN: "Brand Admin",
  MANAGER: "Manager",
  TEAM_MEMBER: "Team Member",
};

const ROLE_COLORS: Record<string, string> = {
  HR_ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
  BRAND_ADMIN: "bg-blue-50 text-blue-700 border-blue-200",
  MANAGER: "bg-amber-50 text-amber-700 border-amber-200",
  TEAM_MEMBER: "bg-gray-50 text-gray-600 border-gray-200",
};

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    where: { archivedAt: null },
    include: {
      brand: true,
      jobFamily: true,
      level: true,
      track: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">CF</span>
              </div>
              <span className="font-semibold text-gray-900">Career Framework · saas.group</span>
            </Link>
            <span className="text-gray-300 mx-1">/</span>
            <span className="text-gray-500">People</span>
          </div>
          <Link
            href="/users/new"
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add person
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">People</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} members</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Job family</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                >
                  <td className="px-5 py-3.5">
                    <Link href={`/users/${user.id}`} className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-indigo-700">
                          {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium border px-2 py-0.5 rounded-full ${ROLE_COLORS[user.role] ?? ROLE_COLORS.TEAM_MEMBER}`}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">
                    {user.jobFamily?.name ?? <span className="text-gray-300 italic">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    {user.level ? (
                      <span className="text-sm font-medium text-gray-800">
                        {user.level.code}
                        <span className="text-gray-400 font-normal ml-1 text-xs">{user.level.label}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {user.brand?.name ?? <span className="text-gray-300 italic">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
