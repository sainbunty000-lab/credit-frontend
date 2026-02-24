import { useState, useEffect } from "react";
import jsPDF from "jspdf";

export default function Dashboard() {
  const [wc, setWc] = useState(null);
  const [agri, setAgri] = useState(null);
  const [banking, setBanking] = useState(null);
  const [decisionText, setDecisionText] = useState("");
  const [caseName, setCaseName] = useState("");

  useEffect(() => {
    const wcData = JSON.parse(localStorage.getItem("wc_result"));
    const agriData = JSON.parse(localStorage.getItem("agri_result"));
    const bankingData = JSON.parse(localStorage.getItem("banking_result"));

    setWc(wcData);
    setAgri(agriData);
    setBanking(bankingData);

    generateDecision(wcData, agriData, bankingData);
  }, []);

  /* ===========================
     MASTER SCORE CALCULATION
  =========================== */
  const computeMasterScore = (wcData, agriData, bankingData) => {
    const B = bankingData?.hygiene_score ?? 0;
    const W = wcData?.liquidity_score ?? 0;
    const A = agriData?.agri_score ?? 0;

    if (!wcData && !agriData && !bankingData) return null;

    return Number((0.4 * B + 0.35 * W + 0.25 * A).toFixed(2));
  };

  /* ===========================
     DECISION ENGINE
  =========================== */
  const generateDecision = (wcData, agriData, bankingData) => {
    let decision = "Underwriting Summary:\n\n";

    const masterScore = computeMasterScore(wcData, agriData, bankingData);

    if (!masterScore) {
      decision += "Insufficient data available.";
      setDecisionText(decision);
      return;
    }

    if (agriData?.status === "Rejected") {
      decision += "Application rejected due to agriculture rejection condition.\n";
      setDecisionText(decision);
      return;
    }

    if (bankingData) {
      decision += `Banking Hygiene Score: ${bankingData?.hygiene_score ?? 0} (${bankingData?.hygiene_status ?? "N/A"}).\n`;
    }

    if (wcData) {
      decision += `Working Capital Liquidity Score: ${wcData?.liquidity_score ?? 0}.\n`;
    }

    if (agriData) {
      decision += `EMI Stress Ratio: ${agriData?.emi_ratio ?? 0}%.\n`;
    }

    if (masterScore >= 80) {
      decision += "\nLow Risk – Full approval recommended.";
    } else if (masterScore >= 60) {
      decision += "\nModerate Risk – Controlled approval recommended.";
    } else {
      decision += "\nHigh Risk – Credit exposure not recommended.";
    }

    decision += `\n\nMaster Composite Score: ${masterScore}`;

    setDecisionText(decision);
  };

  /* ===========================
     SAVE CASE
  =========================== */
  const handleSave = () => {
    if (!caseName) return alert("Enter case name");

    const caseData = {
      name: caseName,
      createdAt: new Date().toISOString(),
      wc,
      agri,
      banking,
      decisionText,
    };

    const existing =
      JSON.parse(localStorage.getItem("saved_cases")) || [];

    existing.push(caseData);

    localStorage.setItem("saved_cases", JSON.stringify(existing));

    alert("Case saved successfully");
  };

  /* ===========================
     DOWNLOAD PDF
  =========================== */
  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Case: ${caseName || "Unnamed Case"}`, 10, 10);
    doc.setFontSize(11);
    doc.text(decisionText, 10, 20);
    doc.save(`${caseName || "dashboard"}.pdf`);
  };

  return (
    <div className="p-10 bg-slate-950 min-h-screen text-white space-y-10">

      <h1 className="text-4xl font-bold text-emerald-400">
        Executive Dashboard
      </h1>

      {/* Case Naming */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Enter Case Name"
          className="bg-slate-900 p-3 rounded-xl border border-slate-800"
          value={caseName}
          onChange={(e) => setCaseName(e.target.value)}
        />
        <button
          onClick={handleSave}
          className="bg-emerald-600 px-5 py-3 rounded-xl"
        >
          Save
        </button>
        <button
          onClick={handleDownload}
          className="bg-amber-600 px-5 py-3 rounded-xl"
        >
          Download PDF
        </button>
      </div>

      {/* Banking Section */}
      {banking && (
        <ModuleCard title="Banking Analysis">
          <p>Avg Monthly Credit: ₹ {banking?.consolidated?.avg_monthly_credit ?? 0}</p>
          <p>Avg Monthly Debit: ₹ {banking?.consolidated?.avg_monthly_debit ?? 0}</p>
          <p>Net Surplus: ₹ {banking?.consolidated?.net_monthly_surplus ?? 0}</p>
          <p>Hygiene Score: {banking?.hygiene_score ?? 0}</p>
          <p>Status: {banking?.hygiene_status ?? "N/A"}</p>
        </ModuleCard>
      )}

      {/* Working Capital Section */}
      {wc && (
        <ModuleCard title="Working Capital Analysis">
          <p>NWC: ₹ {wc?.nwc ?? 0}</p>
          <p>Current Ratio: {wc?.current_ratio ?? 0}</p>
          <p>Quick Ratio: {wc?.quick_ratio ?? 0}</p>
          <p>Operating Cycle: {wc?.operating_cycle ?? 0} days</p>
        </ModuleCard>
      )}

      {/* Agriculture Section */}
      {agri && (
        <ModuleCard title="Agriculture Analysis">
          <p>Total Adjusted Income: ₹ {agri?.total_adjusted_income ?? 0}</p>
          <p>Disposable Income: ₹ {agri?.disposable_income ?? 0}</p>
          <p>Loan Eligibility: ₹ {agri?.loan_eligibility ?? 0}</p>
          <p>EMI Ratio: {agri?.emi_ratio ?? 0}%</p>
          <p>Status: {agri?.status ?? "N/A"}</p>
        </ModuleCard>
      )}

      {/* Final Decision */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-semibold mb-3">
          Final Underwriting Decision
        </h2>
        <p className="text-slate-300 whitespace-pre-line">
          {decisionText}
        </p>
      </div>

    </div>
  );
}

/* ===========================
   REUSABLE CARD
=========================== */
function ModuleCard({ title, children }) {
  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
      <h2 className="text-xl font-semibold mb-3 text-emerald-400">
        {title}
      </h2>
      {children}
    </div>
  );
}
