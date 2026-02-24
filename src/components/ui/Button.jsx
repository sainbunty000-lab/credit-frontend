export default function Button({ children, ...props }) {
  return (
    <button
      {...props}
      className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl font-semibold"
    >
      {children}
    </button>
  );
}
