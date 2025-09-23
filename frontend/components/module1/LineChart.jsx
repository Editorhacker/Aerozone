import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  zoomPlugin
);

export default function LineChart({ indentRows }) {
  // ✅ Handle empty rows
  if (!indentRows || indentRows.length === 0) {
    return <p className="text-white text-center">No data to display</p>;
  }

  // ✅ Parse dates from DD-MM-YYYY HH:mm:ss
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, yearTime] = dateStr.split("-");
    if (!yearTime) return null;
    const [year, time] = yearTime.split(" ");
    return new Date(`${year}-${month}-${day}T${time || "00:00:00"}`);
  };

  // ✅ Filter out invalid rows
  const filteredRows = indentRows.filter(
    (row) =>
      row.DATE_OF_UPLOAD &&
      row.REQUIRED_QTY != null &&
      !isNaN(parseDate(row.DATE_OF_UPLOAD))
  );

  // ✅ Prepare chart data
  const chartData = {
    labels: filteredRows.map((row) => parseDate(row.DATE_OF_UPLOAD)),
    datasets: [
      {
        label: "Indent Quantity",
        data: filteredRows.map((row) => row.REQUIRED_QTY),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.3)",
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // ✅ Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Indent Quantity Over Time",
        color: "#fff",
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "x",
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: { unit: "day" },
        ticks: { color: "#9ca3af", maxRotation: 45, minRotation: 45 },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#9ca3af" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return (
    <div className="mb-6  min-w-[35vw] p-4 rounded-lg ">
      {/* Header */}
      <div className="flex items-center mb-3">
        <div className="h-5 w-1 bg-[var(--primary)] mr-2"></div>
        <h2 className="text-[15px] font-semibold text-[var(--foreground)]">
          INDENT QUANTITY
        </h2>
      </div>

      {/* Chart */}
      <div className="h-[350px] w-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
