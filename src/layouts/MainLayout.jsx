import { Link } from "react-router-dom";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="p-6 flex gap-6 border-b border-slate-800">
        <Link to="/">Underwriting</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/cases">Cases</Link>
      </nav>
      <div className="p-8">{children}</div>
    </div>
  );
}
