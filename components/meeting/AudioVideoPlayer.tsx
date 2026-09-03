'use client';

import { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, RotateCw } from 'lucide-react';

interface AudioVideoPlayerProps {
  fileUrl: string;
  fileType: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
}

export default function AudioVideoPlayer({
  fileUrl,
  fileType,
  currentTime,
  onTimeUpdate,
}: AudioVideoPlayerProps) {
  const mediaRef = useRef<HTMLMediaElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const isVideo = fileType.includes('video') || fileUrl.endsWith('.mp4') || fileUrl.endsWith('.webm');

  // Handle external seek requests from interactive transcript line clicks
  useEffect(() => {
    if (mediaRef.current && Math.abs(mediaRef.current.currentTime - currentTime) > 1) {
      mediaRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
      onTimeUpdate(time);
    }
  };

  const skip = (seconds: number) => {
    if (mediaRef.current) {
      const newTime = Math.min(Math.max(mediaRef.current.currentTime + seconds, 0), duration);
      mediaRef.current.currentTime = newTime;
      onTimeUpdate(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      {/* Video element if video, else HTML5 Audio player styling */}
      {isVideo ? (
        <div className="w-full aspect-video rounded-xl bg-slate-950 overflow-hidden relative border border-slate-800">
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={fileUrl}
            onTimeUpdate={() => onTimeUpdate(mediaRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(mediaRef.current?.duration || 0)}
            onEnded={() => setIsPlaying(false)}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={fileUrl}
          onTimeUpdate={() => onTimeUpdate(mediaRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(mediaRef.current?.duration || 0)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* Control Bar */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => skip(-10)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Rewind 10s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => skip(10)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Forward 10s"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Slider */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs font-mono text-indigo-400 font-semibold min-w-[40px]">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-mono text-slate-500 min-w-[40px]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
