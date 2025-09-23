import React, { useEffect, useState } from "react";

export default function ChartFilters({
  filters,
  setFilters,
  resetFilters,
  rows = [], // default to empty array to prevent crashes
}) {
  const [years, setYears] = useState([]);
  const [items, setItems] = useState([]);

  // 🔹 Extract unique years & items dynamically
  useEffect(() => {
    if (!rows || rows.length === 0) {
      setYears([]);
      setItems([]);
      return;
    }

    const uniqueYears = [
      ...new Set(rows.map((r) => r.Date?.split("-")[0]).filter(Boolean)),
    ].sort((a, b) => b - a); // newest first

    const uniqueItems = [
      ...new Set(rows.map((r) => r.ItemShortDescription).filter(Boolean)),
    ];

    setYears(uniqueYears);
    setItems(uniqueItems);
  }, [rows]);

  return (
    <div className="w-full bg-[#0b1220] p-4 rounded-xl shadow-md flex flex-wrap gap-4 items-center justify-between">
      {/* Time Period */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-300 flex items-center gap-1">
          ⏰ TIME PERIOD:
        </label>
        <select
          className="bg-[#101a2c] text-white px-3 py-2 rounded-md border border-blue-500"
          value={filters.timePeriod}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, timePeriod: e.target.value }))
          }
        >
          <option value="all">All Time</option>
          <option value="last12">Last 12 Months</option>
          <option value="last6">Last 6 Months</option>
          <option value="ytd">Year to Date</option>
        </select>
      </div>

      {/* Value Range */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-300 flex items-center gap-1">
          💰 VALUE RANGE:
        </label>
        <select
          className="bg-[#101a2c] text-white px-3 py-2 rounded-md border border-blue-500"
          value={filters.valueRange}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, valueRange: e.target.value }))
          }
        >
          <option value="all">All Values</option>
          <option value="low">Below 1M</option>
          <option value="mid">1M – 5M</option>
          <option value="high">Above 5M</option>
        </select>
      </div>

      {/* Chart View */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-300 flex items-center gap-1">
          📊 CHART VIEW:
        </label>
        <select
          className="bg-[#101a2c] text-white px-3 py-2 rounded-md border border-blue-500"
          value={filters.chartView}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, chartView: e.target.value }))
          }
        >
          <option value="combined">Bars + Line</option>
          <option value="bar">Bar Only</option>
          <option value="line">Line Only</option>
        </select>
      </div>

      {/* Specific Year */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-300 flex items-center gap-1">
          📅 SPECIFIC YEAR:
        </label>
        <select
          className="bg-[#101a2c] text-white px-3 py-2 rounded-md border border-blue-500"
          value={filters.year}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, year: e.target.value }))
          }
        >
          <option value="all">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Item Filter */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-300 flex items-center gap-1">
          🛠 ITEM FILTER:
        </label>
        <select
          className="bg-[#101a2c] text-white px-3 py-2 rounded-md border border-blue-500"
          value={filters.item}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, item: e.target.value }))
          }
        >
          <option value="all">All Items</option>
          {items.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Clear All Filters */}
      <button
        className="bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold px-5 py-2 rounded-md shadow hover:opacity-90"
        onClick={resetFilters}
      >
        🗑 CLEAR ALL FILTERS
      </button>
    </div>
  );
}
