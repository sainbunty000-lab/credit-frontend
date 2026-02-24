import { useEffect, useState } from "react";

export default function Cases() {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("saved_cases")) || [];
    setCases(saved);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Saved Cases</h1>
      {cases.map((c, i) => (
        <div key={i} className="bg-slate-900 p-4 rounded-xl mb-4">
          <p>{c.name}</p>
          <p className="text-sm text-slate-400">{c.createdAt}</p>
        </div>
      ))}
    </div>
  );
}
