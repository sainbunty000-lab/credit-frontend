export default function StatusBadge({ status }) {
  const color =
    status === "Eligible"
      ? "text-emerald-400"
      : status === "Rejected"
      ? "text-red-400"
      : "text-amber-400";

  return <span className={`font-bold ${color}`}>{status}</span>;
}
