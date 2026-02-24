import { useState } from "react";
import axios from "axios";
import { wcCalculate } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE = "https://YOUR-RAILWAY-URL"; // replace

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
  const [stress, setStress] = useState(20);
  const [loading, setLoading] = useState(false);

  /* ===============================
     HANDLE INPUT CHANGE
  =============================== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ===============================
     FILE UPLOAD
  =============================== */
  const handleUpload = async (file) => {
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await axios.post(`${API_BASE}/wc/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm((prev) => ({ ...prev, ...res.data }));
      alert("Parsed successfully.");
    } catch (err) {
      console.error(err);
      alert("File parsing failed.");
    }
  };

  /* ===============================
     BACKEND CALCULATE
  =============================== */
  const handleCalculate = async () => {
    try {
      setLoading(true);

      const payload = {};
      Object.keys(form).forEach((k) => {
        payload[k] = Number(form[k]) || 0;
      });

      const res = await wcCalculate(payload);

      setResult(res.data);
      localStorage.setItem("wc_result", JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
      alert("Backend error. Check console.");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     HEATMAP COLOR
  =============================== */
  const getHeatColor = () => {
    if (!result) return "bg-gray-700";
    if (result.liquidity_score > 80) return "bg-emerald-500";
    if (result.liquidity_score > 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-8">

      <h2 className="text-3xl font-bold text-blue-400">
        Working Capital Engine
      </h2>

      {/* ===============================
          FILE UPLOAD SECTION
      =============================== */}
      <div className="flex gap-10">
        <div>
          <p className="text-slate-400 mb-2">Upload Balance Sheet</p>
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.pdf"
            onChange={(e) => handleUpload(e.target.files[0])}
          />
        </div>

        <div>
          <p className="text-slate-400 mb-2">Upload Profit & Loss</p>
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.pdf"
            onChange={(e) => handleUpload(e.target.files[0])}
          />
        </div>
      </div>

      {/* ===============================
          INPUT SECTION
      =============================== */}
      <div className="grid grid-cols-4 gap-4">
        {Object.keys(form).map((key) => (
          <input
            key={key}
            name={key}
            value={form[key]}
            onChange={handleChange}
            placeholder={key.replace("_", " ").toUpperCase()}
            className="bg-slate-800 p-3 rounded text-white"
          />
        ))}
      </div>

      <button
        onClick={handleCalculate}
        className="bg-emerald-600 px-6 py-3 rounded"
      >
        {loading ? "Processing..." : "Run Backend Analysis"}
      </button>

      {/* ===============================
          RESULTS SECTION
      =============================== */}
      {result && (
        <>
          <div className="grid grid-cols-3 gap-6 mt-6">
            {Object.entries(result).map(([k, v]) => (
              <div key={k} className="bg-slate-900 p-4 rounded">
                <p className="text-slate-400">{k}</p>
                <h3 className="text-xl font-bold">{v}</h3>
              </div>
            ))}
          </div>

          {/* ===============================
              CHART
          =============================== */}
          <div className="mt-10 bg-slate-900 p-6 rounded">
            <h3 className="text-xl font-bold mb-4 text-blue-400">
              Financial Overview
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: "NWC", value: result.nwc },
                  { name: "Drawing Power", value: result.drawing_power },
                  { name: "Operating Cycle", value: result.operating_cycle },
                ]}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ===============================
              HEATMAP
          =============================== */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">
              Liquidity Stress Heatmap
            </h4>

            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-10 rounded ${getHeatColor()}`} />
              ))}
            </div>
          </div>

          {/* ===============================
              STRESS SLIDER
          =============================== */}
          <div className="mt-6 bg-slate-900 p-6 rounded">
            <h4 className="text-lg font-semibold mb-2">
              Stress Simulation ({stress}%)
            </h4>

            <input
              type="range"
              min="10"
              max="40"
              value={stress}
              onChange={(e) => setStress(e.target.value)}
              className="w-full"
            />

            <p className="mt-4">
              Stressed NWC: ₹{" "}
              {(result.nwc - (result.nwc * stress) / 100).toFixed(2)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
