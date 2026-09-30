import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  CircleHelp,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Video,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/features/shared/PageHeader";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/system-check")({
  head: () => ({
    meta: [
      { title: "System check — ProctorEdu" },
      {
        name: "description",
        content: "Verify camera, microphone, browser and connection before a proctored exam.",
      },
      { property: "og:title", content: "System check — ProctorEdu" },
      {
        property: "og:description",
        content: "Verify your device readiness before a proctored exam.",
      },
    ],
  }),
  component: SystemCheck,
});

interface CheckItem {
  key: CheckKey;
  label: string;
  detail: string;
}

type CheckKey =
  | "camera"
  | "microphone"
  | "face"
  | "multipleFaces"
  | "objects"
  | "noise"
  | "fullscreen"
  | "tab"
  | "network"
  | "screen";

const checkList: CheckItem[] = [
  {
    key: "camera",
    label: "Camera access",
    detail: "A working webcam is required for face monitoring.",
  },
  {
    key: "microphone",
    label: "Microphone access",
    detail: "Confirms the browser can receive microphone input.",
  },
  {
    key: "face",
    label: "Face detection",
    detail: "Checks that one face is visible and reasonably centred.",
  },
  {
    key: "multipleFaces",
    label: "Multiple face detection",
    detail: "Checks for more than one person in the camera view.",
  },
  {
    key: "objects",
    label: "Personal item detection",
    detail: "Checks for detectable phones, books, laptops and similar items.",
  },
  {
    key: "noise",
    label: "Background noise",
    detail: "Measures loud ambient sound; it does not identify voices or their source.",
  },
  {
    key: "fullscreen",
    label: "Fullscreen mode",
    detail: "Requests fullscreen and detects when it is exited.",
  },
  {
    key: "tab",
    label: "Tab focus monitoring",
    detail: "Detects when this page becomes hidden; switching tabs is not blocked.",
  },
  {
    key: "network",
    label: "Network connection",
    detail: "Checks that the exam service responds over the network.",
  },
  {
    key: "screen",
    label: "Single display",
    detail: "Checks whether the browser can detect an extended display.",
  },
];

type State = "idle" | "running" | "pass" | "fail" | "unsupported";
type CheckResult = { state: State; detail: string };

const initialResults = (): Record<CheckKey, CheckResult> =>
  Object.fromEntries(
    checkList.map((check) => [check.key, { state: "idle", detail: check.detail }]),
  ) as Record<CheckKey, CheckResult>;

const flaggedObjectLabels = new Set([
  "cell phone",
  "book",
  "laptop",
  "remote",
  "keyboard",
  "mouse",
]);

