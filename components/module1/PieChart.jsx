import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieCharts({ rows, indentRows }) {

 

    // ✅ Helper to group by ProjectCode and sum fields
    const groupByProject = (key) => {
        const grouped = {};
        rows.forEach((row) => {
            const project = row.ProjectCode || "Unknown";
            grouped[project] = (grouped[project] || 0) + (Number(row[key]) || 0);
        });
        return grouped;
    };

    // ✅ Datasets
    const projectOrderQty = groupByProject("OrderedLineQuantity");
    const projectIndentQty = groupByProject("IndentQuantity");
    const projectOrderValue = groupByProject("OrderLineValue");
    const projectInventoryValue = groupByProject("InventoryValue");

    // ✅ Function to build chart data
    const buildChartData = (dataObj, label) => ({
        labels: Object.keys(dataObj),
        datasets: [
            {
                label,
                data: Object.values(dataObj),
                backgroundColor: [
                    "#4ade80", "#60a5fa", "#f87171", "#facc15",
                    "#a78bfa", "#fb923c", "#22d3ee", "#2dd4bf",
                ],
                borderWidth: 1,
            },
        ],
    });

const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }, // ✅ Hide legends
      tooltip: { enabled: true },
    },
  };

  return (
  <div className="flex justify-between ">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 ">
      {/* Project Distribution */}
      <div className=" max-h-50  bg-[var(--card)] p-4 rounded-lg  shadow-sm ">
        <div className="flex items-center mb-3">
          <div className="h-5 w-1 bg-[var(--primary)] mr-2"></div>
          <h2 className="text-[15px] font-semibold text-[var(--foreground)]">
            PROJECT DISTRIBUTION
          </h2>
        </div>
        <div className="h-[8vw] flex justify-center">
          <Pie
            data={buildChartData(projectOrderQty, "Order Qty")}
            options={chartOptions}
          />
        </div>
      </div>

      {/* Indent Quantity Distribution */}
      <div className="max-h-50  bg-[var(--card)] p-3 rounded-lg  shadow-sm">
        <div className="flex items-center ">
          <div className="h-5 w-1 bg-[var(--primary)] mr-2"></div>
          <h2 className="text-[15px] font-semibold text-[var(--foreground)]">
            INDENT QUANTITY DISTRIBUTION
          </h2>
        </div>
        <div className="h-[8vw] flex justify-center">
          <Pie
            data={buildChartData(projectIndentQty, "Indent Qty")}
            options={chartOptions}
          />
        </div>
      </div>

      {/* Order Value Distribution */}
      <div className="max-h-50  bg-[var(--card)] p-4 rounded-lg  shadow-sm">
        <div className="flex items-center mb-3">
          <div className="h-5 w-1 bg-[var(--primary)] mr-2"></div>
          <h2 className="text-[15px] font-semibold text-[var(--foreground)]">
            ORDER VALUE DISTRIBUTION
          </h2>
        </div>
        <div className="h-[8vw] flex justify-center">
          <Pie
            data={buildChartData(projectOrderValue, "Order Value")}
            options={chartOptions}
          />
        </div>
      </div>

      {/* Inventory Quantity Distribution */}
      <div className="max-h-50  bg-[var(--card)] p-3 rounded-lg  shadow-sm">
        <div className="flex items-center ">
          <div className="h-5 w-1 bg-[var(--primary)] mr-2"></div>
          <h2 className="text-[15px] font-semibold text-[var(--foreground)]">
            INVENTORY QUANTITY DISTRIBUTION
          </h2>
        </div>
        <div className="h-[8vw] flex justify-center">
          <Pie
            data={buildChartData(projectInventoryValue, "Inventory Value")}
            options={chartOptions}
          />
        </div>
      </div>
    </div>
  </div>
);
}
