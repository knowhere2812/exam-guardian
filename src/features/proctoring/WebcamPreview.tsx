import { Camera, ScanFace, Video } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Simulated webcam surface. When a real media stream is wired in, replace the
 * placeholder frame with a <video ref={...} autoPlay muted playsInline /> element.
 */
export function WebcamPreview({
  label = "You",
  faceDetected = true,
  size = "md",
  className,
}: {
  label?: string;
  faceDetected?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const heights = { sm: "h-28", md: "h-40", lg: "h-56" };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-secondary",
        heights[size],
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,var(--muted),var(--secondary))]" />
      <div className="absolute inset-0 flex items-center justify-center">
        {faceDetected ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="flex size-14 items-center justify-center rounded-full border-2 border-dashed border-primary/40 text-primary">
              <ScanFace className="size-7" />
            </span>
            <span className="text-xs font-medium">Face in frame</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-destructive">
            <Camera className="size-7" />
            <span className="text-xs font-medium">No face detected</span>
          </div>
        )}
      </div>
      <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-card/90 px-2 py-1 text-[11px] font-medium text-foreground shadow-sm">
        <span className="size-1.5 animate-pulse rounded-full bg-destructive" /> LIVE
      </div>
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-card/90 px-2 py-1 text-[11px] font-medium text-foreground shadow-sm">
        <Video className="size-3" /> {label}
      </div>
    </div>
  );
}
