import { useEffect, useRef, useState } from "react";
import { Camera, Mic, ScanFace, ShieldAlert } from "lucide-react";
import { examService, type ProctoringEventType } from "@/services/examService";

export function ExamProctoringMonitor({
  attemptId,
  sessionId,
  stream,
}: {
  attemptId: string;
  sessionId: string;
  stream: MediaStream;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [microphoneActive, setMicrophoneActive] = useState(true);
  const [faceCount, setFaceCount] = useState<number | null>(null);
  const [faceDetectionError, setFaceDetectionError] = useState("");
  const [microphoneMonitoringError, setMicrophoneMonitoringError] = useState("");
  const [eventError, setEventError] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const monitoringActive = cameraActive && microphoneActive;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    void video.play().catch(() => {
      setCameraActive(false);
    });
    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  useEffect(() => {
    let cancelled = false;
    let faceDetector: import("@mediapipe/tasks-vision").FaceDetector | undefined;
    let audioContext: AudioContext | undefined;
    let loudSamples = 0;
    let noiseReported = false;
    let missingFaceReported = false;
    let multipleFacesReported = false;
    let missingFaceFrames = 0;
    let multipleFaceFrames = 0;

    const recordEvent = (type: ProctoringEventType) => {
      void examService.recordProctoringEvent(attemptId, sessionId, type).catch((error: unknown) => {
        if (!cancelled) {
          setEventError(
            error instanceof Error
              ? `Proctoring events could not be saved: ${error.message}`
              : "Proctoring events could not be saved. Check your connection.",
          );
        }
      });
    };

    const updateTracks = () => {
      setCameraActive(
        stream
          .getVideoTracks()
          .some((track) => track.readyState === "live" && track.enabled && !track.muted),
      );
      setMicrophoneActive(
        stream
          .getAudioTracks()
          .some((track) => track.readyState === "live" && track.enabled && !track.muted),
      );
    };

    const handleVisibility = () => {
      const visible = document.visibilityState === "visible";
      setTabVisible(visible);
      if (!visible) recordEvent("TAB_SWITCH");
    };
    const handleFullscreen = () => {
      const active = Boolean(document.fullscreenElement);
      setFullscreen(active);
      if (!active) recordEvent("FULLSCREEN_EXIT");
    };

    stream.getTracks().forEach((track) => {
      track.addEventListener("ended", updateTracks);
      track.addEventListener("mute", updateTracks);
      track.addEventListener("unmute", updateTracks);
    });
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreen);
    setFullscreen(Boolean(document.fullscreenElement));
    setTabVisible(document.visibilityState === "visible");
    updateTracks();

    const monitorAudio = async () => {
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack || typeof AudioContext === "undefined") return;
      try {
        audioContext = new AudioContext();
        await audioContext.resume();
        if (cancelled) return;
        if (audioContext.state !== "running") {
          throw new Error("The browser did not resume microphone analysis.");
        }
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        audioContext.createMediaStreamSource(stream).connect(analyser);
        const samples = new Uint8Array(analyser.fftSize);
        while (!cancelled && audioContext.state === "running") {
          analyser.getByteTimeDomainData(samples);
          const rms =
            Math.sqrt(
              samples.reduce((sum, value) => sum + (value - 128) ** 2, 0) / samples.length,
            ) / 128;
          if (rms > 0.15) {
            loudSamples += 1;
            if (loudSamples >= 4 && !noiseReported) {
              noiseReported = true;
              recordEvent("AUDIO_DETECTED");
            }
          } else {
            loudSamples = 0;
            if (rms < 0.1) noiseReported = false;
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        if (!cancelled) {
          setMicrophoneMonitoringError(
            error instanceof Error
              ? `Microphone level monitoring is unavailable: ${error.message}`
              : "Microphone level monitoring is unavailable.",
          );
        }
      }
    };

    const monitorFaces = async () => {
      try {
        const { FaceDetector, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const files = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm",
        );
        if (cancelled) return;
        faceDetector = await FaceDetector.createFromOptions(files, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/face_detector.tflite",
          },
          runningMode: "VIDEO",
          minDetectionConfidence: 0.5,
        });
        while (!cancelled) {
          const video = videoRef.current;
          if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            const count = faceDetector.detectForVideo(video, performance.now()).detections.length;
            setFaceCount(count);
            missingFaceFrames = count === 0 ? missingFaceFrames + 1 : 0;
            multipleFaceFrames = count > 1 ? multipleFaceFrames + 1 : 0;

            if (missingFaceFrames >= 3 && !missingFaceReported) {
              missingFaceReported = true;
              recordEvent("FACE_NOT_DETECTED");
            } else if (count > 0) {
              missingFaceReported = false;
            }
            if (multipleFaceFrames >= 2 && !multipleFacesReported) {
              multipleFacesReported = true;
              recordEvent("MULTIPLE_FACES");
            } else if (count <= 1) {
              multipleFacesReported = false;
            }
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        if (!cancelled) {
          setFaceDetectionError(
            error instanceof Error
              ? `Face detection is unavailable: ${error.message}`
              : "Face detection is unavailable.",
          );
        }
      }
    };

    void monitorAudio();
    void monitorFaces();
    return () => {
      cancelled = true;
      stream.getTracks().forEach((track) => {
        track.removeEventListener("ended", updateTracks);
        track.removeEventListener("mute", updateTracks);
        track.removeEventListener("unmute", updateTracks);
        track.stop();
      });
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreen);
      faceDetector?.close();
      if (audioContext && audioContext.state !== "closed") {
        void audioContext.close();
      }
    };
  }, [attemptId, sessionId, stream]);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Live proctoring</h2>
        <span
          className={`flex items-center gap-1.5 text-[11px] font-medium ${
            monitoringActive ? "text-success" : "text-destructive"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              monitoringActive ? "animate-pulse bg-success" : "bg-destructive"
            }`}
          />{" "}
          {monitoringActive ? "Active" : "Device issue"}
        </span>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-secondary">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="size-full object-cover"
          aria-label="Live camera preview"
        />
        <span className="absolute bottom-2 left-2 rounded-full bg-card/90 px-2 py-1 text-[11px] font-medium text-foreground">
          {faceCount === null
            ? "Checking face…"
            : faceCount === 0
              ? "No face detected"
              : `${faceCount} ${faceCount === 1 ? "face" : "faces"} detected`}
        </span>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <li className={cameraActive ? "text-success" : "text-destructive"}>
          <Camera className="mr-1 inline size-3.5" />
          Camera {cameraActive ? "active" : "unavailable"}
        </li>
        <li className={microphoneActive ? "text-success" : "text-destructive"}>
          <Mic className="mr-1 inline size-3.5" />
          Microphone {microphoneActive ? "active" : "unavailable"}
        </li>
        <li
          className={
            faceCount !== null && faceCount > 0 ? "text-success" : "text-warning-foreground"
          }
        >
          <ScanFace className="mr-1 inline size-3.5" />
          {faceCount === null
            ? "Face check loading"
            : faceCount > 0
              ? "Face detected"
              : "Face missing"}
        </li>
        <li className={tabVisible && fullscreen ? "text-success" : "text-warning-foreground"}>
          <ShieldAlert className="mr-1 inline size-3.5" />
          {tabVisible ? (fullscreen ? "Fullscreen active" : "Fullscreen exited") : "Tab switched"}
        </li>
      </ul>
      {faceDetectionError || microphoneMonitoringError || eventError ? (
        <div className="mt-3 space-y-2">
          {[faceDetectionError, microphoneMonitoringError, eventError]
            .filter(Boolean)
            .map((message) => (
              <p
                key={message}
                className="rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning-foreground"
              >
                {message}
              </p>
            ))}
        </div>
      ) : null}
      <p className="mt-3 text-[11px] text-muted-foreground">
        Camera and microphone are monitored in this browser. Media is not recorded or uploaded. Loud
        sound checks measure volume only, not speech or its source.
      </p>
    </section>
  );
}
