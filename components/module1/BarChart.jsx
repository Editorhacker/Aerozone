import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StackedBarChart({ rows }) {
  // Sum totals across all rows
  const totalOrdered = rows.reduce(
    (sum, r) => sum + (r.OrderedLineQuantity || r.ORDERED_QTY || 0),
    0
  );
  const totalInventory = rows.reduce(
    (sum, r) => sum + (r.InventoryQuantity || r.INVENTORY_QTY || 0),
    0
  );
const totalIndent = rows.reduce((sum, r) => {
  const val =
    r.IndentQuantity ||
    r.INDENT_QTY ||
    r.REQUIRED_QTY ||
    0;

  const num = parseFloat(val);
  return sum + (isNaN(num) ? 0 : num);
}, 0);

  const data = {
    labels: ["All Items"], // single stacked bar
    datasets: [
      { label: "Ordered Line Quantity", data: [totalOrdered], backgroundColor: "blue" },
      { label: "Inventory Quantity", data: [totalInventory], backgroundColor: "orange" },
      { label: "Indent Quantity", data: [totalIndent], backgroundColor: "green" },
    ],
  };

  const options = {
    responsive: true,
      maintainAspectRatio: false, // important for Tailwind heights

    plugins: {
      title: { display: false },
      legend: {
        display: true,
        position: "bottom",
        labels: { color: "var(--foreground)" },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            let value = context.raw ?? 0;
            return `${context.dataset.label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: { stacked: true, ticks: { color: "var(--foreground)" } },
      y: { stacked: true, grid: { color: "var(--border)" }, beginAtZero: true },
    },
  };

 return (
  <div className="py-10 p-2 h-full w-[22vw] text- flex justify-center items-center  rounded-lg  ">
    <Bar
      data={data}
      options={{ ...options, maintainAspectRatio: false }}
    />
  </div>
);
}