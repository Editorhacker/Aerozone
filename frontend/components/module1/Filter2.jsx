import React, { useMemo } from "react";

export default function Filters({ filters, setFilters, applyFilters, rows }) {
  const { search, projectCode, itemCode, description, refStart, refEnd } = filters;

  // 🔹 Generate dropdown values dynamically from rows (memoized for performance)
  const projectCodes = useMemo(
    () => [...new Set(rows.map((r) => r.ProjectCode || r.PROJECT_NO))].filter(Boolean),
    [rows]
  );

  const itemCodes = useMemo(
    () => [...new Set(rows.map((r) => r.ItemCode || r.ITEM_CODE))].filter(Boolean),
    [rows]
  );

 return (
  <div className="mb-2 p-3 ">
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
      {/* General Search */}
      <input
        type="text"
        placeholder="🔍 General Search"
        value={search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        className="p-3 rounded-lg bg-[var(--background)] border border-[var(--muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
      />

      {/* ReferenceB Start */}
      <input
        type="number"
        placeholder="Ref B Start"
        value={refStart}
        onChange={(e) => setFilters({ ...filters, refStart: e.target.value })}
        className="p-3 rounded-lg bg-[var(--background)] border border-[var(--muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
      />

      {/* ReferenceB End */}
      <input
        type="number"
        placeholder="Ref B End"
        value={refEnd}
        onChange={(e) => setFilters({ ...filters, refEnd: e.target.value })}
        className="p-3 rounded-lg bg-[var(--background)] border border-[var(--muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
      />

      {/* Project Code Dropdown */}
      <select
        value={projectCode}
        onChange={(e) => setFilters({ ...filters, projectCode: e.target.value })}
        className="p-3 rounded-lg bg-[var(--background)] border border-[var(--muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
      >
        <option value="">All Project Codes</option>
        {projectCodes.map((pc) => (
          <option key={pc} value={pc}>
            {pc}
          </option>
        ))}
      </select>

      {/* Item Code Dropdown */}
      <select
        value={itemCode}
        onChange={(e) => setFilters({ ...filters, itemCode: e.target.value })}
        className="p-3 rounded-lg bg-[var(--background)] border border-[var(--muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
      >
        <option value="">All Item Codes</option>
        {itemCodes.map((ic) => (
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
        onChange={(e) => setFilters({ ...filters, description: e.target.value })}
        className="p-3 rounded-lg bg-[var(--background)] border border-[var(--muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
      />
    </div>

    <button
      onClick={applyFilters}
      className="mt-6 w-full md:w-auto bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-medium px-6 py-3 rounded-lg shadow-md transition"
    >
      Apply Filters
    </button>
  </div>
);
}