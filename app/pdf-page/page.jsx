"use client";
import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default function ExcelTableConverter() {
  // State for Dump Data (existing)
  const [dumpFileName, setDumpFileName] = useState("No file selected");
  const [dumpFile, setDumpFile] = useState(null);
  
  // State for Quantity Data (new)
  const [quantityFileName, setQuantityFileName] = useState("No file selected");
  const [quantityFile, setQuantityFile] = useState(null);
  
  const [jsonData, setJsonData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showOutput, setShowOutput] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const dumpFileInputRef = useRef(null);
  const quantityFileInputRef = useRef(null);
  const pieChartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  
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

  // Handle Quantity Data file selection
  const handleQuantityFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQuantityFileName(file.name);
      setQuantityFile(file);
    } else {
      setQuantityFileName("No file selected");
      setQuantityFile(null);
    }
  };

  // Trigger Dump Data file input click
  const triggerDumpFileInput = () => {
    dumpFileInputRef.current.click();
  };

  // Trigger Quantity Data file input click
  const triggerQuantityFileInput = () => {
    quantityFileInputRef.current.click();
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

  // Convert Quantity Data Excel to JSON (for future implementation)
  const handleQuantityConvert = () => {
    if (!quantityFile) return;
    // For now, just show a notification that the file was processed
    showNotification("success", "Quantity Data uploaded successfully! This will be used in future implementation.");
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
        ItemShortDescription: row[9] || "",
        "OrderedLine Quantity": row[18] || "",
        UOM: row[15] || "",
        OrderLineValue: row[24] || "",
        Currency: row[22] || "",
        Date: formattedDate,
        Delivery: deliveryDate,
        "Supplier Name": row[3] || "", // New column from column D
        "PO.No": row[4] || "",         // New column from column E
      };
    });
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
            display: true,
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 10,
              font: {
                size: 11
              }
            }
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
          },
        },
      },
    });
  };

  const generateColors = (count) => {
    const baseColors = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6", "#1abc9c", "#34495e", "#e67e22", "#95a5a6", "#d35400"];
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
  }, [filteredData, showOutput]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-23 px-4">
      {/* Header with Background */}
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white py-8 px-4 mb-8 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Excel Data Analyzer</h1>
          <p className="text-xl text-blue-100">Convert Excel files to interactive tables with visualizations</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        {/* Upload Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Dump Data Upload Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Dump Data</h2>
            <p className="text-gray-600 text-center mb-4">Upload existing data for table visualization</p>
            
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
                className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg mb-4 transition duration-300 flex items-center justify-center shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Choose Dump Data
              </button>
              
              <div className="text-sm text-gray-600 mb-4">{dumpFileName}</div>
              
              <button
                onClick={handleDumpConvert}
                disabled={!dumpFile}
                className="w-full max-w-xs bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
              >
                Process Dump Data
              </button>
            </div>
          </div>
          
          {/* Quantity Data Upload Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Quantity Data</h2>
            <p className="text-gray-600 text-center mb-4">Upload quantity data for future implementation</p>
            
            <div className="flex flex-col items-center">
              {/* Hidden file input */}
              <input
                type="file"
                ref={quantityFileInputRef}
                accept=".xlsx, .xls, .csv"
                onChange={handleQuantityFileChange}
                className="hidden"
              />
              
              {/* File selection button */}
              <button
                onClick={triggerQuantityFileInput}
                className="w-full max-w-xs bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg mb-4 transition duration-300 flex items-center justify-center shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Choose Quantity Data
              </button>
              
              <div className="text-sm text-gray-600 mb-4">{quantityFileName}</div>
              
              <button
                onClick={handleQuantityConvert}
                disabled={!quantityFile}
                className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
              >
                Process Quantity Data
              </button>
            </div>
          </div>
        </div>
        
        {/* Notification Messages */}
        {successMsg && (
          <div className="mb-6 bg-green-100 text-green-800 p-4 rounded-lg flex items-center max-w-2xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 bg-red-100 text-red-800 p-4 rounded-lg flex items-center max-w-2xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMsg}
          </div>
        )}
        
        {/* Output Section */}
        {showOutput && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            {/* Filters */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Data Filters</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="General search..."
                    value={generalSearch}
                    onChange={(e) => setGeneralSearch(e.target.value)}
                    className="border p-2 rounded w-full text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="border p-2 rounded w-full text-sm"
                  >
                    <option value="">All Projects</option>
                    {[...new Set(jsonData.map(row => row["Project Code"]))].map((proj, idx) => (
                      <option key={idx} value={proj}>{proj}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
                  <select
                    value={itemCodeFilter}
                    onChange={(e) => setItemCodeFilter(e.target.value)}
                    className="border p-2 rounded w-full text-sm"
                  >
                    <option value="">All Codes</option>
                    {[...new Set(jsonData.map(row => row.ItemCode?.slice(9)))].map((code, idx) => (
                      <option key={idx} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <select
                    value={itemDescFilter}
                    onChange={(e) => setItemDescFilter(e.target.value)}
                    className="border p-2 rounded w-full text-sm"
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
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded w-full text-sm"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
            
            {/* Pie Chart */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Project Distribution</h2>
              <div className="h-48 flex justify-center">
                <canvas ref={pieChartRef}></canvas>
              </div>
            </div>
            
            {/* Table */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Data Table</h2>
                <button
                  onClick={copyTable}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm flex items-center shadow-md transition duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  Copy Table
                </button>
              </div>
              
              <div className="border border-gray-300 rounded-lg shadow overflow-auto max-h-96">
                <table className="min-w-full bg-white">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-10">
                    <tr>
                      {filteredData[0] &&
                        Object.keys(filteredData[0]).map((key) => (
                          <th 
                            key={key} 
                            className="py-2 px-3 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-400 last:border-r-0 whitespace-nowrap"
                          >
                            {key === "ItemCode" ? (
                              <div className="flex items-center">
                                <span>{key}</span>
                                <button 
                                  onClick={handleSort}
                                  className="ml-2 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold rounded px-2 py-0.5 text-xs shadow transition-colors duration-300"
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
                  <tbody className="divide-y divide-gray-200">
                    {filteredData.length ? (
                      filteredData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-50 transition-colors duration-200">
                          {Object.keys(row).map((key) => (
                            <td 
                              key={key} 
                              className="py-2 px-3 text-xs text-gray-800 border-r border-gray-100 last:border-r-0 whitespace-nowrap"
                            >
                              {key === "ItemCode" ? row[key]?.slice(9) : row[key]}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="100%" className="py-4 px-4 text-center text-gray-500 bg-gray-50">
                          <div className="flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium">No data available</p>
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
    </div>
  );
}