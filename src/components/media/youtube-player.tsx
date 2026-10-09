"use client";

import { useEffect, useId, useRef, useState } from "react";

type YouTubePlayerInstance = {
  destroy: () => void;
  getIframe: () => HTMLIFrameElement;
  mute: () => void;
  playVideo: () => void;
};

type YouTubePlayerConstructor = new (
  element: HTMLElement,
  options: {
    videoId: string;
    host: string;
    playerVars: Record<string, number | string>;
    events: {
      onReady: (event: { target: YouTubePlayerInstance }) => void;
      onError: () => void;
    };
  },
) => YouTubePlayerInstance;

type YouTubeApi = { Player: YouTubePlayerConstructor };

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeApi> | null = null;

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const existingCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      existingCallback?.();
      if (window.YT) resolve(window.YT);
      else reject(new Error("YouTube player API unavailable"));
    };

    const existingScript = document.getElementById("youtube-iframe-api");
    if (existingScript) return;

    const script = document.createElement("script");
    script.id = "youtube-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("YouTube player API failed to load"));
    document.head.appendChild(script);
  });

  return apiPromise;
}

type YouTubePlayerProps = {
  videoId: string;
  title: string;
};

export function YouTubePlayer({ videoId, title }: YouTubePlayerProps) {
  const reactId = useId();
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    loadYouTubeApi().then((api) => {
      if (cancelled || !mountRef.current) return;
      playerRef.current = new api.Player(mountRef.current, {
        videoId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 1,
          controls: 1,
          enablejsapi: 1,
          playsinline: 1,
          rel: 0,
          mute: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: ({ target }) => {
            target.mute();
            target.getIframe().title = title;
            setStatus("ready");
            target.playVideo();
          },
          onError: () => setStatus("error"),
        },
      });
    }).catch(() => {
      if (!cancelled) setStatus("error");
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [title, videoId]);

  return (
    <div className="youtube-player" aria-busy={status === "loading"}>
      {status === "loading" ? <p className="youtube-player__status">Loading film…</p> : null}
      {status === "error" ? <p className="youtube-player__status">This film could not be loaded.</p> : null}
      <div ref={mountRef} id={`youtube-player-${reactId.replaceAll(":", "")}`} className="youtube-player__mount" />
    </div>
  );
}
