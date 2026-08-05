import { useCallback, useEffect, useState } from "react";
import {
  MdCloudUpload,
  MdCheckCircle,
  MdHourglassTop,
  MdVideoLibrary,
  MdUploadFile,
  MdSmartToy,
} from "react-icons/md";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { useFetch } from "../hooks/useFetch";
import {
  getVideos,
  uploadVideo,
  analyzeVideo,
} from "../services/api";

import { Spinner } from "../components/Loader";

export default function UploadVideo() {
  const {
    data: videos,
    loading,
    refetch,
  } = useFetch(getVideos, []);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [progress, setProgress] = useState(0);

  const [uploading, setUploading] =
    useState(false);

  const [dragOver, setDragOver] =
    useState(false);

  const [analyzingId, setAnalyzingId] =
    useState(null);

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

    const dropped =
      e.dataTransfer.files?.[0];

    if (!dropped) return;

    setFile(dropped);

    setPreviewUrl(
      URL.createObjectURL(dropped)
    );
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);

      setProgress(0);

      await uploadVideo(file, (evt) => {
        if (!evt.total) return;

        setProgress(
          Math.round(
            (evt.loaded * 100) /
              evt.total
          )
        );
      });

      toast.success(
        "Video uploaded successfully"
      );

      setFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }

      setPreviewUrl(null);

      refetch();
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
          "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (
    videoId
  ) => {
    try {
      setAnalyzingId(videoId);

      const { data } =
        await analyzeVideo(videoId);

      toast.success(
        `Analysis Complete

Maximum People : ${data.maximum_people}

Highest Risk : ${data.highest_risk}`
      );

      refetch();
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
          "Analysis failed"
      );
    } finally {
      setAnalyzingId(null);
    }
  };

  return (<div className="space-y-6">

  {/* Header */}

  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-600/10 to-cyan-500/10 p-6 shadow-xl"
  >
    <div className="flex items-center gap-4">

      <div className="rounded-2xl bg-indigo-500/20 p-4">
        <MdVideoLibrary className="text-5xl text-indigo-400" />
      </div>

      <div>

        <h1 className="text-3xl font-bold text-white">

          AI Video Upload

        </h1>

        <p className="mt-2 text-slate-400">

          Upload CCTV footage to automatically detect people,
          crowd density, risk level and generate AI reports.

        </p>

      </div>

    </div>

  </motion.div>

  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

    {/* Upload Card */}

    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-800 bg-gradient-to-br from-[#111827] to-[#0F172A] p-6 shadow-2xl"
    >

      <div className="mb-6 flex items-center gap-3">

        <div className="rounded-xl bg-indigo-500/20 p-3">
          <MdCloudUpload className="text-3xl text-indigo-400" />
        </div>

        <div>

          <h2 className="text-xl font-bold text-white">

            Upload New Video

          </h2>

          <p className="text-sm text-slate-400">

            Drag & Drop or Browse

          </p>

        </div>

      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-300 ${
          dragOver
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-slate-700 hover:border-primary"
        }`}
      >

        <MdUploadFile className="mb-4 text-6xl text-indigo-400" />

        <h3 className="text-lg font-semibold text-white">

          {file ? file.name : "Drop your video here"}

        </h3>

        <p className="mt-2 text-sm text-slate-400">

          Supports MP4 • AVI • MOV

        </p>

        <p className="text-xs text-slate-500">

          Maximum File Size : 2 GB

        </p>

        <input
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const selected =
              e.target.files?.[0]

            if (!selected) return

            if (previewUrl) {
  URL.revokeObjectURL(previewUrl)
}

setFile(selected)
setPreviewUrl(URL.createObjectURL(selected))
          }}
        />

      </label>

      {/* Preview */}

      {previewUrl && (

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-700">

          <video
            src={previewUrl}
            controls
            className="w-full"
          />

        </div>

      )}

      {/* Upload Progress */}

      {uploading && (

        <div className="mt-6 rounded-2xl bg-slate-900 p-5">

          <div className="mb-3 flex items-center gap-2">

            <MdSmartToy className="animate-pulse text-2xl text-indigo-400" />

            <span className="font-semibold text-white">

              AI Processing...

            </span>

          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-700">

            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${progress}%`,
              }}
              className="h-full rounded-full bg-indigo-500"
            />

          </div>

          <p className="mt-3 text-sm text-slate-400">

            Uploading...

            <span className="ml-2 font-bold text-indigo-400">

              {progress}%

            </span>

          </p>

        </div>

      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 py-3 text-lg font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
      >

        {uploading ? (
          <Spinner size={20} />
        ) : (
          <MdCloudUpload className="text-2xl" />
        )}

        {uploading ? "Uploading..." : "Upload Video"}

      </button>

      <div className="mt-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5">

        <h3 className="font-semibold text-indigo-400">

          🤖 AI Upload Tips

        </h3>

        <ul className="mt-3 space-y-2 text-sm text-slate-300">

          <li>✔ MP4 format is recommended</li>

          <li>✔ Stable CCTV footage gives better detection</li>

          <li>✔ Good lighting improves AI accuracy</li>

          <li>✔ Maximum supported size: 2 GB</li>

        </ul>

      </div>

    </motion.div>
        {/* Recent Uploads */}

    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-800 bg-gradient-to-br from-[#111827] to-[#0F172A] p-6 shadow-2xl"
    >
      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-xl font-bold text-white">

            Recent Uploads

          </h2>

          <p className="text-sm text-slate-400">

            AI Ready Videos

          </p>

        </div>

        <div className="rounded-xl bg-primary/10 px-4 py-2">

          <span className="font-semibold text-primary-light">

            {(videos || []).length} Videos

          </span>

        </div>

      </div>

      {loading ? (

        <div className="flex justify-center py-12">

          <Spinner size={30} />

        </div>

      ) : (

        <div className="space-y-4">

          {(videos || []).length === 0 && (

            <div className="rounded-2xl border border-dashed border-slate-700 py-12 text-center">

              <MdVideoLibrary className="mx-auto text-6xl text-slate-600" />

              <p className="mt-4 text-slate-400">

                No videos uploaded yet

              </p>

            </div>

          )}

          {(videos || []).map((video) => (

            <motion.div
              key={video.id}
              whileHover={{
                scale: 1.02,
                y: -2,
              }}
              className="rounded-2xl border border-slate-700 bg-slate-900 p-5 transition-all"
            >

              <div className="flex items-center justify-between">

                <div className="min-w-0">

                  <h3 className="truncate text-lg font-semibold text-white">

                    {video.filename}

                  </h3>

                  <p className="mt-1 text-xs text-slate-500">

                    Uploaded :

                    {" "}

                    {new Date(
                      video.uploaded_at
                    ).toLocaleString()}

                  </p>

                </div>

                {video.status === "Analyzed" ? (

                  <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400">

                    ✓ ANALYZED

                  </span>

                ) : (

                  <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-400">

                    PENDING

                  </span>

                )}

              </div>

              <div className="mt-5 flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">

                    Status

                  </p>

                  <p className="font-semibold text-white">

                    {video.status}

                  </p>

                </div>

                {video.status !== "Analyzed" ? (

                  <button
                    onClick={() =>
                      handleAnalyze(video.id)
                    }
                    disabled={
                      analyzingId === video.id
                    }
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
                  >

                    {analyzingId ===
                    video.id ? (
                      <>
                        <MdHourglassTop className="animate-spin" />

                        Processing...

                      </>
                    ) : (
                      <>
                        <MdSmartToy />

                        Analyze with AI

                      </>
                    )}

                  </button>

                ) : (

                  <div className="flex items-center gap-2 text-green-400">

                    <MdCheckCircle />

                    Completed

                  </div>

                )}

              </div>

            </motion.div>

          ))}

        </div>

      )}

    </motion.div>
      </div>
</div>
  )
}