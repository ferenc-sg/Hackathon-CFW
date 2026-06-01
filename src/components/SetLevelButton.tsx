"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Level = {
  id: string;
  code: string;
  label: string;
  track: { id: string; name: string };
};

type Props = {
  userId: string;
  currentLevelId: string | null;
  currentTrackId: string | null;
  levels: Level[];
};

export default function SetLevelButton({ userId, currentLevelId, levels }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState(currentLevelId ?? "");
  const [cycleLabel, setCycleLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const icLevels = levels.filter((l) => l.track.name === "IC");
  const mLevels = levels.filter((l) => l.track.name === "M");

  const handleSave = async () => {
    if (!selectedLevelId || !cycleLabel.trim()) {
      setError("Select a level and enter a cycle label.");
      return;
    }
    setError(null);
    setSaving(true);

    const level = levels.find((l) => l.id === selectedLevelId)!;

    const res = await fetch(`/api/users/${userId}/level`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        levelId: selectedLevelId,
        trackId: level.track.id,
        cycleLabel,
        method: "HR_ADMIN_MANUAL",
        finalisedById: userId,
      }),
    });

    if (!res.ok) {
      setError("Failed to update level.");
      setSaving(false);
      return;
    }

    setOpen(false);
    setSaving(false);
    router.refresh();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-sm text-indigo-600 border border-indigo-200 rounded-lg py-2 hover:bg-indigo-50 transition-colors font-medium"
      >
        Set level
      </button>
    );
  }

  return (
    <div className="space-y-3 pt-1">
      <div>
        <label className="text-xs text-gray-500 mb-1 block">IC Track</label>
        <div className="grid grid-cols-2 gap-1.5">
          {icLevels.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLevelId(l.id)}
              className={`text-xs py-1.5 px-2 rounded-lg border transition-colors text-left ${
                selectedLevelId === l.id
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300"
              }`}
            >
              <span className="font-semibold">{l.code}</span>
              <span className={`block ${selectedLevelId === l.id ? "text-indigo-200" : "text-gray-400"}`}>
                {l.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Manager Track</label>
        <div className="grid grid-cols-3 gap-1.5">
          {mLevels.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLevelId(l.id)}
              className={`text-xs py-1.5 px-2 rounded-lg border transition-colors text-left ${
                selectedLevelId === l.id
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300"
              }`}
            >
              <span className="font-semibold">{l.code}</span>
              <span className={`block ${selectedLevelId === l.id ? "text-indigo-200" : "text-gray-400"}`}>
                {l.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Cycle label</label>
        <input
          type="text"
          placeholder="e.g. Q2 2026 — development cycle"
          value={cycleLabel}
          onChange={(e) => setCycleLabel(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-indigo-600 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Confirm"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-3 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
