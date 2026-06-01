import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RegisterForm from "@/components/RegisterForm";

export default async function NewUserPage() {
  const [brands, jobFamilies] = await Promise.all([
    prisma.brand.findMany({ where: { archivedAt: null }, orderBy: { name: "asc" } }),
    prisma.jobFamily.findMany({ where: { archivedAt: null }, orderBy: { displayOrder: "asc" } }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">CF</span>
            </div>
            <span className="font-semibold text-gray-900">Career Framework · saas.group</span>
          </Link>
          <span className="text-gray-300 mx-1">/</span>
          <Link href="/users" className="text-gray-500 hover:text-gray-700">People</Link>
          <span className="text-gray-300 mx-1">/</span>
          <span className="text-gray-500">Add person</span>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add a person</h1>
        <p className="text-sm text-gray-500 mb-8">
          Creates a user profile and automatically assigns competencies from their job family.
          Onboarding to-dos are created on registration.
        </p>
        <RegisterForm brands={brands} jobFamilies={jobFamilies} />
      </main>
    </div>
  );
}