function SystemCheck() {
  const [results, setResults] = useState<Record<CheckKey, CheckResult>>(initialResults);
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [faceCount, setFaceCount] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamsRef = useRef<MediaStream[]>([]);
  const focusMonitorRef = useRef(false);
  const mountedRef = useRef(true);

  const updateCheck = (key: CheckKey, state: State, detail: string) => {
    if (!mountedRef.current) return;
    setResults((previous) => ({ ...previous, [key]: { state, detail } }));
  };

  const stopStreams = () => {
    mediaStreamsRef.current.forEach((stream) =>
      stream.getTracks().forEach((track) => track.stop()),
    );
    mediaStreamsRef.current = [];
    if (videoRef.current) videoRef.current.srcObject = null;
    setFaceCount(null);
  };

  const run = async () => {
    if (running) return;
    stopStreams();
    setResults(
      Object.fromEntries(
        checkList.map((check) => [check.key, { state: "running", detail: "Checking…" }]),
      ) as Record<CheckKey, CheckResult>,
    );
    setHasRun(true);
    setRunning(true);
    focusMonitorRef.current = true;
    updateCheck(
      "tab",
      "pass",
      "Focus monitoring is active. Switching away will mark this check as failed.",
    );

    const fullscreenRequest = document.documentElement.requestFullscreen
      ? document.documentElement.requestFullscreen()
      : null;
    if (!fullscreenRequest) {
      updateCheck("fullscreen", "unsupported", "Fullscreen is not supported by this browser.");
    } else {
      try {
        await fullscreenRequest;
        updateCheck("fullscreen", "pass", "Fullscreen is active. Press Escape to exit.");
      } catch {
        updateCheck(
          "fullscreen",
          "fail",
          "Fullscreen was blocked. Allow it in your browser and run the check again.",
        );
      }
    }

    const screenDetails = window.screen as Screen & { isExtended?: boolean };
    if (typeof screenDetails.isExtended === "boolean") {
      updateCheck(
        "screen",
        screenDetails.isExtended ? "fail" : "pass",
        screenDetails.isExtended
          ? "An extended display is connected."
          : "No extended display was reported by the browser.",
      );
    } else {
      updateCheck(
        "screen",
        "unsupported",
        "This browser does not expose connected-display information.",
      );
    }

    if (!navigator.onLine) {
      updateCheck("network", "fail", "The browser reports that it is offline.");
    } else {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      try {
        const startedAt = performance.now();
        const response = await fetch("/robots.txt", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Service did not respond");
        updateCheck(
          "network",
          "pass",
          `Exam service responded in ${Math.round(performance.now() - startedAt)} ms.`,
        );
      } catch {
        updateCheck(
          "network",
          "fail",
          "Could not reach the exam service. Check your connection and retry.",
        );
      } finally {
        clearTimeout(timeoutId);
      }
    }

    let cameraStream: MediaStream | undefined;
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error("Camera access requires a secure browser context (HTTPS or localhost).");
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      mediaStreamsRef.current.push(cameraStream);
      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
        await videoRef.current.play();
      }
      updateCheck("camera", "pass", "Camera is live. Video stays on this device during the check.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Camera permission was not granted.";
      updateCheck("camera", "fail", message);
      updateCheck("face", "fail", "Face detection needs an active camera.");
      updateCheck("multipleFaces", "fail", "Multiple-face detection needs an active camera.");
      updateCheck("objects", "fail", "Item detection needs an active camera.");
    }

    let audioContext: AudioContext | undefined;
    let audioStream: MediaStream | undefined;
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error("Microphone access requires HTTPS or localhost.");
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      mediaStreamsRef.current.push(audioStream);
      const audioTrack = audioStream.getAudioTracks()[0];
      if (!audioTrack || audioTrack.readyState !== "live")
        throw new Error("No active microphone input was found.");
      updateCheck(
        "microphone",
        "pass",
        "Microphone is live. Audio is analysed locally and is not recorded by this check.",
      );

      audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      audioContext.createMediaStreamSource(audioStream).connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      const levels: number[] = [];
      for (let sample = 0; sample < 16; sample += 1) {
        analyser.getByteTimeDomainData(samples);
        const rms =
          Math.sqrt(samples.reduce((sum, value) => sum + (value - 128) ** 2, 0) / samples.length) /
          128;
        levels.push(rms);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      await audioContext.close();
      const averageLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length;
      const levelDb = Math.round(20 * Math.log10(Math.max(averageLevel, 0.0001)));
      updateCheck(
        "noise",
        averageLevel > 0.13 ? "fail" : "pass",
        averageLevel > 0.13
          ? `Loud sustained sound detected (${levelDb} dBFS). Reduce nearby noise and retry.`
          : `No loud sustained sound detected (${levelDb} dBFS). This check measures level, not speech or its source.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Microphone permission was not granted.";
      updateCheck("microphone", "fail", message);
      updateCheck("noise", "fail", "Noise-level check needs an active microphone.");
    } finally {
      if (audioContext && audioContext.state !== "closed") await audioContext.close();
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
        mediaStreamsRef.current = mediaStreamsRef.current.filter(
          (stream) => stream !== audioStream,
        );
      }
    }

    if (cameraStream && videoRef.current?.videoWidth && videoRef.current.videoHeight) {
      let faceDetector: import("@mediapipe/tasks-vision").FaceDetector | undefined;
      let objectDetector: import("@mediapipe/tasks-vision").ObjectDetector | undefined;
      try {
        const { FilesetResolver, FaceDetector, ObjectDetector } =
          await import("@mediapipe/tasks-vision");
        const files = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm",
        );
        const modelBase = "https://storage.googleapis.com/mediapipe-models";
        faceDetector = await FaceDetector.createFromOptions(files, {
          baseOptions: {
            modelAssetPath: `${modelBase}/face_detector/blaze_face_short_range/float16/1/face_detector.tflite`,
          },
          runningMode: "VIDEO",
          minDetectionConfidence: 0.5,
        });
        objectDetector = await ObjectDetector.createFromOptions(files, {
          baseOptions: {
            modelAssetPath: `${modelBase}/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`,
          },
          runningMode: "VIDEO",
          scoreThreshold: 0.45,
          maxResults: 20,
        });

        const faceObservations: number[] = [];
        const detectedItems = new Set<string>();
        let centredFaceDetected = false;
        for (let frame = 0; frame < 8; frame += 1) {
          if (!mountedRef.current || !videoRef.current) break;
          const video = videoRef.current;
          const faces = faceDetector.detectForVideo(video, performance.now()).detections;
          faceObservations.push(faces.length);
          setFaceCount(faces.length);
          const faceBox = faces[0]?.boundingBox;
          if (faceBox) {
            const centerX = (faceBox.originX + faceBox.width / 2) / video.videoWidth;
            const centerY = (faceBox.originY + faceBox.height / 2) / video.videoHeight;
            centredFaceDetected ||=
              centerX >= 0.15 && centerX <= 0.85 && centerY >= 0.1 && centerY <= 0.9;
          }
          const objects = objectDetector.detectForVideo(video, performance.now()).detections;
          for (const detected of objects) {
            const label = detected.categories[0]?.categoryName?.toLowerCase();
            if (label && flaggedObjectLabels.has(label)) detectedItems.add(label);
          }
          await new Promise((resolve) => setTimeout(resolve, 250));
        }

        const maxFaces = Math.max(0, ...faceObservations);
        const visibleFaceFrames = faceObservations.filter((count) => count > 0).length;
        updateCheck(
          "face",
          visibleFaceFrames >= 5 && centredFaceDetected ? "pass" : "fail",
          visibleFaceFrames >= 5 && centredFaceDetected
            ? "One face was detected near the centre of the frame."
            : "Keep one face clearly visible and centred in the camera frame, then retry.",
        );
        updateCheck(
          "multipleFaces",
          maxFaces > 1 ? "fail" : "pass",
          maxFaces > 1
            ? `${maxFaces} faces were detected in one or more frames.`
            : "No additional faces were detected.",
        );
        updateCheck(
          "objects",
          detectedItems.size ? "fail" : "pass",
          detectedItems.size
            ? `Detected: ${[...detectedItems].join(", ")}. Remove these items and retry.`
            : "No listed personal items were detected. Object detection is limited to supported model categories.",
        );
      } catch {
        updateCheck(
          "face",
          "fail",
          "Face-detection model could not load. Check your connection and retry.",
        );
        updateCheck(
          "multipleFaces",
          "fail",
          "Face-detection model could not load. Check your connection and retry.",
        );
        updateCheck(
          "objects",
          "fail",
          "Object-detection model could not load. Check your connection and retry.",
        );
      } finally {
        faceDetector?.close();
        objectDetector?.close();
      }
    } else if (cameraStream) {
      updateCheck("face", "fail", "The camera did not provide a usable video frame.");
      updateCheck("multipleFaces", "fail", "The camera did not provide a usable video frame.");
      updateCheck("objects", "fail", "The camera did not provide a usable video frame.");
    }
    if (mountedRef.current) setRunning(false);
  };

  useEffect(() => {
    mountedRef.current = true;
    const handleVisibilityChange = () => {
      if (focusMonitorRef.current && document.visibilityState === "hidden") {
        updateCheck(
          "tab",
          "fail",
          "This page was hidden. Return here and run the system check again.",
        );
      }
    };
    const handleFullscreenChange = () => {
      if (focusMonitorRef.current && !document.fullscreenElement) {
        updateCheck(
          "fullscreen",
          "fail",
          "Fullscreen was exited. Run the system check again to restore it.",
        );
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      mountedRef.current = false;
      focusMonitorRef.current = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      mediaStreamsRef.current.forEach((stream) =>
        stream.getTracks().forEach((track) => track.stop()),
      );
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    };
  }, []);

  const passed = checkList.filter((check) => results[check.key].state === "pass").length;
  const attention = checkList.filter((check) =>
    ["fail", "unsupported"].includes(results[check.key].state),
  ).length;
  const ready = hasRun && !running && attention === 0 && passed === checkList.length;

  return (
    <div>
      <PageHeader
        title="System check"
        description="Confirm your device meets the proctoring requirements before entering an exam."
        actions={
          <button
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-60"
          >
            <RefreshCw className={cn("size-4", running && "animate-spin")} />{" "}
            {hasRun ? "Run again" : "Run checks"}
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <ul className="divide-y divide-border">
            {checkList.map((c) => {
              const result = results[c.key];
              const state = result.state;
              return (
                <li
                  key={c.key}
                  className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {hasRun ? result.detail : c.detail}
                    </p>
                  </div>
                  <span className="mt-0.5 shrink-0 text-xs font-medium">
                    {state === "pass" ? (
                      <span className="flex items-center gap-1.5 text-success">
                        <CheckCircle2 className="size-4" /> Ready
                      </span>
                    ) : state === "fail" ? (
                      <span className="flex items-center gap-1.5 text-warning-foreground">
                        <XCircle className="size-4" /> Action needed
                      </span>
                    ) : state === "unsupported" ? (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CircleHelp className="size-4" /> Unavailable
                      </span>
                    ) : state === "running" ? (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" /> Checking
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Queued</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Camera preview</h3>
            <div className="relative h-56 overflow-hidden rounded-xl border border-border bg-secondary">
              <video ref={videoRef} autoPlay muted playsInline className="size-full object-cover" />
              {!hasRun && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Video className="size-7" />
                  <span className="text-xs">Run checks to start your camera</span>
                </div>
              )}
              {hasRun && faceCount !== null && (
                <div className="absolute bottom-3 left-3 rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium text-foreground">
                  {faceCount === 0
                    ? "No face detected"
                    : `${faceCount} ${faceCount === 1 ? "face" : "faces"} detected`}
                </div>
              )}
              <div className="absolute left-2 top-2 rounded-full bg-card/90 px-2 py-1 text-[11px] font-medium text-foreground">
                {running ? "CHECKING" : cameraIsLive(results.camera.state) ? "LIVE" : "CAMERA"}
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Video is analysed in your browser for this check and is not uploaded.
            </p>
          </div>

          <div
            className={cn(
              "rounded-2xl border p-5",
              ready ? "border-success/30 bg-success-soft" : "border-warning/35 bg-warning-soft",
            )}
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="size-4" />
              {ready
                ? "Your device is exam ready"
                : !hasRun
                  ? "Run checks to see device readiness"
                  : `${attention} item${attention === 1 ? "" : "s"} need your attention`}
            </p>
            <p className="mt-1.5 text-xs text-foreground/80">
              {ready
                ? "All supported checks passed. You can now enter your scheduled exam."
                : "Resolve failed checks and review any browser capabilities that are unavailable."}
            </p>
            <Link
              to="/student/exams"
              className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Go to my exams
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function cameraIsLive(state: State) {
  return state === "pass";
}
