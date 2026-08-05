/**
 * The backend burns the heatmap directly into the annotated output video
 * (see app/ai/heatmap.py) rather than exposing raw heatmap data via an API,
 * so there's no JSON endpoint to plot pixel-level heat from. This component
 * renders a lightweight zone-density heatmap grid from whatever zone counts
 * you pass it (e.g. from analyze_video's `zone_analysis` response), and can
 * be swapped for an <img src={report.output_video}> preview once you have
 * a processed report.
 */
export default function Heatmap({ zones = {}, imageSrc = null }) {
  if (imageSrc) {
    return (
      <div className="overflow-hidden rounded-xl border border-surface-border">
        <img src={imageSrc} alt="Crowd heatmap" className="w-full object-cover" />
      </div>
    )
  }

  const entries = Object.entries(zones)
  const max = Math.max(1, ...entries.map(([, v]) => v))

  const heat = (value) => {
    const ratio = value / max
    if (ratio > 0.75) return 'bg-danger/70'
    if (ratio > 0.5) return 'bg-warning/60'
    if (ratio > 0.25) return 'bg-info/50'
    return 'bg-success/40'
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {entries.length === 0 && (
        <p className="col-span-2 text-sm text-slate-500">No heatmap data yet</p>
      )}
      {entries.map(([zone, count]) => (
        <div
          key={zone}
          className={`flex aspect-square flex-col items-center justify-center rounded-lg ${heat(count)}`}
        >
          <span className="text-xs font-medium text-white/80">{zone}</span>
          <span className="text-lg font-bold text-white">{count}</span>
        </div>
      ))}
    </div>
  )
}
