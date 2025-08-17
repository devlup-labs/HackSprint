export function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-block px-3 py-1 text-sm font-medium rounded-full bg-gray-200 text-gray-800 ${className}`}
    >
      {children}
    </span>
  );
}