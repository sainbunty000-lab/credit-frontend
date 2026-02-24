import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist";
import { wcCalculate } from "../../services/api";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const dictionary = {
  current_assets: ["current assets"],
  current_liabilities: ["current liabilities"],
  inventory: ["inventory", "stock"],
  receivables: ["receivable", "debtors"],
  payables: ["payable", "creditors"],
  annual_sales: ["revenue", "sales", "turnover"],
  cogs: ["cost of goods sold", "cogs"],
  bank_credit: ["bank overdraft", "cash credit"]
};

export default function WorkingCapital() {
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);

  /* ===============================
     PARSE FILE
  =============================== */
  const handleUpload = async (file) => {
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "csv") parseCSV(file);
    else if (ext === "xlsx" || ext === "xls") parseExcel(file);
    else if (ext === "pdf") parsePDF(file);
    else alert("Unsupported format");
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: false,
      complete: (res) => extractFinancials(res.data),
    });
  };

  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      extractFinancials(json);
    };
    reader.readAsArrayBuffer(file);
  };

  const parsePDF = async (file) => {
    const reader = new FileReader();
    reader.onload = async function () {
      const typedarray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n";
      }

      const rows = text.split("\n").map((r) => r.split(" "));
      extractFinancials(rows);
    };
    reader.readAsArrayBuffer(file);
  };

  /* ===============================
     EXTRACT LOGIC
  =============================== */
  const extractFinancials = (rows) => {
    let extracted = {};

    rows.forEach((row) => {
      const line = row.join(" ").toLowerCase();

      Object.keys(dictionary).forEach((key) => {
        dictionary[key].forEach((keyword) => {
          if (line.includes(keyword)) {
            const numberMatch = line.match(/[-+]?\d[\d,]*/);
            if (numberMatch) {
              extracted[key] = parseFloat(
                numberMatch[0].replace(/,/g, "")
              );
            }
          }
        });
      });
    });

    setForm((prev) => ({ ...prev, ...extracted }));
  };

  /* ===============================
     ANALYZE
  =============================== */
  const handleAnalyze = async () => {
    const res = await wcCalculate(form);
    setResult(res.data);
    localStorage.setItem("wc_result", JSON.stringify(res.data));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-emerald-400">
        Working Capital Engine
      </h1>

      <input
        type="file"
        onChange={(e) => handleUpload(e.target.files[0])}
        className="bg-slate-900 p-3 rounded-xl"
      />

      <button
        onClick={handleAnalyze}
        className="bg-emerald-600 px-6 py-3 rounded-xl"
      >
        Run Analysis
      </button>

      {result && (
        <div className="bg-slate-900 p-6 rounded-xl mt-6">
          <p>NWC: ₹ {result.nwc}</p>
          <p>Current Ratio: {result.current_ratio}</p>
          <p>Liquidity Score: {result.liquidity_score}</p>
        </div>
      )}
    </div>
  );
}
