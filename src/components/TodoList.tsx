"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Todo = { id: string; title: string; triggerType: string };

const TRIGGER_LABELS: Record<string, string> = {
  ONBOARDING: "Onboarding",
  CYCLE: "Cycle",
  MANUAL: "Manual",
};

const TRIGGER_COLORS: Record<string, string> = {
  ONBOARDING: "bg-blue-50 text-blue-600",
  CYCLE: "bg-amber-50 text-amber-600",
  MANUAL: "bg-gray-100 text-gray-500",
};

export default function TodoList({
  pending,
  completed,
}: {
  pending: Todo[];
  completed: Todo[];
}) {
  const router = useRouter();
  const [toggling, setToggling] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const toggle = async (id: string, done: boolean) => {
    setToggling(id);
    await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: done }),
    });
    setToggling(null);
    router.refresh();
  };

  if (pending.length === 0 && completed.length === 0) {
    return <p className="text-sm text-gray-400 italic">No to-dos.</p>;
  }

  return (
    <div className="space-y-2">
      {pending.length === 0 && (
        <p className="text-sm text-gray-400 italic">All done!</p>
      )}
      {pending.map((t) => (
        <TodoItem
          key={t.id}
          todo={t}
          done={false}
          loading={toggling === t.id}
          onToggle={() => toggle(t.id, true)}
        />
      ))}

      {completed.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 mt-2 flex items-center gap-1"
          >
            <svg
              className={`w-3 h-3 transition-transform ${showCompleted ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
            {completed.length} completed
          </button>
          {showCompleted && (
            <div className="mt-2 space-y-2">
              {completed.map((t) => (
                <TodoItem
                  key={t.id}
                  todo={t}
                  done
                  loading={toggling === t.id}
                  onToggle={() => toggle(t.id, false)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TodoItem({
  todo,
  done,
  loading,
  onToggle,
}: {
  todo: Todo;
  done: boolean;
  loading: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`flex items-start gap-2.5 ${done ? "opacity-50" : ""}`}>
      <button
        onClick={onToggle}
        disabled={loading}
        className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
          done
            ? "bg-indigo-600 border-indigo-600"
            : "border-gray-300 hover:border-indigo-400"
        } disabled:opacity-50`}
      >
        {done && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="min-w-0">
        <span className={`text-sm ${done ? "line-through text-gray-400" : "text-gray-700"}`}>
          {todo.title}
        </span>
        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${TRIGGER_COLORS[todo.triggerType] ?? TRIGGER_COLORS.MANUAL}`}>
          {TRIGGER_LABELS[todo.triggerType] ?? todo.triggerType}
        </span>
      </div>
    </div>
  );
}
