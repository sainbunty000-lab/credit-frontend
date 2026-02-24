import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { wcCalculate } from "../../services/api";

export default function WorkingCapital() {
  const [form, setForm] = useState({
    current_assets: "",
    current_liabilities: "",
    inventory: "",
    receivables: "",
    payables: "",
    annual_sales: "",
    cogs: "",
    bank_credit: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     HANDLE FILE UPLOAD
  ========================= */
  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "csv") {
      parseCSV(file);
    } else if (ext === "xlsx" || ext === "xls") {
      parseExcel(file);
    } else {
      alert("Only CSV and Excel supported.");
    }
  };

  /* =========================
     CSV PARSER
  ========================= */
  const parseCSV = (file) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (res) => {
        extractFinancials(res.data);
      },
      error: (err) => {
        console.error("CSV Parse Error:", err);
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
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        extractFinancials(json);
      } catch (err) {
        console.error("Excel Parse Error:", err);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  /* =========================
     SIMPLE KEYWORD MATCHING
  ========================= */
  const extractFinancials = (rows) => {
    const extracted = {};

    rows.forEach((row) => {
      const line = row.join(" ").toLowerCase();

      if (line.includes("current assets")) {
        extracted.current_assets = extractNumber(line);
      }
      if (line.includes("current liabilities")) {
        extracted.current_liabilities = extractNumber(line);
      }
      if (line.includes("inventory")) {
        extracted.inventory = extractNumber(line);
      }
      if (line.includes("receivable") || line.includes("debtors")) {
        extracted.receivables = extractNumber(line);
      }
      if (line.includes("payable") || line.includes("creditors")) {
        extracted.payables = extractNumber(line);
      }
      if (line.includes("revenue") || line.includes("sales")) {
        extracted.annual_sales = extractNumber(line);
      }
      if (line.includes("cost of goods") || line.includes("cogs")) {
        extracted.cogs = extractNumber(line);
      }
      if (line.includes("bank overdraft") || line.includes("cash credit")) {
        extracted.bank_credit = extractNumber(line);
      }
    });

    setForm((prev) => ({ ...prev, ...extracted }));
  };

  /* =========================
     NUMBER EXTRACTOR
  ========================= */
  const extractNumber = (text) => {
    const match = text.match(/[-+]?\d[\d,]*/);
    return match ? match[0].replace(/,/g, "") : "";
  };

  /* =========================
     MANUAL INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================
     ANALYZE WC
  ========================= */
  const handleAnalyze = async () => {
    try {
      setLoading(true);

      const res = await wcCalculate({
        current_assets: Number(form.current_assets) || 0,
        current_liabilities: Number(form.current_liabilities) || 0,
        inventory: Number(form.inventory) || 0,
        receivables: Number(form.receivables) || 0,
        payables: Number(form.payables) || 0,
        annual_sales: Number(form.annual_sales) || 0,
        cogs: Number(form.cogs) || 0,
        bank_credit: Number(form.bank_credit) || 0,
      });

      setResult(res.data);
      localStorage.setItem("wc_result", JSON.stringify(res.data));
    } catch (err) {
      console.error("WC Analysis Error:", err);
      alert("Working Capital analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 bg-slate-900 p-6 rounded-2xl border border-slate-800">

      <h2 className="text-3xl font-bold text-emerald-400">
        Working Capital Engine
      </h2>

      {/* FILE INPUT */}
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleUpload}
        className="bg-slate-800 p-3 rounded-xl w-full"
      />

      {/* FORM INPUTS */}
      <div className="grid grid-cols-2 gap-4">
        {Object.keys(form).map((key) => (
          <input
            key={key}
            name={key}
            value={form[key]}
            onChange={handleChange}
            placeholder={key.replace("_", " ").toUpperCase()}
            className="bg-slate-800 p-3 rounded-xl"
          />
        ))}
      </div>

      <button
        onClick={handleAnalyze}
        className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl font-semibold"
      >
        {loading ? "Analyzing..." : "Run WC Analysis"}
      </button>

      {result && (
        <div className="bg-slate-800 p-6 rounded-xl space-y-2">
          <p>NWC: ₹ {result.nwc}</p>
          <p>Current Ratio: {result.current_ratio}</p>
          <p>Liquidity Score: {result.liquidity_score}</p>
        </div>
      )}
    </div>
  );
}
