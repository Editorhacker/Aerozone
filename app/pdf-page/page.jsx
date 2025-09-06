"use client";
import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default function ExcelTableConverter() {
  // State for Dump Data (existing)
  const [dumpFileName, setDumpFileName] = useState("No file selected");
  const [dumpFile, setDumpFile] = useState(null);

  const [jsonData, setJsonData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showOutput, setShowOutput] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const dumpFileInputRef = useRef(null);
  const pieChartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // PROJECT VS INDENT QUANTITY CHART 
  const onHandChartRef = useRef(null);
  const onHandChartInstanceRef = useRef(null);

  // PROJECT VS ORDER VALUE CHART
  const orderValueChartRef = useRef(null);
  const orderValueChartInstanceRef = useRef(null);

  // PROJECT VS INVENTORY VALUE CHART
  const inventoryValueChartRef = useRef(null);
  const inventoryValueChartInstanceRef = useRef(null);

  const [generalSearch, setGeneralSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [itemCodeFilter, setItemCodeFilter] = useState("");
  const [itemDescFilter, setItemDescFilter] = useState("");
  const [itemCodeSort, setItemCodeSort] = useState('none'); // 'none', 'asc', 'desc'

  // Handle Dump Data file selection
  const handleDumpFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDumpFileName(file.name);
      setDumpFile(file);
      setShowOutput(false);
    } else {
      setDumpFileName("No file selected");
      setDumpFile(null);
    }
  };

  // Trigger Dump Data file input click
  const triggerDumpFileInput = () => {
    dumpFileInputRef.current.click();
  };

  // Convert Dump Data Excel to JSON
  const handleDumpConvert = () => {
    if (!dumpFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const transformedData = transformData(excelData);
        setJsonData(transformedData);
        setFilteredData(transformedData);
        setShowOutput(true);
        showNotification("success", "Dump Data conversion successful!");
      } catch (err) {
        showNotification("error", `Failed to process Dump Data: ${err.message}`);
      }
    };
    reader.onerror = () => showNotification("error", "Error reading Dump Data file");
    reader.readAsArrayBuffer(dumpFile);
  };


  // Transform Excel rows into objects
  const transformData = (data) => {
    const rows = data.slice(1);
    return rows.map((row) => {
      while (row.length < 25) row.push("");
      const parsedDate = parseDate(row[14]);
      const formattedDate = parsedDate ? formatDateToDDMMMYYYY(parsedDate) : "";
      let deliveryDate = "";
      if (parsedDate) {
        const delivery = new Date(parsedDate);
        delivery.setDate(delivery.getDate() + 31);
        deliveryDate = formatDateToDDMMMYYYY(delivery);
      }
      return {
        "Project Code": row[7] || "",
        ItemCode: row[8] || "",
        ItemShortDescription: row[10] || "", // instead of 10 use 9
        "OrderedLine Quantity": row[19] || 0, //instead of 19 use 18
        "On Hand": row[42] || 0,       // New column from column AQ 
        UOM: row[16] || "", // instead of 16 use 15
        OrderLineValue: row[25] || "", // instead of 25 use 24
        "Inventory Value": calculateInventoryValue(row[25], row[19], row[42]), // ✅ New column
        Currency: row[23] || "", // instead of 23 use 22
        Date: formattedDate,
        Delivery: deliveryDate,
        "Supplier Name": row[3] || "", // New column from column D
        "PO.No": row[4] || "",         // New column from column E

      };
    });
  };

  const calculateInventoryValue = (orderLineValue, orderedQty, onHand) => {
  const val = parseFloat(orderLineValue) || 0;
  const qty = parseFloat(orderedQty) || 0;
  const hand = parseFloat(onHand) || 0;
  if (qty === 0) return 0; // avoid division by zero
  return ((val / qty) * hand).toFixed(2); // keep 2 decimals
};


  // Date helpers
  const parseDate = (dateValue) => {
    if (!dateValue) return null;
    if (typeof dateValue === "number") return new Date((dateValue - 25569) * 86400 * 1000);
    if (typeof dateValue === "string") return new Date(dateValue);
    if (dateValue instanceof Date) return dateValue;
    return null;
  };

  const formatDateToDDMMMYYYY = (date) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Generate Pie Chart
  const prepareChart = (data) => {
    if (!pieChartRef.current) return;
    const projectData = {};
    data.forEach((row) => {
      const project = row["Project Code"] || "Unknown";
      const qty = parseFloat(row["OrderedLine Quantity"]) || 0;
      projectData[project] = (projectData[project] || 0) + qty;
    });
    const labels = Object.keys(projectData);
    const values = Object.values(projectData);
    const colors = generateColors(labels.length);
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    const ctx = pieChartRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: colors, borderColor: "#fff", borderWidth: 2 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const val = context.raw || 0;
                const percentage = Math.round((val / total) * 100);
                return `${context.label}: ${val} (${percentage}%)`;
              },
            },
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#93c5fd',
            bodyColor: '#e0e7ff',
            borderColor: '#1e40af',
            borderWidth: 1
          },
        },
      },
    });
  };

  // PREPARE PROJECT VS INDENT QUANTITY CHART
  const prepareOnHandChart = (data) => {
    if (!onHandChartRef.current) return;
    const projectData = {};
    data.forEach((row) => {
      const project = row["Project Code"] || "Unknown";
      const qty = parseFloat(row["On Hand"]) || 0;
      projectData[project] = (projectData[project] || 0) + qty;
    });
    const labels = Object.keys(projectData);
    const values = Object.values(projectData);
    const colors = generateColors(labels.length);

    if (onHandChartInstanceRef.current) onHandChartInstanceRef.current.destroy();
    const ctx = onHandChartRef.current.getContext("2d");
    onHandChartInstanceRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: colors, borderColor: "#fff", borderWidth: 2 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const val = context.raw || 0;
                const percentage = Math.round((val / total) * 100);
                return `${context.label}: ${val} (${percentage}%)`;
              },
            },
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#93c5fd',
            bodyColor: '#e0e7ff',
            borderColor: '#1e40af',
            borderWidth: 1
          },
        },
      },
    });
  };

  // PREPARE PROJECT VS ORDER VALUE CHART
 const prepareOrderValueChart = (data) => {
  if (!orderValueChartRef.current) return;
  const projectData = {};
  data.forEach((row) => {
    const project = row["Project Code"] || "Unknown";
    const qty = parseFloat(row["OrderLineValue"]) || 0; 
    projectData[project] = (projectData[project] || 0) + qty;
  });
  const labels = Object.keys(projectData);
  const values = Object.values(projectData);
  const colors = generateColors(labels.length);

  if (orderValueChartInstanceRef.current) orderValueChartInstanceRef.current.destroy();
  const ctx = orderValueChartRef.current.getContext("2d"); 
  orderValueChartInstanceRef.current = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colors, borderColor: "#fff", borderWidth: 2 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const val = context.raw || 0;
              const percentage = Math.round((val / total) * 100);
              return `${context.label}: ${val} (${percentage}%)`;
            },
          },
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          titleColor: "#93c5fd",
          bodyColor: "#e0e7ff",
          borderColor: "#1e40af",
          borderWidth: 1,
        },
      },
    },
  });
};

  // PREPARE PROJECT VS INVENTORY VALUE CHART
  const prepareInventoryValueChart = (data) => {
    if (!inventoryValueChartRef.current)return;
    const projectData ={};
    data.forEach((row) => {
      const project = row["Project Code"] || "Unknown";
      const qty = parseFloat(row["Inventory Value"]) || 0;
      projectData[project] = (projectData[project] || 0) + qty;
    });
    const labels = Object.keys(projectData);
    const values = Object.values(projectData);
    const colors = generateColors(labels.length);
    if (inventoryValueChartInstanceRef.current) inventoryValueChartInstanceRef.current.destroy();
    const ctx = inventoryValueChartRef.current.getContext("2d");
    inventoryValueChartInstanceRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: colors, borderColor: "#fff", borderWidth: 2 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const val = context.raw || 0;
                const percentage = Math.round((val / total) * 100);
                return `${context.label}: ${val} (${percentage}%)`;
              },
            },
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#93c5fd',
            bodyColor: '#e0e7ff',
            borderColor: '#1e40af',
            borderWidth: 1
          },
        },
      },
    });
  };


  const generateColors = (count) => {
    // Sci-fi color palette
    const baseColors = [
      "#00d4ff", // Cyan
      "#7c3aed", // Purple
      "#ef4444", // Red
      "#10b981", // Green
      "#f59e0b", // Amber
      "#8b5cf6", // Violet
      "#ec4899", // Pink
      "#06b6d4", // Light Blue
      "#f97316", // Orange
      "#6366f1"  // Indigo
    ];
    while (baseColors.length < count) {
      const r = Math.floor(Math.random() * 200);
      const g = Math.floor(Math.random() * 200);
      const b = Math.floor(Math.random() * 200);
      baseColors.push(`rgb(${r},${g},${b})`);
    }
    return baseColors.slice(0, count);
  };

  // Copy table
  const copyTable = () => {
    if (!filteredData.length) return;
    const headers = Object.keys(filteredData[0]);
    let text = headers.join("\t") + "\n";
    filteredData.forEach((row) => {
      text += headers.map((h) => row[h]).join("\t") + "\n";
    });
    navigator.clipboard.writeText(text)
      .then(() => showNotification("success", "Table copied to clipboard!"))
      .catch(() => showNotification("error", "Failed to copy"));
  };

  const showNotification = (type, message) => {
    if (type === "success") {
      setSuccessMsg(message);
      setTimeout(() => setSuccessMsg(""), 3000);
    } else {
      setErrorMsg(message);
      setTimeout(() => setErrorMsg(""), 5000);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...jsonData];
    if (generalSearch) {
      const term = generalSearch.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((v) => v.toString().toLowerCase().includes(term))
      );
    }
    if (projectFilter) filtered = filtered.filter((row) => row["Project Code"] === projectFilter);
    if (itemCodeFilter) filtered = filtered.filter((row) => row.ItemCode.slice(9) === itemCodeFilter);
    if (itemDescFilter) filtered = filtered.filter((row) => row.ItemShortDescription === itemDescFilter);

    // Apply sorting if needed
    if (itemCodeSort !== 'none') {
      filtered.sort((a, b) => {
        const codeA = a.ItemCode.slice(9);
        const codeB = b.ItemCode.slice(9);
        if (itemCodeSort === 'asc') {
          return codeA.localeCompare(codeB);
        } else {
          return codeB.localeCompare(codeA);
        }
      });
    }

    setFilteredData(filtered);
  };

  // Handle sorting toggle
  const handleSort = () => {
    let newSortOrder;
    if (itemCodeSort === 'none') newSortOrder = 'asc';
    else if (itemCodeSort === 'asc') newSortOrder = 'desc';
    else newSortOrder = 'none';

    setItemCodeSort(newSortOrder);

    // Apply sorting immediately
    let sorted = [...filteredData];
    if (newSortOrder !== 'none') {
      sorted.sort((a, b) => {
        const codeA = a.ItemCode.slice(9);
        const codeB = b.ItemCode.slice(9);
        if (newSortOrder === 'asc') {
          return codeA.localeCompare(codeB);
        } else {
          return codeB.localeCompare(codeA);
        }
      });
    }
    setFilteredData(sorted);
  };

  // Update chart whenever filteredData changes
  useEffect(() => {
    if (showOutput) prepareChart(filteredData);
    prepareOnHandChart(filteredData);
    prepareOrderValueChart(filteredData);
    prepareInventoryValueChart(filteredData);
  }, [filteredData, showOutput]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 py-8 px-2">
      {/* Sci-Fi Header with Background */}
      <div className="bg-gradient-to-r from-cyan-900 to-indigo-900 text-white py-10 px-6 mb-10 shadow-2xl border-b border-cyan-500/30 relative overflow-hidden">
        {/* Sci-Fi decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-indigo-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse-slow"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center mb-2">
            <div className="h-1 w-10 bg-cyan-400 mr-3"></div>
            <h1 className="text-4xl font-bold tracking-tight">DATA ANALYZER</h1>
          </div>
          <p className="text-cyan-200 text-lg">Advanced Excel Data Processing & Visualization System</p>
        </div>
      </div>

      <div className="max-w-7xl justify-center mx-2">
        {/* Upload Cards Section */}
        <div className=" gap-8 mb-10">
          {/* Dump Data Upload Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-4 shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="h-8 w-1 bg-cyan-400 mr-3"></div>
              <h2 className="text-xl font-bold text-cyan-100">DUMP DATA</h2>
            </div>
            <p className="text-gray-400 mb-6">Upload existing data for table visualization</p>

            <div className="flex flex-col items-center">
              {/* Hidden file input */}
              <input
                type="file"
                ref={dumpFileInputRef}
                accept=".xlsx, .xls, .csv"
                onChange={handleDumpFileChange}
                className="hidden"
              />

              {/* File selection button */}
              <button
                onClick={triggerDumpFileInput}
                className="w-full max-w-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3 px-6 rounded-lg mb-4 transition duration-300 flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                SELECT DUMP DATA
              </button>

              <div className="text-sm text-cyan-300 mb-4 font-mono">{dumpFileName}</div>

              <button
                onClick={handleDumpConvert}
                disabled={!dumpFile}
                className="w-full max-w-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
              >
                PROCESS DATA
              </button>
            </div>
          </div>

        </div>

        {/* Notification Messages */}
        {successMsg && (
          <div className="mb-6 bg-emerald-900/50 border border-emerald-500/30 text-emerald-200 p-4 rounded-lg flex items-center max-w-2xl mx-auto backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 bg-red-900/50 border border-red-500/30 text-red-200 p-4 rounded-lg flex items-center max-w-2xl mx-auto backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMsg}
          </div>
        )}

        {/* Output Section */}
        {showOutput && (
          <div className="bg-gray-800/50  backdrop-blur-sm rounded-xl border border-gray-700/50 p-2 mb-8 shadow-xl">
            {/* Filters */}
            <div className="mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center mb-3">
                <div className="h-5 w-1 bg-cyan-400 mr-2"></div>
                <h2 className="text-lg font-semibold text-cyan-100">DATA FILTERS</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="General search..."
                    value={generalSearch}
                    onChange={(e) => setGeneralSearch(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Project</label>
                  <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">All Projects</option>
                    {[...new Set(jsonData.map(row => row["Project Code"]))].map((proj, idx) => (
                      <option key={idx} value={proj}>{proj}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Item Code</label>
                  <select
                    value={itemCodeFilter}
                    onChange={(e) => setItemCodeFilter(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">All Codes</option>
                    {[...new Set(jsonData.map(row => row.ItemCode?.slice(9)))].map((code, idx) => (
                      <option key={idx} value={code}>{code}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <select
                    value={itemDescFilter}
                    onChange={(e) => setItemDescFilter(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">All Descriptions</option>
                    {[...new Set(jsonData.map(row => row.ItemShortDescription))].map((desc, idx) => (
                      <option key={idx} value={desc}>{desc}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={applyFilters}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2 rounded-lg transition duration-300 shadow-lg shadow-cyan-500/20"
                  >
                    APPLY FILTERS
                  </button>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="flex justify-between ">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 min-h-full">
              <div className="mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center mb-3">
                  <div className="h-5 w-1 bg-purple-400 mr-2"></div>
                  <h2 className="text-lg font-semibold text-purple-100">PROJECT DISTRIBUTION</h2>
                </div>
                <div className="h-[10vw] flex justify-center">
                  <canvas ref={pieChartRef}></canvas>
                </div>
              </div>
              {/* Project vs Indent Quantity Pie Chart */}
              <div className="mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center mb-3">
                  <div className="h-5 w-1 bg-emerald-400 mr-2"></div>
                  <h2 className="text-lg font-semibold text-emerald-100">ON HAND DISTRIBUTION</h2>
                </div>
                <div className="h-[10vw] flex justify-center">
                  <canvas ref={onHandChartRef}></canvas>
                </div>
              </div>
              {/* Project vs Order Line Value Pie Chart */}
              <div className="mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center mb-3">
                  <div className="h-5 w-1 bg-red-400 mr-2"></div>
                  <h2 className="text-lg font-semibold text-emerald-100">INDENT QUANTITY DISTRIBUTION</h2>
                </div>
                <div className="h-[10vw] flex justify-center">
                  <canvas ref={orderValueChartRef}></canvas>
                </div>
              </div>

              {/* Project vs Inventory Value Pie Chart */}
              <div className="mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center mb-3">
                  <div className="h-5 w-1 bg-red-400 mr-2"></div>
                  <h2 className="text-lg font-semibold text-emerald-100">INVENTORY VALUE DISTRIBUTION</h2>
                </div>
                <div className="h-[10vw] flex justify-center">
                  <canvas ref={inventoryValueChartRef}></canvas>
                </div>
              </div>

            </div>

            </div>


            {/* Table */}
            <div className="bg-gray-900/50 p-4 table-auto rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="h-5 w-1 bg-indigo-400 mr-2"></div>
                  <h2 className="text-lg font-semibold text-indigo-100">DATA TABLE</h2>
                </div>

                <button
                  onClick={copyTable}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-2 px-4 rounded-lg text-sm flex items-center shadow-lg shadow-indigo-500/20 transition duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  COPY TABLE
                </button>
              </div>

              <div className="border border-gray-700  rounded-lg shadow overflow-auto scrollbar-hide max-h-96">
                <table className="min-w-full table-auto  bg-gray-800">
                  <thead className="bg-gradient-to-r from-cyan-800 to-indigo-800 text-white sticky top-0 z-10">
                    <tr>
                      {filteredData[0] &&
                        Object.keys(filteredData[0]).map((key) => (
                          <th
                            key={key}
                            className="py-2 px-2 text-left text-xs font-bold uppercase tracking-wider border-r border-cyan-700 last:border-r-0 whitespace-nowrap"
                          >
                            {key === "ItemCode" ? (
                              <div className="flex items-center">
                                <span>{key}</span>
                                <button
                                  onClick={handleSort}
                                  className="ml-2 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold rounded px-2 py-0.5 text-xs shadow transition-colors duration-300"
                                  title="Sort by Item Code"
                                >
                                  {itemCodeSort === 'asc' ? '↑' : itemCodeSort === 'desc' ? '↓' : '↕'}
                                </button>
                              </div>
                            ) : key}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y  divide-gray-700">
                    {filteredData.length ? (
                      filteredData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-700/50 transition-colors duration-200">
                          {Object.keys(row).map((key) => (
                            <td
                              key={key}
                              className="py-2 px-2 text-xs text-gray-300 border-r border-gray-700 last:border-r-0 whitespace-nowrap"
                            >
                              {key === "ItemCode" ? row[key]?.slice(9) : row[key]}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="100%" className="py-4 px-4 text-center text-gray-400 bg-gray-800/50">
                          <div className="flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium">NO DATA AVAILABLE</p>
                            <p className="text-xs mt-1">Try adjusting your filters</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add custom animation for sci-fi effect */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
