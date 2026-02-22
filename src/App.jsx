import { useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const BASE = "https://credit-backend-production-d988.up.railway.app";

export default function App() {
  const [data, setData] = useState(null);

  const calculateWC = async () => {
    const payload = {
      current_assets: 500,
      current_liabilities: 200,
      annual_sales: 1000,
    };

    const res = await axios.post(`${BASE}/wc/calculate`, payload);
    setData(res.data);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Working Capital Dashboard</h1>

      <button
        onClick={calculateWC}
        className="bg-blue-600 px-6 py-2 rounded mb-8"
      >
        Calculate Sample WC
      </button>

      {data && (
        <div className="bg-slate-800 p-6 rounded-xl">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: "NWC Eligible", value: data.nwc_eligible },
                { name: "Turnover Eligible", value: data.turnover_eligible },
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
