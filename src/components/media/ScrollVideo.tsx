"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * SCROLL-SCRUBBED BACKGROUND VIDEO
 * ============================================================================
 * The wrapper is a tall "scroll runway" (`heightVh` viewport heights). Inside
 * it a sticky viewport-sized stage holds the video, a token-coloured scrim and
 * whatever children you pass. As the runway scrolls past, the video's
 * `currentTime` is driven from the scroll progress instead of from playback —
 * so scrolling *is* the timeline.
 *
 *   <ScrollVideo src="/hero.mp4" heightVh={300}>
 *     ...overlay content...
 *   </ScrollVideo>
 *
 * ENCODING NOTE (this matters more than the code):
 * seeking is only smooth if the file has very frequent keyframes. Re-encode
 * with a ~1-frame GOP before shipping, e.g.
 *   ffmpeg -i in.mp4 -c:v libx264 -crf 24 -g 1 -pix_fmt yuv420p -an out.mp4
 * Keep it short (5-10s) and under a few MB. Consider serving a WebM sibling.
 */
export function ScrollVideo({
  src,
  poster,
  heightVh = 300,
  className,
  children,
}: {
  src: string;
  poster?: string | null;
  heightVh?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const runwayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const runway = runwayRef.current;
    const video = videoRef.current;
    if (!runway || !video) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    let frame = 0;
    let duration = 0;

    const readDuration = () => {
      duration = Number.isFinite(video.duration) ? video.duration : 0;
    };

    const update = () => {
      frame = 0;
      if (!duration) return;

      const rect = runway.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;

      // 0 when the runway's top hits the viewport top, 1 when its bottom does.
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
      const time = progress * duration;

      // Guard against sub-frame churn; seeking is the expensive part.
      if (Math.abs(video.currentTime - time) > 0.01) {
        video.currentTime = time;
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    video.addEventListener("loadedmetadata", readDuration);
    readDuration();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      video.removeEventListener("loadedmetadata", readDuration);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={runwayRef}
      className={cn("relative w-full", className)}
      style={{ height: `${heightVh}vh` }}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-overlay">
        <video
          ref={videoRef}
          src={src}
          poster={poster ?? undefined}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Readability scrim — token driven, no literal colours. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-overlay/60"
        />
        <div className="relative flex h-full w-full items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
