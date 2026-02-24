import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { bankingAnalyze } from "../../services/api";

export default function Banking() {
  const [transactions, setTransactions] = useState([]);
  const [result, setResult] = useState(null);

  /* =========================
     HANDLE FILE UPLOAD
  ========================= */
  const handleUpload = (files) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const ext = file.name.split(".").pop().toLowerCase();

      if (ext === "csv") {
        parseCSV(file);
      } else if (ext === "xlsx" || ext === "xls") {
        parseExcel(file);
      } else {
        alert("Only CSV and Excel supported currently.");
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
    });
  };

  /* =========================
     EXCEL PARSER
  ========================= */
  const parseExcel = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      const cleaned = json.map(normalizeRow);
      setTransactions((prev) => [...prev, ...cleaned]);
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
     ANALYZE
  ========================= */
  const handleAnalyze = async () => {
    if (transactions.length === 0) {
      alert("Upload file first");
      return;
    }

    try {
      const res = await bankingAnalyze({
        transactions,
        months_count: 3,
      });

      setResult(res.data);
      localStorage.setItem("banking_result", JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
      alert("Analysis failed");
    }
  };

  return (
    <div className="space-y-6 bg-slate-900 p-6 rounded-2xl border border-slate-800">

      <h2 className="text-2xl font-bold text-emerald-400">
        Banking Intelligence Engine
      </h2>

      {/* FILE INPUT */}
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        multiple
        onChange={(e) => handleUpload(e.target.files)}
        className="bg-slate-800 p-3 rounded-xl"
      />

      <p className="text-slate-400">
        Transactions Loaded: {transactions.length}
      </p>

      {/* ANALYZE BUTTON */}
      <button
        onClick={handleAnalyze}
        className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl font-semibold"
      >
        Run Banking Analysis
      </button>

      {/* RESULTS */}
      {result && (
        <div className="bg-slate-800 p-4 rounded-xl space-y-2">
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
