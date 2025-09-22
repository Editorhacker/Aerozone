const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const { db } = require("./../config/firebase");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Helpers
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


const calculateInventoryValue = (orderLineValue, orderedQty, onHand) => {
  orderLineValue = Number(orderLineValue) || 0;
  orderedQty = Number(orderedQty) || 0;
  onHand = Number(onHand) || 0;
  return orderedQty > 0 ? ((orderLineValue / orderedQty) * onHand).toFixed(2) : 0;
};

router.post("/upload-excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // raw array
    const rows = data.slice(1); // skip header row

    const batch = db.batch();

     // ✅ declare counters before using them
    let savedCount = 0;
    let deletedCount = 0;

    rows.forEach((row) => {
      while (row.length < 50) row.push(""); // make sure all indexes exist

      // ✅ Parse and format Date
      const parsedDate = parseDate(row[14]);
      const formattedDate = parsedDate ? formatDateToDDMMMYYYY(parsedDate) : "";

      // ✅ Delivery date = PlannedReceiptDate + 31
      let deliveryDate = "";
      if (parsedDate) {
        const d = new Date(parsedDate);
        d.setDate(d.getDate() + 31);
        deliveryDate = formatDateToDDMMMYYYY(d);
      }

      // ✅ PlannedReceiptDate raw date
      const rawdate = row[15];
      let rawformattedDate = "";
      if (rawdate) {
        const rawparsedDate = parseDate(rawdate);
        rawformattedDate = rawparsedDate ? formatDateToDDMMMYYYY(rawparsedDate) : "";
      }

      // ✅ Build final document
      const docData = {
        "ProjectCode": row[7] || "",
        ItemCode: row[9] || "",
        ItemShortDescription: row[10] || "",  // corrected index
        "SupplierName": row[3] || "",
        "PONo": row[4] || "",
        Date: formattedDate,
        "OrderedLineQuantity": Number(row[19]) || 0, // corrected index
        UOM: row[16] || "", // corrected index
        OrderLineValue: Number(row[25]) || 0, // corrected index
        Currency: row[23] || "", // corrected index
        PlannedReceiptDate: rawformattedDate,
        Delivery: deliveryDate,
        "InventoryQuantity": Number(row[43]) || 0,
        "InventoryUOM": row[16] || "",
        InventoryValue: calculateInventoryValue(row[25], row[19], row[43]),
      };

      const docRef = db.collection("excelData").doc();
       // ✅ Auto-delete/skip blank Currency rows
      if (!docData.Currency || docData.Currency.trim() === "") {
        batch.delete(docRef); // mark for deletion just in case
        deletedCount++;
      } else {
        batch.set(docRef, docData);
        savedCount++;
      }
    });


     await batch.commit();
    res.status(200).json({
      message: "Upload finished",
      saved: savedCount,
      deleted: deletedCount,
      rowsProcessed: rows.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing file");
  }
});

// ✅ New route to fetch data
router.get("/get-data", async (req, res) => {
  try {
    // 1️⃣ Fetch excelData
    const excelSnap = await db.collection("excelData").get();
    const excelData = excelSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 2️⃣ Fetch Indent_Quantity
    const indentSnap = await db.collection("Indent_Quantity").get();
    const indentData = indentSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 3️⃣ Merge by ItemCode ↔ ITEM_CODE
    const mergedData = excelData.map((excelRow) => {
      const match = indentData.find(
        (indent) => indent.ITEM_CODE === excelRow.ItemCode
      );

      return {
        ...excelRow,
        IndentQuantity: match ? match.REQUIRED_QTY : "NA",
        IndentUOM: match ? match.UOM : "NA",
        IndentProject: match ? match.PROJECT_NO : "NA",
        IndentPlannedOrder: match ? match.PLANNED_ORDER : "NA",
      };
    });

    res.json(mergedData);
  } catch (err) {
    console.error("🔥 Error fetching merged data:", err);
    res.status(500).send("Error fetching data");
  }
});


// ✅ Fetch Indent_Quantity collection
router.get("/get-indent", async (req, res) => {
  try {
    const snapshot = await db.collection("Indent_Quantity").get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching indent data");
  }
});



module.exports = router;
