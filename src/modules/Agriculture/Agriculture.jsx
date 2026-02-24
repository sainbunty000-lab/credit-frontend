import { useState } from "react";
import { agriCalculate } from "../../services/api";

export default function Agriculture() {
  const [form, setForm] = useState({
    documented_income: "",
    tax: "",
    undocumented_income_monthly: "",
    emi_monthly: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ===============================
     HANDLE INPUT CHANGE
  =============================== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ===============================
     RUN ANALYSIS
  =============================== */
  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await agriCalculate({
        documented_income: Number(form.documented_income) || 0,
        tax: Number(form.tax) || 0,
        undocumented_income_monthly:
          Number(form.undocumented_income_monthly) || 0,
        emi_monthly: Number(form.emi_monthly) || 0,
      });

      setResult(res.data);
      localStorage.setItem("agri_result", JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
      setError("Agriculture calculation failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     RISK COLOR
  =============================== */
  const getRiskColor = () => {
    if (!result) return "text-white";
    if (result.status === "Rejected") return "text-red-400";
    if (result.emi_ratio > 40) return "text-amber-400";
    return "text-emerald-400";
  };

  return (
    <div className="p-10 bg-slate-950 min-h-screen text-white space-y-10">

      <h1 className="text-4xl font-bold text-emerald-400">
        Agriculture Credit Engine
      </h1>

      {/* ================= INPUT PANEL ================= */}
      <div className="grid grid-cols-4 gap-4">

        <input
          name="documented_income"
          placeholder="Annual Documented Income"
          className="bg-slate-900 p-3 rounded-xl border border-slate-800"
          onChange={handleChange}
        />

        <input
          name="tax"
          placeholder="Tax Paid"
          className="bg-slate-900 p-3 rounded-xl border border-slate-800"
          onChange={handleChange}
        />

        <input
          name="undocumented_income_monthly"
          placeholder="Monthly Undocumented Income"
          className="bg-slate-900 p-3 rounded-xl border border-slate-800"
          onChange={handleChange}
        />

        <input
          name="emi_monthly"
          placeholder="Monthly EMI"
          className="bg-slate-900 p-3 rounded-xl border border-slate-800"
          onChange={handleChange}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl font-semibold"
      >
        {loading ? "Analyzing..." : "Run Agriculture Analysis"}
      </button>

      {error && (
        <div className="text-red-400 font-semibold">{error}</div>
      )}

      {/* ================= RESULT SECTION ================= */}
      {result && (
        <div className="space-y-8">

          {/* Income Breakdown */}
          <div className="grid grid-cols-3 gap-6">

            <MetricCard
              title="Adjusted Documented Income"
              value={`₹ ${result.adjusted_documented_income ?? 0}`}
            />

            <MetricCard
              title="Adjusted Undocumented Income"
              value={`₹ ${result.adjusted_undocumented_income ?? 0}`}
            />

            <MetricCard
              title="Total Adjusted Income"
              value={`₹ ${result.total_adjusted_income ?? 0}`}
            />

          </div>

          {/* Repayment & Eligibility */}
          <div className="grid grid-cols-3 gap-6">

            <MetricCard
              title="Disposable Income"
              value={`₹ ${result.disposable_income ?? 0}`}
            />

            <MetricCard
              title="Loan Eligibility"
              value={`₹ ${result.loan_eligibility ?? 0}`}
            />

            <MetricCard
              title="Agri Risk Score"
              value={`${result.agri_score ?? 0}`}
              highlight
            />

          </div>

          {/* EMI Stress Panel */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">

            <p className="text-slate-400 text-sm uppercase">
              EMI Stress Ratio
            </p>

            <h3 className={`text-3xl font-bold mt-2 ${getRiskColor()}`}>
              {result.emi_ratio ?? 0} %
            </h3>

            <p className="text-slate-500 mt-2">
              {result.status === "Rejected"
                ? result.rejection_reason
                : result.emi_ratio > 40
                ? "Moderate to high repayment stress."
                : "Healthy repayment capacity."}
            </p>

          </div>

        </div>
      )}
    </div>
  );
}

/* ===============================
   METRIC CARD
=============================== */
function MetricCard({ title, value, highlight }) {
  return (
    <div
      className={`p-6 rounded-xl border border-slate-800 ${
        highlight ? "bg-emerald-900" : "bg-slate-900"
      }`}
    >
      <p className="text-slate-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}
