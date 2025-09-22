import React from "react";

export default function DataTable2({ rows }) {
  // ✅ Column definitions (keys = your row object fields)
  const columns = [
    { key: "ReferenceB", label: "Reference B" },
    { key: "ProjectCode", label: "Project Code" },
    { key: "ItemCode", label: "Item Code" },
    { key: "ItemShortDescription", label: "Description" },
    { key: "SupplierName", label: "Supplier Name" },
    { key: "PONo", label: "PO No." },
    { key: "OrderedLineQuantity", label: "Ordered Qty" },
{ key: "UOM", label: "UOM" },
    { key: "Delivery", label: "Delivery" },
    { key: "InventoryQuantity", label: "Inventory Qty" },
{ key: "InventoryUOM", label: "Inventory UMO" },
    { key: "IndentQuantity", label: "Indent Qty" },
{ key: "IndentUOM", label: "Indent UMO" },
    { key: "IndentPlannedOrder", label: "Indent Planned Order" },
  ];

  // ✅ Copy table to clipboard
  // ✅ Remove empty rows
  const filteredRows = rows.filter((row) => {
    return Object.entries(row).some(([key, value]) => {
      if (value === null || value === undefined) return false;
      const str = String(value).trim();
      return str !== "" && str !== "0" && str.toUpperCase() !== "NA";
    });
  });
  const copyTable = () => {
    if (!rows.length) return;
    const headers = columns.map((col) => col.label);
    let text = headers.join("\t") + "\n";
    filteredRows.forEach((row) => {
      text += columns.map((col) => row[col.key] ?? "").join("\t") + "\n";
    });
    navigator.clipboard
      .writeText(text)
      .then(() => alert("✅ Table copied to clipboard!"))
      .catch(() => alert("❌ Failed to copy"));
  };


  return (
    <div className=" p-3 text-xs rounded-xl   mx-auto">
      {/* Header + Copy Button */}
      <div className="flex justify-between items-center mb-2">
         <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center">
        <span className="h-5 w-1 bg-[var(--primary)] mr-2"></span>
        DATA TABLE
      </h2>

        <button
          onClick={copyTable}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-2 px-4 rounded-lg text-sm flex items-center shadow-md transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          COPY TABLE
        </button>
      </div>

      {/* Table */}
      <div className="overflow-auto border border-gray-700 rounded-lg shadow scrollbar-hide max-h-80"   data-lenis-prevent
>
       <table className="min-w-full table-auto text-xs border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]">
        <thead className="bg-gradient-to-r from-cyan-800 to-indigo-800 sticky -top-1 z-10 text-white">
         <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="py-3 px-2 text-left text-xs font-bold uppercase tracking-wider border-r border-cyan-700 last:border-r-0 whitespace-wrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-6 text-center text-[var(--muted-foreground)]"
                >
                  <div className="flex flex-col items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-gray-500 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm font-medium">NO DATA AVAILABLE</p>
                    <p className="text-xs mt-1">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRows.map((row, index) => (
                <tr
                  key={row.id || index}
                  className="hover:bg-[var(--accent)] transition-colors"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="py-2 px-2 border-r border-gray-700 last:border-r-0 whitespace-wrap text-wrap"
                    >
                      {row[col.key] ?? ""}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
