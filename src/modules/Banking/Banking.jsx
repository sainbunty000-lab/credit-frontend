import { useState, useEffect } from "react";
import Papa from "papaparse";
import { bankingAnalyze } from "../../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Banking() {
  const [transactions, setTransactions] = useState([]);
  const [result, setResult] = useState(null);
  const [months, setMonths] = useState(3);
  const [loading, setLoading] = useState(false);

  /* ======================================
     HANDLE MULTI CSV UPLOAD
  ====================================== */
  const handleUpload = (files) => {
    let merged = [];

    Array.from(files).forEach((file) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => {
          const cleaned = res.data.map((row) => ({
            date: row.date,
            credit: parseFloat(row.credit || 0),
            debit: parseFloat(row.debit || 0),
            desc: row.desc || "",
            account: file.name,
          }));

          merged = [...merged, ...cleaned];
          setTransactions(merged);
        },
      });
    });
  };

  /* ======================================
     AUTO ANALYZE WHEN TRANSACTIONS UPDATE
  ====================================== */
  useEffect(() => {
    if (transactions.length > 0) {
      runAnalysis();
    }
  }, [transactions]);

  /* ======================================
     CALL BACKEND ANALYSIS
  ====================================== */
  const runAnalysis = async () => {
    try {
      setLoading(true);

      const res = await bankingAnalyze({
        transactions,
        months_count: months,
      });

      setResult(res.data);
      localStorage.setItem("banking_result", JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
      alert("Banking analysis failed");
    } finally {
      setLoading(false);
    }
  };

  /* ======================================
     UI
  ====================================== */
  return (
    <div className="p-10 space-y-12 bg-slate-950 min-h-screen text-white">

      <h1 className="text-4xl font-bold text-emerald-400">
        Banking Intelligence Engine
      </h1>

      {/* Upload Section */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <p className="mb-4 font-semibold">
          Upload Bank Statements (CSV)
        </p>

        <input
          type="file"
          accept=".csv"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
        />

        <p className="text-slate-400 mt-3">
          Accounts Loaded: {new Set(transactions.map(t => t.account)).size}
        </p>
      </div>

      {loading && (
        <div className="text-amber-400 text-lg font-semibold">
          Analyzing transactions...
        </div>
      )}

      {result && (
        <>
          {/* ================= CONSOLIDATED METRICS ================= */}
          <div className="grid grid-cols-4 gap-6">

            <Metric
              title="Avg Monthly Credit"
              value={`₹ ${result.consolidated.avg_monthly_credit}`}
            />

            <Metric
              title="Avg Monthly Debit"
              value={`₹ ${result.consolidated.avg_monthly_debit}`}
            />

            <Metric
              title="Net Monthly Surplus"
              value={`₹ ${result.consolidated.net_monthly_surplus}`}
              danger={result.consolidated.net_monthly_surplus < 0}
            />

            <Metric
              title="Hygiene Score"
              value={`${result.hygiene_score}`}
              highlight
            />
          </div>

          {/* ================= HYGIENE STATUS ================= */}
          <div className="text-2xl font-bold">
            Banking Status:
            <span className={
              result.hygiene_status === "Strong"
                ? "text-emerald-400"
                : result.hygiene_status === "Moderate"
                ? "text-amber-400"
                : "text-red-400"
            }>
              {" "}{result.hygiene_status}
            </span>
          </div>

          {/* ================= ACCOUNT SUMMARY ================= */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Account-Level Summary
            </h2>

            <table className="w-full border border-slate-800">
              <thead>
                <tr className="bg-slate-900">
                  <th className="p-3 text-left">Account</th>
                  <th className="p-3 text-left">Total Credit</th>
                  <th className="p-3 text-left">Total Debit</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(result.account_summary).map(
                  ([acc, data]) => (
                    <tr key={acc} className="border-t border-slate-800">
                      <td className="p-3">{acc}</td>
                      <td className="p-3">{data.credit}</td>
                      <td className="p-3">{data.debit}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* ================= MONTHLY TREND CHART ================= */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h2 className="mb-4 font-semibold">
              Monthly Surplus Trend
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={Object.entries(result.monthly_breakdown).map(
                  ([month, data]) => ({
                    month,
                    surplus: data.credit - data.debit,
                  })
                )}
              >
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="surplus"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ================= RISK ALERTS ================= */}
          <div className="grid grid-cols-2 gap-6">
            <Metric
              title="Bounce Count"
              value={result.bounce_count}
              danger={result.bounce_count > 0}
            />

            <Metric
              title="Fraud Flags"
              value={result.fraud_flags}
              danger={result.fraud_flags > 0}
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ================= METRIC CARD ================= */
function Metric({ title, value, highlight, danger }) {
  return (
    <div className={`p-6 rounded-xl border border-slate-800 ${
      highlight ? "bg-emerald-900" : "bg-slate-900"
    }`}>
      <p className="text-slate-400 text-sm">{title}</p>
      <h2 className={`text-2xl font-bold mt-2 ${
        danger ? "text-red-400" : "text-white"
      }`}>
        {value}
      </h2>
    </div>
  );
}
