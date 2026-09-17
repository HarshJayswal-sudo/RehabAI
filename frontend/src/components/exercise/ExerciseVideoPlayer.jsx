import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Subtitles, 
  AlertCircle,
  Sparkles,
  Gauge
} from 'lucide-react';

const ExerciseVideoPlayer = ({ 
  exercise,
  onPhaseTimeUpdate,
  captionsEnabled = true,
  onToggleCaptions
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(20);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  const videoSrc = exercise?.videoUrl || `/videos/exercises/${exercise?.id}/guidance.mp4`;
  const captionsSrc = exercise?.captionsUrl || `/videos/exercises/${exercise?.id}/captions.vtt`;

  // Autoplay handler with graceful mute fallback for strict browser policies
  useEffect(() => {
    setHasError(false);
    setIsBuffering(true);
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = playbackRate;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        })
        .catch(() => {
          // Fallback to muted autoplay
          video.muted = true;
          setIsMuted(true);
          video.play()
            .then(() => {
              setIsPlaying(true);
              setIsBuffering(false);
            })
            .catch(() => {
              setIsPlaying(false);
              setIsBuffering(false);
            });
        });
    }
  }, [videoSrc, playbackRate]);

  // Handle time update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    if (onPhaseTimeUpdate) {
      onPhaseTimeUpdate(cur, videoRef.current.duration || 20);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 20);
    setIsBuffering(false);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const toggleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        backgroundColor: '#0A0E17',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Video Element */}
      {!hasError ? (
        <video
          ref={videoRef}
          src={videoSrc}
          loop
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={() => setHasError(true)}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onClick={togglePlay}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            cursor: 'pointer',
            backgroundColor: '#000000'
          }}
        >
          {captionsSrc && (
            <track 
              kind="subtitles" 
              src={captionsSrc} 
              srcLang="en" 
              label="English" 
              default={captionsEnabled} 
            />
          )}
        </video>
      ) : (
        /* Error Fallback Card */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          textAlign: 'center',
          color: '#94A3B8'
        }}>
          <AlertCircle size={48} color="#EF4444" style={{ marginBottom: '16px' }} />
          <h4 style={{ color: '#F8FAFC', margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800 }}>
            Demonstration Video Loading Error
          </h4>
          <p style={{ fontSize: '13px', maxWidth: '380px', marginBottom: '18px', lineHeight: 1.5 }}>
            We could not load the exercise video. Check your connection or retry playback.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play().catch(() => {});
              }
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--accent-color, #0284C7)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '50px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Retry Video
          </button>
        </div>
      )}

      {/* Buffering Spinner */}
      {isBuffering && !hasError && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.3)',
          pointerEvents: 'none',
          zIndex: 2
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.2)',
            borderTopColor: '#38BDF8',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Top Overlay Badge Bar */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        right: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none',
        zIndex: 3
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '6px 14px',
          borderRadius: '50px',
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '0.5px'
        }}>
          <Sparkles size={14} color="#38BDF8" />
          <span>3D AVATAR INSTRUCTOR</span>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '6px 12px',
          borderRadius: '50px',
          color: '#38BDF8',
          fontSize: '11px',
          fontWeight: 800
        }}>
          <Gauge size={13} />
          <span>TARGET: {exercise?.idealAngle || '90°'}</span>
        </div>
      </div>

      {/* Center Play Button Overlay (when paused) */}
      {!isPlaying && !hasError && (
        <div 
          onClick={togglePlay}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
            cursor: 'pointer',
            zIndex: 3
          }}
        >
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'rgba(2, 132, 199, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(56, 189, 248, 0.5)',
            transform: 'scale(1)',
            transition: 'transform 0.2s'
          }}>
            <Play size={32} color="#FFFFFF" style={{ marginLeft: '4px' }} />
          </div>
        </div>
      )}

      {/* Bottom Professional Control Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 20px 14px',
        background: 'linear-gradient(to top, rgba(10, 14, 23, 0.95) 0%, rgba(10, 14, 23, 0.6) 70%, transparent 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        opacity: showControls || !isPlaying ? 1 : 0,
        pointerEvents: showControls || !isPlaying ? 'auto' : 'none',
        transition: 'opacity 0.25s ease-in-out',
        zIndex: 4
      }}>
        {/* Scrubber Timeline Slider */}
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          <input
            type="range"
            min={0}
            max={duration || 20}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            style={{
              width: '100%',
              height: '5px',
              borderRadius: '4px',
              appearance: 'none',
              backgroundColor: 'rgba(255,255,255,0.2)',
              cursor: 'pointer',
              outline: 'none',
              accentColor: '#38BDF8'
            }}
          />
        </div>

        {/* Buttons Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#FFFFFF' }}>
          {/* Left Buttons: Play, Replay, Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause demonstration' : 'Play demonstration'}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button
              onClick={handleReplay}
              title="Restart demonstration"
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
            >
              <RotateCcw size={17} />
            </button>

            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Buttons: Speed, Captions, Sound, Fullscreen */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Speed Toggle */}
            <button
              onClick={toggleSpeed}
              title="Playback Speed"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                borderRadius: '6px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {playbackRate}x
            </button>

            {/* Captions Toggle */}
            <button
              onClick={onToggleCaptions}
              title={captionsEnabled ? 'Disable Subtitles' : 'Enable Subtitles'}
              style={{
                background: captionsEnabled ? 'rgba(56, 189, 248, 0.2)' : 'none',
                border: 'none',
                color: captionsEnabled ? '#38BDF8' : '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Subtitles size={18} />
            </button>

            {/* Mute Toggle */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute Video' : 'Mute Video'}
              style={{
                background: 'none',
                border: 'none',
                color: isMuted ? '#94A3B8' : '#FFFFFF',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseVideoPlayer;

