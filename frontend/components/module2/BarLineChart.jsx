import React, { useEffect, useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function BarLineChart({ filters }) {
  const [rows, setRows] = useState([]);

  // 🔹 Fetch and cache data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cached = localStorage.getItem("chartData");
        if (cached) {
          setRows(JSON.parse(cached));
          return;
        }

        const res = await fetch("https://aerozone-backend.onrender.com/api/data/get-data");
        const data = await res.json();

        // Parse and group by Month-Year
        const parsed = data.map((row) => {
          const rawDate = row.Date?.replace(/"/g, "");
          let monthYear = "";
          if (rawDate) {
            const parts = rawDate.split("-");
            if (parts.length === 3) monthYear = `${parts[1]} ${parts[2]}`;
          }
          return {
            monthYear,
            orderValue: parseFloat(row.OrderLineValue) || 0,
            quantity: parseFloat(row.OrderedLineQuantity) || 0,
            supplier: row.SupplierName,
            itemCode: row.ItemCode,
            description: row.ItemShortDescription,
            currency: row.Currency,
          };
        });

        // Aggregate by Month-Year
        const aggregated = parsed.reduce((acc, curr) => {
          if (!curr.monthYear) return acc;
          if (!acc[curr.monthYear]) {
            acc[curr.monthYear] = { orderValue: 0, quantity: 0, details: [] };
          }
          acc[curr.monthYear].orderValue += curr.orderValue;
          acc[curr.monthYear].quantity += curr.quantity;
          acc[curr.monthYear].details.push(curr);
          return acc;
        }, {});

        const finalData = Object.entries(aggregated).map(([monthYear, vals]) => ({
          MonthYear: monthYear,
          OrderValue: vals.orderValue,
          Quantity: vals.quantity,
          Details: vals.details,
        }));

        localStorage.setItem("chartData", JSON.stringify(finalData));
        setRows(finalData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  // 🔹 Apply Filters
// 🔹 Apply Filters
const filteredRows = useMemo(() => {
  if (!rows) return [];

  return rows.map((r) => {
    const { startMonth, endMonth, minValue, maxValue, year, itemCode } = filters;

    // Clone details
    let details = r.Details;

    // ✅ Filter details by item code if search applied
    if (itemCode) {
      details = details.filter((d) =>
        d.itemCode?.toLowerCase().includes(itemCode.toLowerCase())
      );
    }

    // If no details left after filtering, skip row
    if (details.length === 0) return null;

    // Recalculate OrderValue + Quantity only for the filtered details
    const recalculated = {
      ...r,
      OrderValue: details.reduce((sum, d) => sum + (d.orderValue || 0), 0),
      Quantity: details.reduce((sum, d) => sum + (d.quantity || 0), 0),
      Details: details,
    };

    // Apply year filter
    if (year && !recalculated.MonthYear.includes(year)) return null;

    // Apply month filters
    if (startMonth) {
      const [startY] = startMonth.split("-");
      const [, yearStr] = recalculated.MonthYear.split(" ");
      if (parseInt(yearStr) < parseInt(startY)) return null;
    }
    if (endMonth) {
      const [endY] = endMonth.split("-");
      const [, yearStr] = recalculated.MonthYear.split(" ");
      if (parseInt(yearStr) > parseInt(endY)) return null;
    }

    // Apply value filters
    if (minValue && recalculated.OrderValue < parseFloat(minValue)) return null;
    if (maxValue && recalculated.OrderValue > parseFloat(maxValue)) return null;

    return recalculated;
  }).filter(Boolean); // remove nulls
}, [rows, filters]);

  // 🔹 Chart Data
  const chartData = useMemo(() => {
    const labels = filteredRows.map((r) => r.MonthYear);
    const orderValues = filteredRows.map((r) => r.OrderValue);
    const quantities = filteredRows.map((r) => r.Quantity);

    const datasets = [];

    if (filters.chartView === "both" || filters.chartView === "bar") {
      datasets.push({
        type: "bar",
        label: "Order Value (Rs Millions)",
        data: orderValues,
        backgroundColor: "rgba(0,200,100,0.7)",
        yAxisID: "y",
      });
    }

    if (filters.chartView === "both" || filters.chartView === "line") {
      datasets.push({
        type: "line",
        label: "Quantity (Units)",
        data: quantities,
        borderColor: "orange",
        backgroundColor: "orange",
        yAxisID: "y1",
        tension: 0.3,
        fill: false,
        pointRadius: 6,
        pointBackgroundColor: "orange",
      });
    }

    return { labels, datasets };
  }, [filteredRows, filters.chartView]);

  const options = useMemo(() => ({
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top", labels: { color: "#fff" } },
tooltip: {
  enabled: true,
  callbacks: {
    title: (context) => {
      // context is an array when multiple datasets overlap
      const idx = context[0].dataIndex;
      return filteredRows[idx]?.MonthYear || "";
    },
    label: (context) => {
      const idx = context.dataIndex;
      const row = filteredRows[idx];
      if (!row) return "";

      // Show different info depending on dataset
      if (context.dataset.type === "bar") {
        return `💰 Order Value: Rs ${row.OrderValue.toFixed(2)}`;
      } else if (context.dataset.type === "line") {
        return `📦 Quantity: ${row.Quantity.toFixed(2)} units`;
      }

      // fallback
      return "";
    },
afterBody: (context) => {
  const idx = context[0].dataIndex;
  const row = filteredRows[idx];
  if (!row) return "";

  // Get the searched item code (if filter applied)
  const searchCode = filters.itemCode?.toLowerCase();

  // Filter only matching details if search active, otherwise show first
  const detailsToShow = searchCode
    ? row.Details.filter((d) =>
        d.itemCode?.toLowerCase().includes(searchCode)
      )
    : [row.Details[0]];

  // Map details into tooltip lines
  return detailsToShow.flatMap((d) => [
    `🆔 Item: ${d.itemCode}`,
    `🏢 Supplier: ${d.supplier}`,
    `📝 ${d.description}`,
    "──────────────", // separator line
  ]);
},

  },
},

    },
    scales: {
      x: { ticks: { color: "#ccc", maxRotation: 45, minRotation: 45 }, grid: { color: "#444" } },
      y: {
        type: "linear",
        position: "left",
        title: { display: true, text: "Order Value (Rs Millions)", color: "#fff" },
        ticks: { color: "#ccc" },
        grid: { color: "#444" },
      },
      y1: {
        type: "linear",
        position: "right",
        title: { display: true, text: "Quantity (Units)", color: "orange" },
        ticks: { color: "orange" },
        grid: { drawOnChartArea: false },
      },
    },
  }), [filteredRows]);

  return (
    <div className="w-full h-full">
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
}
