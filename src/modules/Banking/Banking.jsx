import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { bankingAnalyze } from "../../services/api";

export default function Banking() {
  const [transactions, setTransactions] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     HANDLE FILE UPLOAD
  ========================= */
  const handleUpload = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const extension = file.name.split(".").pop().toLowerCase();

      if (extension === "csv") {
        parseCSV(file);
      } else if (extension === "xlsx" || extension === "xls") {
        parseExcel(file);
      } else {
        alert("Only CSV and Excel files are supported.");
      }
    });
  };

  /* =========================
     CSV PARSER
  ========================= */
  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const cleaned = res.data.map(normalizeRow);
        setTransactions((prev) => [...prev, ...cleaned]);
      },
      error: (err) => {
        console.error("CSV Parsing Error:", err);
      },
    });
  };

  /* =========================
     EXCEL PARSER
  ========================= */
  const parseExcel = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const cleaned = json.map(normalizeRow);
        setTransactions((prev) => [...prev, ...cleaned]);
      } catch (err) {
        console.error("Excel Parsing Error:", err);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  /* =========================
     NORMALIZE ROW
  ========================= */
  const normalizeRow = (row) => {
    return {
      date: row.date || row.Date || "",
      credit: parseFloat(row.credit || row.Credit || 0),
      debit: parseFloat(row.debit || row.Debit || 0),
      desc: row.desc || row.Description || "",
      account: row.account || "Primary",
    };
  };

  /* =========================
     ANALYZE BANKING
  ========================= */
  const handleAnalyze = async () => {
    if (transactions.length === 0) {
      alert("Please upload a statement first.");
      return;
    }

    try {
      setLoading(true);

      const res = await bankingAnalyze({
        transactions,
        months_count: 3,
      });

      setResult(res.data);
      localStorage.setItem("banking_result", JSON.stringify(res.data));
    } catch (err) {
      console.error("Analysis Error:", err);
      alert("Banking analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 bg-slate-900 p-6 rounded-2xl border border-slate-800">

      <h2 className="text-3xl font-bold text-emerald-400">
        Banking Intelligence Engine
      </h2>

      {/* FILE INPUT */}
      
      <input
  type="file"
  multiple
  onChange={(e) => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      alert("No file selected");
      return;
    }

    const file = files[0];

    alert("Selected: " + file.name);

    const reader = new FileReader();

    reader.onload = function () {
      alert("File loaded successfully");

      setTransactions([
        {
          date: "2024-01-01",
          credit: 10000,
          debit: 2000,
          desc: "Test Entry",
          account: "Primary"
        }
      ]);
    };

    reader.readAsText(file);
  }}
  className="bg-slate-800 p-3 rounded-xl w-full"
/>

      <p className="text-slate-400">
        Transactions Loaded: {transactions.length}
      </p>

      {/* ANALYZE BUTTON */}
      <button
        onClick={handleAnalyze}
        className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl font-semibold"
      >
        {loading ? "Analyzing..." : "Run Banking Analysis"}
      </button>

      {/* RESULTS */}
      {result && (
        <div className="bg-slate-800 p-6 rounded-xl space-y-2">
          <p>Avg Monthly Credit: ₹ {result.consolidated.avg_monthly_credit}</p>
          <p>Avg Monthly Debit: ₹ {result.consolidated.avg_monthly_debit}</p>
          <p>Net Surplus: ₹ {result.consolidated.net_monthly_surplus}</p>
          <p>Hygiene Score: {result.hygiene_score}</p>
          <p>Status: {result.hygiene_status}</p>
        </div>
      )}
    </div>
  );
}
