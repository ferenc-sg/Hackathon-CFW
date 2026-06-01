"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Brand = { id: string; name: string };
type JobFamily = { id: string; name: string };

export default function RegisterForm({
  brands,
  jobFamilies,
}: {
  brands: Brand[];
  jobFamilies: JobFamily[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    brandId: brands[0]?.id ?? "",
    jobFamilyId: jobFamilies[0]?.id ?? "",
    role: "TEAM_MEMBER",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json() as { error: string };
      setError(data.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    const user = await res.json() as { id: string };
    router.push(`/users/${user.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Full name">
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Jane Smith"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </Field>

      <Field label="Email">
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="jane@saas.group"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </Field>

      <Field label="Brand / Team">
        <select
          value={form.brandId}
          onChange={(e) => setForm({ ...form, brandId: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        >
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </Field>

      <Field label="Job family">
        <select
          value={form.jobFamilyId}
          onChange={(e) => setForm({ ...form, jobFamilyId: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        >
          {jobFamilies.map((jf) => (
            <option key={jf.id} value={jf.id}>{jf.name}</option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-1">
          Competencies are automatically assigned from the framework library.
        </p>
      </Field>

      <Field label="Permission level">
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        >
          <option value="TEAM_MEMBER">Team Member</option>
          <option value="MANAGER">Manager</option>
          <option value="BRAND_ADMIN">Brand / Team Admin</option>
          <option value="HR_ADMIN">HR Admin</option>
        </select>
      </Field>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add person"}
        </button>
        <a
          href="/users"
          className="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
