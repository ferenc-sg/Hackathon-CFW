"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DevPlanEditor({
  userId,
  focusAreas,
  gapNotes,
}: {
  userId: string;
  focusAreas: string;
  gapNotes: string;
}) {
  const router = useRouter();
  const [focus, setFocus] = useState(focusAreas);
  const [gaps, setGaps] = useState(gapNotes);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const isDirty = focus !== focusAreas || gaps !== gapNotes;

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/users/${userId}/dev-plan`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ devPlanFocusAreas: focus, devPlanGapNotes: gaps }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  };

  const handleCancel = () => {
    setFocus(focusAreas);
    setGaps(gapNotes);
    setEditing(false);
  };

  if (!editing && !focus && !gaps) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-400 italic mb-3">No development plan yet.</p>
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
        >
          Add development plan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">Focus areas</label>
        {editing ? (
          <textarea
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            rows={3}
            placeholder="Specific competencies or behaviours being developed…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {focus || <span className="text-gray-400 italic">Not set</span>}
          </p>
        )}
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">Gap notes</label>
        {editing ? (
          <textarea
            value={gaps}
            onChange={(e) => setGaps(e.target.value)}
            rows={3}
            placeholder="Gaps identified during levelling…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {gaps || <span className="text-gray-400 italic">Not set</span>}
          </p>
        )}
      </div>
      {editing ? (
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={handleCancel}
            className="text-sm text-gray-500 px-4 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
        >
          Edit
        </button>
      )}
    </div>
  );
}
