import React, { useEffect, useState } from "react";
import UploadForm from "../components/module1/Uploadfrom2";
import Filters from "../components/module1/Filter2";
import * as XLSX from "xlsx";
import DonutChart from "../components/module1/DonutChart";
import DonutChart2 from "../components/module1/DonutChart2";
import DataTable2 from "../components/module1/DataTable2";


const DataPage2 = () => {
  const [rows, setRows] = useState([]);
  const [indentRows, setIndentRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [filteredIndentRows, setFilteredIndentRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);


  const [filters, setFilters] = useState({
    search: "",
    projectCode: "",
    itemCode: "",
    description: "",
    refStart: "",
    refEnd: "",
  });

  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState([]);

  // 🔹 State for re-triggering animation
  const [animationKey, setAnimationKey] = useState(0);

useEffect(() => {
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, [isDarkMode]);


  // 🔹 Fetch Firestore/DB data once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res1 = await fetch("http://localhost:5000/api/data/get-data");
        const excelData = await res1.json();
        setRows(excelData);
        setFilteredRows(excelData);

        const res2 = await fetch("http://localhost:5000/api/data/get-indent");
        const indentData = await res2.json();
        setIndentRows(indentData);
        setFilteredIndentRows(indentData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // 🔹 Process uploaded Excel
  const processExcel = async (file) => {
    if (!file) {
      alert("Please upload an Excel file first.");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      setExcelData(excelJson);

      // Merge ReferenceB into rows
      const updated = rows.map((row) => {
        const match = excelJson.find((excelRow) => {
          const excelPONo = excelRow[4]; // Column E
          return String(excelPONo).trim() === String(row.PONo).trim();
        });
        return {
          ...row,
          ReferenceB: match ? match[14] : "N/A", // Column O
        };
      });

      setRows(updated);
      setFilteredRows(updated);
    } catch (err) {
      console.error("Error processing Excel:", err);
    }
  };



  // inside DataPage2 component (replace your applyFilters with this)
  const normalizeKey = (k = "") => String(k).replace(/\s|_|-/g, "").toLowerCase();

  const findRowValue = (row = {}, candidates = []) => {
    // 1) direct key matches
    for (const c of candidates) {
      if (row[c] !== undefined && row[c] !== null && String(row[c]).trim() !== "") {
        return String(row[c]).trim();
      }
    }

    // 2) fallback: match by normalized key (case/space/underscore-insensitive)
    const map = {};
    Object.keys(row).forEach((k) => {
      map[normalizeKey(k)] = k;
    });

    for (const c of candidates) {
      const nk = normalizeKey(c);
      if (map[nk]) return String(row[map[nk]]).trim();
    }

    return "";
  };

  const applyFilters = () => {
    const { search, projectCode, itemCode, description, refStart, refEnd } = filters;

    // split and normalize search terms
    const searchTerms = String(search || "")
      .split(/[, ]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const start = parseFloat(refStart);
    const end = parseFloat(refEnd);
    const refFilterActive = !isNaN(start) || !isNaN(end);

    const filterRow = (row) => {
      let ok = true;

      // Reference value (robustly find it)
      const refStr = findRowValue(row, ["ReferenceB", "REF_B", "Reference B", "Reference_B", "REFB", "Reference"]);
      const refVal = refStr ? parseFloat(String(refStr).replace(/[^0-9.\-]/g, "")) : NaN;

      // If user specified a ReferenceB range, require row to have a reference and be inside range
      if (refFilterActive) {
        if (isNaN(refVal)) return false;
        if (!isNaN(start) && refVal < start) return false;
        if (!isNaN(end) && refVal > end) return false;
      }

      // general search across row values
      if (searchTerms.length > 0) {
        ok =
          ok &&
          searchTerms.some((term) =>
            Object.values(row).some((val) => String(val || "").toLowerCase().includes(term))
          );
      }

      // Project Code exact match (try multiple possible keys)
      if (String(projectCode || "").trim()) {
        const proj = findRowValue(row, ["ProjectCode", "PROJECT_NO", "Project Code", "Project_No", "Project"]);
        ok = ok && String(proj || "").toLowerCase() === String(projectCode || "").toLowerCase();
      }

      // Item Code exact match
      if (String(itemCode || "").trim()) {
        const item = findRowValue(row, ["ItemCode", "ITEM_CODE", "Item Code", "BOI Item code", "itemcode"]);
        ok = ok && String(item || "").toLowerCase() === String(itemCode || "").toLowerCase();
      }

      // Description partial match
      if (String(description || "").trim()) {
        const desc = findRowValue(row, ["ItemShortDescription", "ITEM_DESCRIPTION", "Description", "Item Description"]);
        ok = ok && String(desc || "").toLowerCase().includes(String(description || "").toLowerCase());
      }

      return ok;
    };

    setFilteredRows(rows.filter(filterRow));
    setFilteredIndentRows(indentRows.filter(filterRow));
  };



  return (
    <div >
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className=" z-50 absolute btn-toggle top-4 right-6 p-3 rounded-full  bg-gray-200 dark:bg-gray-800 hover:dark:bg-gray-200 hover:bg-gray-800  dark:text-gray-200 hover:dark:text-gray-800 hover:text-gray-200  shadow-md transition duration-300"
      >
        {isDarkMode ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </button>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-21 px-6 relative overflow-hidden transition-colors duration-300">


        {/* Layout */}
        <div className="relative z-10 grid grid-cols-12 grid-rows-[auto_auto_auto] gap-4">
          {/* Block 1 */}
          <div className="col-span-12 min-w-fit bg-[var(--card)] p-4 rounded-xl shadow-md flex flex-col  gap-4">
            {/* Dark mode toggle */}
            <div className="flex justify-between items-center">
              <UploadForm onUpload={processExcel} setLoading={setLoading} />


            </div>

            <Filters
              filters={filters}
              setFilters={setFilters}
              applyFilters={applyFilters}
              rows={rows}
            />
          </div>

          {/* ✅ Put Blocks 2, 3, 4 in same row */}
          <div className="col-span-10 flex justify-center items-center gap-4  ">

            {/* Block 4 */}
            {/* bg-[var(--card)] p-4  rounded-xl shadow-md */}
            {/* <div className="col-span-3 max-h-[25vw] flex justify-center bg-[var(--card)]  rounded-xl shadow-md ">
                    <BarChart rows={filteredRows} />
                  </div>
       */}
            {/* Block 2 */}
            {/* className="col-span-4  bg-[var(--card)] 4 rounded-xl shadow-md" */}
            <div className=" max-h-full max-w-full bg-[var(--card)]  rounded-xl shadow-md " >
              <DonutChart2
                filteredRows={filteredRows}
                filteredIndentRows={filteredIndentRows}

              />
            </div>

            {/* Block 3 */}
            {/* bg-[var(--card)] 4 rounded-xl shadow-md */}
            <div className=" max-h-full max-w-full  bg-[var(--card)]  rounded-xl shadow-md ">
              <DonutChart rows={filteredRows} />


            </div>
          </div>

          {/* Block 5 */}
          <div className="col-span-12 bg-[var(--card)] p-4 rounded-xl shadow-md">
            <DataTable2 rows={filteredRows} indentRows={filteredIndentRows} />
          </div>
        </div>

      </div>
    </div>
  );
};
export default DataPage2;