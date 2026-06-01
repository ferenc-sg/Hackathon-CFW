"use client";

import { useState } from "react";

type Expectation = {
  levelCode: string;
  levelLabel: string;
  bullets: string[];
};

type Competency = {
  id: string;
  name: string;
  description: string | null;
  provenance: string;
  displayOrder: number;
  expectations: Expectation[];
};

type Props = {
  competencies: Competency[];
  levels: { code: string; label: string }[];
};

export default function CompetencyGrid({ competencies, levels }: Props) {
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleCell = (key: string) => {
    setExpandedCells((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleRow = (compId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(compId)) {
        next.delete(compId);
        // Also collapse individual cells for this row
        setExpandedCells((cells) => {
          const updated = new Set(cells);
          for (const key of updated) {
            if (key.startsWith(compId)) updated.delete(key);
          }
          return updated;
        });
      } else {
        next.add(compId);
        // Expand all cells in this row
        setExpandedCells((cells) => {
          const updated = new Set(cells);
          for (const level of levels) {
            updated.add(`${compId}-${level.code}`);
          }
          return updated;
        });
      }
      return next;
    });
  };

  const expandAll = () => {
    const allCells = new Set<string>();
    const allRows = new Set<string>();
    for (const c of competencies) {
      allRows.add(c.id);
      for (const l of levels) allCells.add(`${c.id}-${l.code}`);
    }
    setExpandedCells(allCells);
    setExpandedRows(allRows);
  };

  const collapseAll = () => {
    setExpandedCells(new Set());
    setExpandedRows(new Set());
  };

  const isAnyExpanded = expandedCells.size > 0;

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">
          {competencies.length} competencies · click a cell to expand bullets
        </p>
        <button
          onClick={isAnyExpanded ? collapseAll : expandAll}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {isAnyExpanded ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {/* Grid table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col className="w-52" />
            {levels.map((l) => (
              <col key={l.code} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Competency
              </th>
              {levels.map((l) => (
                <th
                  key={l.code}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-l border-gray-200"
                >
                  <div className="font-bold text-gray-700">{l.code}</div>
                  <div className="font-normal text-gray-400 normal-case text-[11px] mt-0.5">
                    {l.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {competencies.map((comp, idx) => {
              const isRowExpanded = expandedRows.has(comp.id);
              return (
                <tr
                  key={comp.id}
                  className={`border-b border-gray-100 last:border-0 transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                  }`}
                >
                  {/* Competency name cell */}
                  <td className="px-4 py-3 align-top">
                    <button
                      onClick={() => toggleRow(comp.id)}
                      className="text-left w-full group"
                    >
                      <div className="flex items-start gap-1.5">
                        <svg
                          className={`w-3.5 h-3.5 mt-0.5 text-gray-300 shrink-0 transition-transform ${
                            isRowExpanded ? "rotate-90" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-800 group-hover:text-indigo-700 transition-colors leading-snug">
                          {comp.name}
                        </span>
                      </div>
                      {comp.description && (
                        <p className="text-xs text-gray-400 mt-1 ml-5 leading-relaxed line-clamp-2">
                          {comp.description}
                        </p>
                      )}
                    </button>
                  </td>

                  {/* Level expectation cells */}
                  {levels.map((l) => {
                    const expectation = comp.expectations.find(
                      (e) => e.levelCode === l.code
                    );
                    const cellKey = `${comp.id}-${l.code}`;
                    const isExpanded = expandedCells.has(cellKey);

                    if (!expectation) {
                      return (
                        <td
                          key={l.code}
                          className="px-4 py-3 align-top border-l border-gray-100"
                        >
                          <span className="text-xs text-gray-300 italic">—</span>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={l.code}
                        className="px-4 py-3 align-top border-l border-gray-100"
                      >
                        <button
                          onClick={() => toggleCell(cellKey)}
                          className="text-left w-full group"
                        >
                          {!isExpanded ? (
                            // Collapsed: show first bullet truncated
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 group-hover:text-gray-800 transition-colors">
                              {expectation.bullets[0]}
                              {expectation.bullets.length > 1 && (
                                <span className="text-gray-400">
                                  {" "}
                                  +{expectation.bullets.length - 1} more
                                </span>
                              )}
                            </p>
                          ) : (
                            // Expanded: show all bullets
                            <ul className="space-y-1.5">
                              {expectation.bullets.map((b, bi) => (
                                <li key={bi} className="flex gap-2">
                                  <span className="text-indigo-400 shrink-0 mt-0.5 text-xs">
                                    •
                                  </span>
                                  <span className="text-xs text-gray-700 leading-relaxed">
                                    {b}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
