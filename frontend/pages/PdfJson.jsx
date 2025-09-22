import { useState } from "react";

export default function App() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Dynamically load the xlsx library for Excel file generation
  const loadXlsxScript = () => {
    if (document.getElementById('xlsx-script')) return;
    const script = document.createElement('script');
    script.id = 'xlsx-script';
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js";
    document.body.appendChild(script);
  };
  
  // Call the function to load the script when the component mounts
  // This is a workaround for the single-file environment.
  loadXlsxScript();

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      // Use a custom modal or message box instead of alert()
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
      messageBox.innerHTML = `
        <div class="bg-[var(--card)] p-6 rounded-[var(--radius-lg)] shadow-xl text-center">
          <p class="text-[var(--foreground)]">Please select PDF files first!</p>
          <button onclick="this.parentElement.parentElement.remove()" class="mt-4 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[var(--radius-lg)] hover:bg-[var(--ring)]">OK</button>
        </div>
      `;
      document.body.appendChild(messageBox);
      return;
    }
    setLoading(true);
    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }
    try {
      const res = await fetch("https://pdf-git.onrender.com/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      // Use a custom modal or message box instead of alert()
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
      messageBox.innerHTML = `
        <div class="bg-[var(--card)] p-6 rounded-[var(--radius-lg)] shadow-xl text-center">
          <p class="text-[var(--foreground)]">Error uploading files!</p>
          <button onclick="this.parentElement.parentElement.remove()" class="mt-4 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[var(--radius-lg)] hover:bg-[var(--ring)]">OK</button>
        </div>
      `;
      document.body.appendChild(messageBox);
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    try {
      const res = await fetch("https://pdf-git.onrender.com/download");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "indent_data.json";
      a.click();
    } catch (err) {
      // Use a custom modal or message box instead of alert()
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
      messageBox.innerHTML = `
        <div class="bg-[var(--card)] p-6 rounded-[var(--radius-lg)] shadow-xl text-center">
          <p class="text-[var(--foreground)]">Error downloading JSON!</p>
          <button onclick="this.parentElement.parentElement.remove()" class="mt-4 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[var(--radius-lg)] hover:bg-[var(--ring)]">OK</button>
        </div>
      `;
      document.body.appendChild(messageBox);
    }
  };

  const handleDownloadExcel = () => {
    if (!result || !result.indent_data || result.indent_data.length === 0) {
      // Use a custom modal or message box for no data
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
      messageBox.innerHTML = `
        <div class="bg-[var(--card)] p-6 rounded-[var(--radius-lg)] shadow-xl text-center">
          <p class="text-[var(--foreground)]">No data to export!</p>
          <button onclick="this.parentElement.parentElement.remove()" class="mt-4 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[var(--radius-lg)] hover:bg-[var(--ring)]">OK</button>
        </div>
      `;
      document.body.appendChild(messageBox);
      return;
    }

    const ws = window.XLSX.utils.json_to_sheet(result.indent_data);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Extracted Data");
    window.XLSX.writeFile(wb, "indent_data.xlsx");
  };


  return (
    <>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Lora:wght@400;700&family=Roboto+Mono&display=swap');

        :root {
          --background: #e7e5e4;
          --foreground: #1e293b;
          --card: #f5f5f4;
          --card-foreground: #1e293b;
          --primary: #6366f1;
          --primary-foreground: #ffffff;
          --secondary: #d6d3d1;
          --secondary-foreground: #4b5563;
          --muted: #e7e5e4;
          --muted-foreground: #6b7280;
          --destructive: #ef4444;
          --destructive-foreground: #ffffff;
          --border: #d6d3d1;
          --input: #d6d3d1;
          --ring: #6366f1;
          --chart-1: #6366f1;
          --chart-2: #4f46e5;
          --chart-3: #4338ca;
          --chart-4: #3730a3;
          --chart-5: #312e81;
          --font-sans: 'Plus Jakarta Sans', sans-serif;
          --font-serif: 'Lora', serif;
          --font-mono: 'Roboto Mono', monospace;
          --radius: 1.25rem;
          --shadow-2xs: 2px 2px 10px 4px hsl(240 4% 60% / 0.09);
          --shadow-xs: 2px 2px 10px 4px hsl(240 4% 60% / 0.09);
          --shadow-sm: 2px 2px 10px 4px hsl(240 4% 60% / 0.18);
          --shadow: 2px 2px 10px 4px hsl(240 4% 60% / 0.18);
          --shadow-md: 2px 2px 10px 4px hsl(240 4% 60% / 0.18);
          --shadow-lg: 2px 2px 10px 4px hsl(240 4% 60% / 0.18);
          --shadow-xl: 2px 2px 10px 4px hsl(240 4% 60% / 0.18);
          --shadow-2xl: 2px 2px 10px 4px hsl(240 4% 60% / 0.45);
        }

        .dark {
          --background: #1e1b18;
          --foreground: #e2e8f0;
          --card: #2c2825;
          --card-foreground: #e2e8f0;
          --primary: #818cf8;
          --primary-foreground: #1e1b18;
          --secondary: #3a3633;
          --secondary-foreground: #d1d5db;
          --muted: #2c2825;
          --muted-foreground: #9ca3af;
          --destructive: #ef4444;
          --destructive-foreground: #1e1b18;
          --border: #3a3633;
          --input: #3a3633;
          --ring: #818cf8;
          --chart-1: #818cf8;
          --chart-2: #6366f1;
          --chart-3: #4f46e5;
          --chart-4: #4338ca;
          --chart-5: #3730a3;
          --font-sans: 'Plus Jakarta Sans', sans-serif;
          --font-serif: 'Lora', serif;
          --font-mono: 'Roboto Mono', monospace;
          --radius: 1.25rem;
          --shadow-2xs: 2px 2px 10px 4px hsl(0 0% 0% / 0.09);
          --shadow-xs: 2px 2px 10px 4px hsl(0 0% 0% / 0.09);
          --shadow-sm: 2px 2px 10px 4px hsl(0 0% 0% / 0.18);
          --shadow: 2px 2px 10px 4px hsl(0 0% 0% / 0.18);
          --shadow-md: 2px 2px 10px 4px hsl(0 0% 0% / 0.18);
          --shadow-lg: 2px 2px 10px 4px hsl(0 0% 0% / 0.18);
          --shadow-xl: 2px 2px 10px 4px hsl(0 0% 0% / 0.18);
          --shadow-2xl: 2px 2px 10px 4px hsl(0 0% 0% / 0.45);
        }
        
        .bg-background { background-color: var(--background); }
        .text-foreground { color: var(--foreground); }
        .bg-card { background-color: var(--card); }
        .text-card-foreground { color: var(--card-foreground); }
        .bg-primary { background-color: var(--primary); }
        .text-primary-foreground { color: var(--primary-foreground); }
        .bg-secondary { background-color: var(--secondary); }
        .text-secondary-foreground { color: var(--secondary-foreground); }
        .bg-muted { background-color: var(--muted); }
        .text-muted-foreground { color: var(--muted-foreground); }
        .bg-destructive { background-color: var(--destructive); }
        .text-destructive-foreground { color: var(--destructive-foreground); }
        .border-border { border-color: var(--border); }
        .bg-input { background-color: var(--input); }
        .ring-ring { outline-color: var(--ring); }
        .font-sans { font-family: var(--font-sans); }
        .font-serif { font-family: var(--font-serif); }
        .font-mono { font-family: var(--font-mono); }
        .rounded-lg { border-radius: var(--radius-lg); }
        .shadow-lg { box-shadow: var(--shadow-lg); }

        .btn-toggle {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.5rem;
          border-radius: 9999px;
          background-color: var(--secondary);
          color: var(--secondary-foreground);
          box-shadow: var(--shadow-md);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-toggle:hover {
          transform: scale(1.1);
          background-color: var(--primary);
          color: var(--primary-foreground);
        }
        `}
      </style>

      <div className={`relative min-h-screen w-full overflow-hidden bg-background text-foreground flex flex-col items-center justify-center font-sans p-4 ${isDarkMode ? 'dark' : ''}`}>

        {/* Dark/Light mode toggle button */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="btn-toggle z-50"
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen relative z-10 w-full max-w-6xl mx-auto">

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="relative h-48 mb-4 pointer-events-auto flex items-center justify-center">
                  <h1 className="text-6xl font-extrabold text-[var(--foreground)]">Indent PDF Extractor</h1>
                </div>

                {/* Single line content */}
                <div className="flex flex-wrap justify-center items-center gap-2 text-[var(--muted-foreground)] text-sm mb-6">
                  <span>Extract and analyze data from your PDF documents with our space-powered tool</span>
                </div>
              </div>

              {/* Centered Upload Card */}
              <div className="flex justify-center mb-12">
                <div className="bg-[var(--card)] p-8 rounded-[var(--radius)] border border-[var(--border)] shadow-lg pointer-events-none w-full max-w-2xl">
                  <div className="flex flex-col items-center">
                    <div className="mb-6 p-4 bg-[var(--accent)] rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[var(--accent-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>

                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold text-[var(--card-foreground)] mb-2">Upload PDF Documents</h2>
                      <p className="text-[var(--muted-foreground)] text-sm">Select one or more PDF files to extract data</p>
                    </div>

                    <div className="w-full max-w-md pointer-events-auto">
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[var(--primary)] rounded-[var(--radius)] cursor-pointer bg-[var(--muted)] hover:bg-[var(--secondary)] transition-all duration-300 hover:border-[var(--ring)]">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-10 h-10 mb-3 text-[var(--secondary-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                          </svg>
                          <p className="mb-2 text-sm text-[var(--muted-foreground)]">
                            <span className="font-semibold text-[var(--secondary-foreground)]">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">PDF files only</p>
                        </div>
                        <input
                          type="file"
                          accept="application/pdf"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      {files.length > 0 && (
                        <div className="mt-4 text-sm text-[var(--secondary-foreground)] text-center">
                          {files.length} file(s) selected
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleUpload}
                      disabled={loading}
                      className="mt-8 px-8 py-3 bg-[var(--primary)] rounded-[var(--radius)] font-medium text-[var(--primary-foreground)] shadow-lg hover:bg-[var(--ring)] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none pointer-events-auto"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[var(--primary-foreground)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : "Extract Data"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Centered Extraction Summary */}
              {result && (
                <div className="flex justify-center mb-12">
                  <div className="bg-[var(--card)] p-8 rounded-[var(--radius)] border border-[var(--border)] shadow-lg pointer-events-none w-full max-w-4xl">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-[var(--card-foreground)]">Extraction Results</h2>
                      <div className="px-3 py-1 bg-[var(--chart-2)] text-[var(--primary-foreground)] rounded-full text-sm">
                        Completed
                      </div>
                    </div>

                    <div className="flex justify-center mb-8 space-x-4">
                      <button
                        onClick={handleDownload}
                        className="px-6 py-3 bg-[var(--primary)] rounded-[var(--radius)] font-medium text-[var(--primary-foreground)] shadow-md hover:bg-[var(--ring)] transition-all duration-300 hover:scale-105 flex items-center pointer-events-auto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download JSON
                      </button>
                      <button
                        onClick={handleDownloadExcel}
                        className="px-6 py-3 bg-[var(--primary)] rounded-[var(--radius)] font-medium text-[var(--primary-foreground)] shadow-md hover:bg-[var(--ring)] transition-all duration-300 hover:scale-105 flex items-center pointer-events-auto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Excel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                      <div className="bg-[var(--secondary)] p-6 rounded-[var(--radius)] border border-[var(--border)]">
                        <div className="flex items-center">
                          <div className="p-3 rounded-lg bg-[var(--input)] mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--secondary-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[var(--muted-foreground)] text-sm">Files Processed</p>
                            <p className="text-2xl font-bold text-[var(--card-foreground)]">{result.total_files_processed}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[var(--secondary)] p-6 rounded-[var(--radius)] border border-[var(--border)]">
                        <div className="flex items-center">
                          <div className="p-3 rounded-lg bg-[var(--input)] mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--secondary-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[var(--muted-foreground)] text-sm">Total Items</p>
                            <p className="text-2xl font-bold text-[var(--card-foreground)]">{result.total_items}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[var(--secondary)] p-6 rounded-[var(--radius)] border border-[var(--border)]">
                        <div className="flex items-center">
                          <div className="p-3 rounded-lg bg-[var(--input)] mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--secondary-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[var(--muted-foreground)] text-sm">Unique Codes</p>
                            <p className="text-2xl font-bold text-[var(--card-foreground)]">{result.unique_item_codes}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Table of Extracted Data */}
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4 text-[var(--card-foreground)]">Extracted Data</h3>
                      <div className="overflow-x-auto dar-[var(--radius)] border border-[var(--border)] pointer-events-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-[var(--secondary)] text-[var(--secondary-foreground)]">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium">Project No.</th>
                              <th className="px-4 py-3 text-left font-medium">Item Code</th>
                              <th className="px-4 py-3 text-left font-medium">Description</th>
                              <th className="px-4 py-3 text-center font-medium">Qty</th>
                              <th className="px-4 py-3 text-center font-medium">UOM</th>
                              <th className="px-4 py-3 text-center font-medium">Order</th>
                              <th className="px-4 py-3 text-center font-medium">Start Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border)]">
                            {result.indent_data.map((row, idx) => (
                              <tr key={idx} className="hover:bg-[var(--accent)] transition-colors">
                                <td className="px-4 py-3 text-[var(--foreground)]">{row.PROJECT_NO || "-"}</td>
                                <td className="px-4 py-3 font-medium text-[var(--chart-1)]">{row.ITEM_CODE || "-"}</td>
                                <td className="px-4 py-3 text-[var(--foreground)] max-w-xs truncate">{row.ITEM_DESCRIPTION || "-"}</td>
                                <td className="px-4 py-3 text-center text-[var(--foreground)]">{row.REQUIRED_QTY || "-"}</td>
                                <td className="px-4 py-3 text-center text-[var(--foreground)]">{row.UOM || "-"}</td>
                                <td className="px-4 py-3 text-center text-[var(--foreground)]">{row.PLANNED_ORDER || "-"}</td>
                                <td className="px-4 py-3 text-center text-[var(--foreground)]">{row.PLANNED_START_DATE || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
