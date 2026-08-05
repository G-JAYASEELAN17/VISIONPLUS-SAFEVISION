import { useCallback, useEffect, useState, useMemo } from "react";
import {
  MdCloudUpload,
  MdCheckCircle,
  MdHourglassTop,
  MdVideoLibrary,
  MdUploadFile,
  MdSmartToy,
  MdDelete,
  MdRefresh,
  MdPlayArrow,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { useFetch } from "../hooks/useFetch";
import {
  getVideos,
  uploadVideo,
  analyzeVideo,
} from "../services/api";

import { Spinner } from "../components/Loader";

export default function UploadVideo() {
  const { data: videos, loading, refetch } = useFetch(getVideos, []);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);

    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;

    // Validate size (< 2GB) and format (video only)
    if (!dropped.type.startsWith("video/")) {
      toast.error("Unsupported file type! Please upload a valid video.");
      return;
    }
    if (dropped.size > 2 * 1024 * 1024 * 1024) {
      toast.error("File exceeds 2GB maximum size limit!");
      return;
    }

    setFile(dropped);
    setPreviewUrl(URL.createObjectURL(dropped));
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setProgress(0);

      await uploadVideo(file, (evt) => {
        if (!evt.total) return;
        setProgress(Math.round((evt.loaded * 100) / evt.total));
      });

      toast.success("Video uploaded successfully");
      setFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      refetch();
    } catch (err) {
      toast.error(
        err?.response?.data?.detail || err?.message || "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (videoId) => {
    try {
      setAnalyzingId(videoId);
      const { data } = await analyzeVideo(videoId);
      toast.success(
        `Analysis Complete! Max People: ${data.maximum_people} • Risk: ${data.highest_risk}`
      );
      refetch();
    } catch (err) {
      toast.error(
        err?.response?.data?.detail || err?.message || "Analysis failed"
      );
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleCancel = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setProgress(0);
    toast.success("Upload canceled");
  };

  const fileSizeMB = useMemo(() => {
    if (!file) return 0;
    return (file.size / (1024 * 1024)).toFixed(1);
  }, [file]);

  return (
    <div className="space-y-6 select-none">
      {/* Title Header */}
      <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">AI Video Core</h1>
          <p className="text-sm text-text-muted">Import security streams, queue raw telemetry files, and execute computer vision diagnostics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Left Side: Upload console */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 shadow-2xl flex flex-col justify-between"
        >
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-primary">
                <MdCloudUpload className="text-2xl" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Import Telemetry</h2>
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Drag & drop raw CCTV streams</p>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-300 ${
                dragOver
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : "border-white/10 hover:border-primary/50"
              }`}
              aria-label="Upload file area"
            >
              <MdUploadFile className="mb-3 text-5xl text-primary" />
              <h3 className="text-sm font-bold text-white">
                {file ? file.name : "Drop video file here"}
              </h3>
              
              <div className="mt-3 flex gap-1.5">
                <span className="rounded-lg bg-slate-900 border border-white/5 px-2 py-0.5 text-[9px] font-bold text-slate-400">MP4</span>
                <span className="rounded-lg bg-slate-900 border border-white/5 px-2 py-0.5 text-[9px] font-bold text-slate-400">AVI</span>
                <span className="rounded-lg bg-slate-900 border border-white/5 px-2 py-0.5 text-[9px] font-bold text-slate-400">MOV</span>
              </div>
              <p className="mt-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Max Size Limit: 2 GB</p>

              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (!selected) return;

                  if (selected.size > 2 * 1024 * 1024 * 1024) {
                    toast.error("File exceeds 2GB maximum size limit!");
                    return;
                  }

                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                  }
                  setFile(selected);
                  setPreviewUrl(URL.createObjectURL(selected));
                }}
              />
            </label>

            {/* Video File Metadata Preview HUD */}
            <AnimatePresence>
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-5 rounded-2xl border border-white/5 bg-slate-950/40 p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[200px]">{file.name}</h4>
                      <p className="text-[10px] text-text-muted">{fileSizeMB} MB • Ready to process</p>
                    </div>
                    <button
                      onClick={handleCancel}
                      className="rounded-lg p-1.5 hover:bg-white/5 text-slate-400 hover:text-white transition"
                      title="Clear file selection"
                      aria-label="Clear selection"
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>

                  {previewUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-white/5">
                      <video src={previewUrl} controls className="w-full aspect-video object-cover" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress indicators */}
            {uploading && (
              <div className="mt-5 rounded-2xl bg-slate-950/40 border border-white/5 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Spinner size={12} />
                    <span>Uploading Stream</span>
                  </span>
                  <span className="font-bold text-primary">{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-card hover:bg-primary-dark transition disabled:opacity-50"
              aria-label="Confirm upload file"
            >
              {uploading ? <Spinner size={16} /> : <MdCloudUpload className="text-base" />}
              <span>{uploading ? "Uploading telemetry..." : "Confirm Upload"}</span>
            </button>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.02] p-4">
              <h3 className="font-bold text-indigo-400 text-xs flex items-center gap-1.5">
                <MdSmartToy />
                <span>AI Diagnostics Rules</span>
              </h3>
              <ul className="mt-2.5 space-y-1.5 text-[10px] text-slate-300 font-medium">
                <li>• Stable static CCTV streams improve detection confidence parameters.</li>
                <li>• Multi-object class filters are automatically configured on upload.</li>
                <li>• System extracts executive reports immediately after analysis completes.</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Right Side: List of recent uploads */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 shadow-2xl flex flex-col justify-between"
        >
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Capture Logs</h2>
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Historical video files queue</p>
              </div>
              <button
                onClick={refetch}
                className="rounded-xl border border-white/10 bg-white/[0.01] hover:bg-white/5 p-2 text-slate-400 hover:text-white transition"
                title="Refresh video files"
                aria-label="Refresh video feeds"
              >
                <MdRefresh className="text-base" />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner size={30} />
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[460px] pr-2 scrollbar-thin">
                {(videos || []).length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center bg-white/[0.01]">
                    <MdVideoLibrary className="mx-auto text-4xl text-slate-600" />
                    <p className="mt-3 text-xs text-slate-500 font-semibold uppercase tracking-wider">No video uploads cataloged</p>
                  </div>
                )}

                {(videos || []).map((video) => (
                  <div
                    key={video.id}
                    className="rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] p-4 flex flex-col gap-3 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate max-w-[200px]">{video.filename}</h4>
                        <p className="text-[9px] text-text-muted mt-0.5">
                          Date: {new Date(video.uploaded_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`rounded-xl border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${
                        video.status === 'Analyzed'
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {video.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <div className="text-[9px] text-slate-500 font-semibold uppercase">
                        AI Status: <span className="text-slate-300 font-bold">{video.status}</span>
                      </div>

                      {video.status !== "Analyzed" ? (
                        <button
                          onClick={() => handleAnalyze(video.id)}
                          disabled={analyzingId === video.id}
                          className="flex items-center gap-1 rounded-lg bg-primary px-3.5 py-1.5 text-[10px] font-bold text-white transition hover:bg-primary-dark disabled:opacity-50"
                          aria-label="Analyze with AI"
                        >
                          {analyzingId === video.id ? (
                            <>
                              <MdHourglassTop className="animate-spin text-xs" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <MdPlayArrow className="text-xs" />
                              <span>Analyze with AI</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-400">
                          <MdCheckCircle />
                          <span>Diagnostics Complete</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}