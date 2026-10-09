"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import type { PortfolioProject } from "@/types/media";
import { useDialog } from "@/components/media/use-dialog";
import { YouTubePlayer } from "@/components/media/youtube-player";

type VideoDialogProps = {
  project: PortfolioProject | null;
  onClose: () => void;
};

export function VideoDialog({ project, onClose }: VideoDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const stableClose = useCallback(() => onClose(), [onClose]);
  const dialogRef = useDialog(Boolean(project), stableClose);

  useEffect(() => () => {
    videoRef.current?.pause();
    if (videoRef.current) videoRef.current.currentTime = 0;
  }, [project]);

  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          className="media-dialog"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <div
            ref={dialogRef}
            className="media-dialog__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-dialog-title"
          >
            <button className="media-dialog__close" type="button" onClick={onClose} aria-label="Close video player">
              Close <span aria-hidden="true">×</span>
            </button>
            <div className="media-dialog__stage" style={{ aspectRatio: project.aspectRatio.replace(":", " / ") }}>
              {project.youtubeVideoId ? (
                <YouTubePlayer videoId={project.youtubeVideoId} title={`${project.title} video player`} />
              ) : project.video ? (
                <video
                  ref={videoRef}
                  controls
                  playsInline
                  preload="metadata"
                  poster={project.poster ?? undefined}
                >
                  <source src={project.video.src} type={project.video.type} />
                  Your browser does not support embedded video.
                </video>
              ) : project.externalUrl ? (
                <a className="media-dialog__external" href={project.externalUrl} target="_blank" rel="noreferrer">
                  Watch film on external player <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <div className="media-dialog__empty"><p>Film coming soon</p></div>
              )}
            </div>
            <div className="media-dialog__caption">
              <div><p>{project.category}</p><h2 id="video-dialog-title">{project.title}</h2></div>
              <p>{project.description}</p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
