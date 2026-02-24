export default function MetricCard({ title, value }) {
  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
      <p className="text-slate-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}
