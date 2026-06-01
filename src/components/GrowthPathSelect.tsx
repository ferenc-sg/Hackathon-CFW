"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PATHS = [
  { value: "GROW_IN_LEVEL", label: "Grow within current level" },
  { value: "ADVANCE_LEVEL", label: "Advance to next level" },
  { value: "BECOME_MANAGER", label: "Become a people manager" },
  { value: "RETURN_TO_IC", label: "Return to individual contributor" },
  { value: "ADJUST_SCOPE", label: "Adjust scope of current role" },
  { value: "INTERNAL_MOBILITY", label: "Internal mobility" },
  { value: "BECOME_MENTOR", label: "Become a mentor" },
  { value: "CHANGE_FAMILY", label: "Change job family" },
];

export default function GrowthPathSelect({
  userId,
  currentPath,
  updatedAt,
}: {
  userId: string;
  currentPath: string | null;
  updatedAt: string | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentPath ?? "");
  const [saving, setSaving] = useState(false);

  const handleChange = async (value: string) => {
    setSelected(value);
    setSaving(true);
    await fetch(`/api/users/${userId}/growth-path`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ growthPath: value }),
    });
    setSaving(false);
    router.refresh();
  };

  const currentLabel = PATHS.find((p) => p.value === selected)?.label;

  return (
    <div className="space-y-2">
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <option value="">— Not set —</option>
        {PATHS.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
      {updatedAt && currentLabel && (
        <p className="text-xs text-gray-400">
          Last updated {new Date(updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      )}
      {saving && <p className="text-xs text-indigo-500">Saving…</p>}
    </div>
  );
}
