import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const normalizeKey = (k = "") => String(k).replace(/\s|_|-/g, "").toLowerCase();

const findRowValue = (row = {}, candidates = []) => {
  for (const c of candidates) {
    if (row[c] !== undefined && row[c] !== null && String(row[c]).trim() !== "") {
      return String(row[c]).trim();
    }
  }
  const map = {};
  Object.keys(row).forEach((k) => (map[normalizeKey(k)] = k));
  for (const c of candidates) {
    const nk = normalizeKey(c);
    if (map[nk]) return String(row[map[nk]]).trim();
  }
  return "";
};

export default function DonutChart({ filteredRows = [], filteredIndentRows = [] }) {
  const { labels, datasets, percentage, debug } = useMemo(() => {
    // get unique normalized item codes from filteredRows (main / Excel)
    const excelCodesSet = new Set(
      filteredRows
        .map((r) => findRowValue(r, ["ItemCode", "ITEM_CODE", "Item Code", "BOI Item code", "itemcode"]))
        .filter(Boolean)
        .map((s) => s.toUpperCase())
    );

    // get indent item codes (unique)
    const indentCodesArr = filteredIndentRows
      .map((r) => findRowValue(r, ["ItemCode", "ITEM_CODE", "Item Code", "BOI Item code", "itemcode"]))
      .filter(Boolean)
      .map((s) => s.toUpperCase());

    const uniqueIndent = Array.from(new Set(indentCodesArr));
    const totalUniqueIndent = uniqueIndent.length;

    const matchedUniqueCount = uniqueIndent.filter((c) => excelCodesSet.has(c)).length;
    const unmatchedUniqueCount = Math.max(0, totalUniqueIndent - matchedUniqueCount);

    // debug info
    const debugInfo = {
      filteredRows: filteredRows.length,
      filteredIndentRows: filteredIndentRows.length,
      uniqueExcelCount: excelCodesSet.size,
      uniqueIndentCount: totalUniqueIndent,
      matchedUniqueCount,
      unmatchedUniqueCount,
    };

    const labels = ["Matched Item Codes", "Unmatched Item Codes"];
    const datasets = [
      {
        data: [matchedUniqueCount, unmatchedUniqueCount],
        // do not hard-code colors if you prefer to keep defaults — here they're explicit for clarity
        backgroundColor: ["#00FFA3", "#FF4D4D"],
        hoverBackgroundColor: ["#00FFA3", "#FF4D4D"],
        borderWidth: 2,
      },
    ];

    const percentage = totalUniqueIndent === 0 ? 0 : Math.round((matchedUniqueCount / totalUniqueIndent) * 100);

    return { labels, datasets, percentage, debug: debugInfo };
  }, [filteredRows, filteredIndentRows]);

  // If no indent items in the filtered set, show a small message instead of a blank donut
  const total = datasets[0].data.reduce((a, b) => a + b, 0);
  if (total === 0) {
    return (
      <div className="w-72 h-72 flex items-center justify-center bg-gray-800/50 rounded-xl p-4">
        <div className="text-center">
          <div className="text-sm text-gray-300 mb-1">No indent items for the selected filter</div>
          <div className="text-xs text-gray-400">Try clearing ReferenceB or other filters</div>
        </div>
      </div>
    );
  }

  // helpful console debug (remove when satisfied)
  // eslint-disable-next-line no-console
  console.debug("Donut debug:", { labels, datasets, percentage });

  return (
    <div className=" p-6 rounded-2xl border  w-full max-w-[40vw] mx-auto shadow-lg">
    <div className="relative w-72 h-72 flex items-center justify-center">
      <Doughnut data={{ labels, datasets }} />
      <div className="absolute text-[var(--forground)] text-xl font-bold">{percentage}%</div>
    </div>
    </div>
  );
}
