import React from "react";

export default function Filters({ filters, setFilters, applyFilters, rows }) {
  const { search, projectCode, itemCode, description } = filters;

  return (
    <div >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* General Search */}
        <input
          type="text"
          placeholder="General Search"
          value={search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="p-2 rounded bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)]"
        />

        {/* Project Code Dropdown */}
        <select
          value={projectCode}
          onChange={(e) =>
            setFilters({ ...filters, projectCode: e.target.value })
          }
          className="p-2 rounded bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)]"
        >
          <option value="">All Project Codes</option>
          {[...new Set(rows.map((r) => r.ProjectCode || r.PROJECT_NO))].map(
            (pc) => (
              <option key={pc} value={pc}>
                {pc}
              </option>
            )
          )}
        </select>

        {/* Item Code Dropdown */}
        <select
          value={itemCode}
          onChange={(e) => setFilters({ ...filters, itemCode: e.target.value })}
          className="p-2 rounded bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)]"
        >
          <option value="">All Item Codes</option>
          {[...new Set(rows.map((r) => r.ItemCode || r.ITEM_CODE))].map((ic) => (
            <option key={ic} value={ic}>
              {ic}
            </option>
          ))}
        </select>

        {/* Description */}
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setFilters({ ...filters, description: e.target.value })
          }
          className="p-2 rounded bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)]"
        />
      </div>

      {/* Apply Filters Button */}
      <button
        onClick={applyFilters}
        className="mt-4 bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] px-4 py-2 rounded-lg font-semibold shadow-md transition"
      >
        Apply Filters
      </button>
    </div>
  );
}
