import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PendingDonut({ rows }) {
  const aggregated = useMemo(() => {
    let totalOrdered = 0;
    let totalIndent = 0;
    const seen = new Set();

    rows.forEach((row) => {
      const itemCode = row.ItemCode || "Unknown";
      const ordered = Number(row.OrderedLineQuantity) || 0;
      const indent = Number(row.IndentQuantity) || 0;

      totalOrdered += ordered;

      // ✅ count indent only once per itemCode
      if (!seen.has(itemCode) && indent > 0) {
        totalIndent += indent;
        seen.add(itemCode);
      }
    });

    const pending = totalIndent - totalOrdered;

    return {
      indent: totalIndent,
      ordered: totalOrdered,
      pending: pending > 0 ? pending : 0,
    };
  }, [rows]);

  if (!aggregated || aggregated.indent === 0) {
    return <p className="text-[var(--forground)] text-center">No data</p>;
  }

  const { indent, pending } = aggregated;
  const pendingPercent = ((pending / indent) * 100).toFixed(1);

  const data = {
    labels: ["Pending", "Completed"],
    datasets: [
      {
        label: "Indent Status",
        data: [pending, indent - pending],
        backgroundColor: ["rgba(239, 68, 68, 0.8)", "rgba(16, 185, 129, 0.8)"], // red + green
        borderWidth: 3,
        borderRadius: 8,
        hoverOffset: 12,
      },
    ],
  };

  const options = {
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.label}: ${ctx.raw} (${((ctx.raw / indent) * 100).toFixed(1)}%)`,
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
      easing: "easeOutBack",
    },
  };

  // ✅ Plugin for dynamic center text (always uses fresh props)
const centerTextPlugin = {
  id: "centerText",
  afterDraw: (chart) => {
    if (!chart.getDatasetMeta(0).data.length) return;

    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    const arc = meta.data[0];
    const { x, y } = arc.getProps(["x", "y"], true);

    // ✅ Recompute percentages from chart data
    const dataset = chart.data.datasets[0];
    const [pending, completed] = dataset.data;
    const indent = pending + completed;
    const percent = indent > 0 ? ((pending / indent) * 100).toFixed(1) : "0.0";

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Main percentage
    ctx.font = "bold 20vw sans-serif text-[var(--forground)]";
    ctx.fillStyle = "text-[var(--forground)]";
    ctx.fillText(`${percent}%`, x, y);

    // Subtext
    ctx.font = "12vw sans-serif text-[var(--forground)]";
    ctx.fillStyle = "#9ca3af";
    ctx.fillText("Pending", x, y + 20);

    ctx.restore();
  },
};



  return (
    <div className=" p-6 rounded-2xl border text-[var(--forground)]  w-full max-w-[40vw] mx-auto shadow-lg">
      <h2 className="text-lg font-semibold  mb-4 text-center">
        Pending Indent
      </h2>
      <Doughnut
        data={data}
        options={options}
        plugins={[centerTextPlugin]}
        updateMode="resize" // ✅ force redraw on data change
      />
    </div>
  );
}
