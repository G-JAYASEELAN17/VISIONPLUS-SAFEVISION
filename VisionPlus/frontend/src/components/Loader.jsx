export function Spinner({ size = 24, className = '' }) {
  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-surface-border border-t-primary ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-3 text-slate-400">
      <Spinner size={32} />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function SkeletonBlock({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-elevated ${className}`}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-card">
      <SkeletonBlock className="mb-3 h-4 w-24" />
      <SkeletonBlock className="mb-2 h-8 w-16" />
      <SkeletonBlock className="h-3 w-20" />
    </div>
  )
}
