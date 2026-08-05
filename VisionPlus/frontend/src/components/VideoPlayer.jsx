import { MdVideocamOff } from 'react-icons/md'

/**
 * Renders either:
 *  - a live MJPEG feed (GET /stream/) via a plain <img>, since that's how
 *    multipart/x-mixed-replace streams are consumed in the browser, or
 *  - a standard <video> element for uploaded/annotated .mp4 files.
 */
export default function VideoPlayer({ src, mode = 'video', live = false, className = '' }) {
  if (!src) {
    return (
      <div
        className={`flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl bg-black/60 text-slate-500 ${className}`}
      >
        <MdVideocamOff className="text-3xl" />
        <span className="text-xs">No feed available</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-xl bg-black ${className}`}>
      {live && (
        <span className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
          LIVE
        </span>
      )}
      {mode === 'mjpeg' ? (
        // eslint-disable-next-line jsx-a11y/img-redundant-alt
        <img src={src} alt="Live camera feed" className="aspect-video w-full object-cover" />
      ) : (
        <video src={src} controls className="aspect-video w-full object-cover" />
      )}
    </div>
  )
}
