export default function ChartCard({ title, action, children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-surface-border bg-surface-card p-5 shadow-card ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {action}
      </div>
      <div className="h-64">{children}</div>
    </div>
  )
}
