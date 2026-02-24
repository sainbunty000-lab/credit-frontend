import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist";
import { bankingAnalyze } from "../../services/api";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function Banking() {
  const [transactions, setTransactions] = useState([]);
  const [result, setResult] = useState(null);

  /* ============================
     FILE HANDLER
  ============================ */
  const handleUpload = async (file) => {
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "csv") {
      parseCSV(file);
    } else if (ext === "xlsx" || ext === "xls") {
      parseExcel(file);
    } else if (ext === "pdf") {
      parsePDF(file);
    } else {
      alert("Unsupported file type");
    }
  };

  /* ============================
     CSV PARSER
  ============================ */
  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const cleaned = res.data.map(normalizeRow);
        setTransactions(cleaned);
      },
    });
  };

  /* ============================
     EXCEL PARSER
  ============================ */
  const parseExcel = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      const cleaned = json.map(normalizeRow);
      setTransactions(cleaned);
    };

    reader.readAsArrayBuffer(file);
  };

  /* ============================
     PDF PARSER (TEXT BASED)
  ============================ */
  const parsePDF = async (file) => {
    const fileReader = new FileReader();

    fileReader.onload = async function () {
      const typedarray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;

      let textContent = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        textContent += content.items.map((item) => item.str).join(" ");
      }

      const rows = textContent.split("\n");

      const parsed = rows.map((line) => {
        const parts = line.split(" ");
        return {
          date: parts[0] || "",
          credit: parseFloat(parts[1]) || 0,
          debit: parseFloat(parts[2]) || 0,
          desc: parts.slice(3).join(" "),
          account: file.name,
        };
      });

      setTransactions(parsed);
    };

    fileReader.readAsArrayBuffer(file);
  };

  /* ============================
     NORMALIZE ROW
  ============================ */
  const normalizeRow = (row) => {
    return {
      date: row.date || row.Date || "",
      credit: parseFloat(row.credit || row.Credit || 0),
      debit: parseFloat(row.debit || row.Debit || 0),
      desc: row.desc || row.Description || "",
      account: row.account || "Primary",
    };
  };

  /* ============================
     ANALYZE
  ============================ */
  const handleAnalyze = async () => {
    const res = await bankingAnalyze({
      transactions,
      months_count: 3,
    });

    setResult(res.data);
    localStorage.setItem("banking_result", JSON.stringify(res.data));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-emerald-400">
        Banking Intelligence
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
        Analyze
      </button>

      {result && (
        <div className="bg-slate-900 p-6 rounded-xl mt-6">
          <p>Hygiene Score: {result.hygiene_score}</p>
          <p>Status: {result.hygiene_status}</p>
          <p>Net Monthly Surplus: ₹ {result.consolidated.net_monthly_surplus}</p>
        </div>
      )}
    </div>
  );
}
