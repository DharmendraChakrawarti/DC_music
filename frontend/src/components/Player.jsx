import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Shuffle, Rewind, FastForward, ChevronDown, ChevronUp,
  Heart, MoreHorizontal, Music2
} from 'lucide-react';
import { nextSong, prevSong, playSong, pauseSong, resumeSong } from '../slices/playerSlice';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Build stream URL dynamically — works on localhost AND EC2
function getStreamUrl(fileUrl) {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  // Always stream from the backend on port 8080
  return `${protocol}//${hostname}:8080/api/songs/stream/${encodeURIComponent(fileUrl)}`;
}

export default function Player() {
  const { currentSong, isPlaying, playlist, currentIndex } = useSelector(state => state.player);
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatOn, setRepeatOn] = useState(false);
  const [audioError, setAudioError] = useState(false);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      const promise = audio.play();
      if (promise) promise.catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle song change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    setAudioError(false);
    audio.src = getStreamUrl(currentSong.fileUrl);
    audio.load();
    if (isPlaying) {
      const promise = audio.play();
      if (promise) promise.catch(() => {});
    }
  }, [currentSong?.id]);

  // Handle volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  // Collapse on escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && expanded) setExpanded(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [expanded]);

  // Lock body scroll when expanded on mobile
  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [expanded]);

  const togglePlay = () => {
    if (isPlaying) dispatch(pauseSong());
    else dispatch(resumeSong());
  };

  const skipForward10 = () => {
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration);
    }
  };

  const skipBackward10 = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
      setCurrentTime(audio.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const value = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (audio && audio.duration) {
      audio.currentTime = (value / 100) * audio.duration;
      setProgress(value);
    }
  };

  const handleProgressBarClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    const audio = audioRef.current;
    if (audio && audio.duration) {
      audio.currentTime = (percent / 100) * audio.duration;
      setProgress(percent);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMuted(false);
  };

  const handleAudioError = () => {
    setAudioError(true);
    console.error('Audio playback error — check backend stream URL:', getStreamUrl(currentSong?.fileUrl));
  };

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-16 md:h-20 bg-gradient-to-t from-black to-[#181818] border-t border-gray-800/50 flex items-center justify-center text-gray-500 z-50 text-sm md:text-base backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Music2 size={18} className="text-gray-600" />
          Select a song to play
        </div>
      </div>
    );
  }

  // =================== EXPANDED FULL-SCREEN VIEW (Mobile Spotify Style) ===================
  if (expanded) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col player-expanded-bg">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => dispatch(nextSong())}
          onError={handleAudioError}
          preload="auto"
        />

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-safe-top py-4">
          <button onClick={() => setExpanded(false)} className="text-white/70 hover:text-white transition-colors p-1">
            <ChevronDown size={28} />
          </button>
          <div className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold">
            Playing from Playlist
          </div>
          <button className="text-white/70 hover:text-white transition-colors p-1">
            <MoreHorizontal size={24} />
          </button>
        </div>

        {/* Album Art */}
        <div className="flex-1 flex items-center justify-center px-8 py-4 min-h-0">
          <div className="w-full max-w-[340px] aspect-square rounded-lg shadow-2xl overflow-hidden player-album-shadow">
            {currentSong.coverImage ? (
              <img src={currentSong.coverImage} className="w-full h-full object-cover" alt="cover"/>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#535353] to-[#1a1a2e] relative">
                <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-purple-500/10"></div>
                <Music2 size={64} className="text-white/20 relative z-10" />
                <span className="text-white/30 text-lg font-bold mt-3 relative z-10">DC Music</span>
              </div>
            )}
          </div>
        </div>

        {/* Song Info + Like */}
        <div className="px-8 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <div className="text-xl font-bold text-white truncate leading-tight">{currentSong.title}</div>
              <div className="text-sm text-white/60 truncate mt-1">{currentSong.artist || 'Unknown Artist'}</div>
            </div>
            <button
              onClick={() => setLiked(!liked)}
              className={`transition-all duration-300 p-1 ${liked ? 'text-brand scale-110' : 'text-white/40 hover:text-white/70'}`}
            >
              <Heart size={24} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-8 mb-2">
          <div
            className="w-full h-2 bg-white/10 rounded-full cursor-pointer group relative"
            onClick={handleProgressBarClick}
          >
            <div
              className="h-full bg-white rounded-full relative transition-all duration-100"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[11px] text-white/40 tabular-nums">{formatTime(currentTime)}</span>
            <span className="text-[11px] text-white/40 tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-between px-8 mb-6">
          <button
            onClick={() => setShuffleOn(!shuffleOn)}
            className={`transition-colors p-2 ${shuffleOn ? 'text-brand' : 'text-white/40 hover:text-white/70'}`}
          >
            <Shuffle size={22} />
          </button>

          <button
            className="text-white/70 hover:text-white transition-colors p-2"
            onClick={() => dispatch(prevSong())}
          >
            <SkipBack size={28} fill="currentColor" />
          </button>

          <button
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform text-black shadow-lg"
            onClick={togglePlay}
          >
            {isPlaying
              ? <Pause size={28} fill="currentColor" />
              : <Play size={28} fill="currentColor" className="ml-1" />
            }
          </button>

          <button
            className="text-white/70 hover:text-white transition-colors p-2"
            onClick={() => dispatch(nextSong())}
          >
            <SkipForward size={28} fill="currentColor" />
          </button>

          <button
            onClick={() => setRepeatOn(!repeatOn)}
            className={`transition-colors p-2 ${repeatOn ? 'text-brand' : 'text-white/40 hover:text-white/70'}`}
          >
            <Repeat size={22} />
          </button>
        </div>

        {/* Bottom Safe Area */}
        <div className="h-8 flex-shrink-0"></div>

        {audioError && (
          <div className="absolute bottom-24 left-0 right-0 text-center">
            <span className="bg-red-900/80 text-red-300 text-xs px-4 py-2 rounded-full">
              Unable to stream audio. Check server connection.
            </span>
          </div>
        )}
      </div>
    );
  }

  // =================== MINI PLAYER (Bottom Bar) ===================
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => dispatch(nextSong())}
        onError={handleAudioError}
        preload="auto"
      />

      {/* Mobile Mini-Player (tappable to expand) */}
      <div className="md:hidden">
        {/* Tiny progress bar on top */}
        <div className="relative h-[2px] bg-gray-800">
          <div
            className="h-full bg-brand transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div
          className="h-16 bg-gradient-to-r from-[#181818] to-[#282828] flex items-center px-3 gap-3 cursor-pointer"
          onClick={() => setExpanded(true)}
        >
          {/* Mini Album Art */}
          <div className="w-11 h-11 rounded-md bg-gradient-to-br from-gray-700 to-gray-900 flex-shrink-0 overflow-hidden shadow-md">
            {currentSong.coverImage ? (
              <img src={currentSong.coverImage} className="w-full h-full object-cover" alt="cover"/>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music2 size={18} className="text-gray-500" />
              </div>
            )}
          </div>

          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-white truncate leading-tight">{currentSong.title}</div>
            <div className="text-[11px] text-white/50 truncate">{currentSong.artist || 'Unknown Artist'}</div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
              className={`p-2 transition-colors ${liked ? 'text-brand' : 'text-white/40'}`}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="p-2 text-white"
            >
              {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Player Bar */}
      <div className="hidden md:flex h-[90px] bg-gradient-to-b from-[#181818] to-black border-t border-white/5 items-center justify-between px-4">
        {/* Left — Song Info */}
        <div className="flex items-center gap-4 w-[30%] min-w-[200px]">
          <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-md shadow-lg flex-shrink-0 overflow-hidden group cursor-pointer relative">
            {currentSong.coverImage ? (
              <img src={currentSong.coverImage} className="w-full h-full object-cover" alt="cover"/>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music2 size={22} className="text-gray-600" />
              </div>
            )}
            <button
              onClick={() => setExpanded(true)}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronUp size={20} className="text-white" />
            </button>
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm font-semibold truncate hover:underline cursor-pointer text-white">{currentSong.title}</span>
            <span className="text-xs text-white/50 truncate hover:underline cursor-pointer">{currentSong.artist || 'Unknown Artist'}</span>
          </div>
          <button
            onClick={() => setLiked(!liked)}
            className={`ml-2 transition-all duration-300 flex-shrink-0 ${liked ? 'text-brand' : 'text-white/30 hover:text-white/60'}`}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Center — Controls */}
        <div className="flex flex-col items-center justify-center flex-1 max-w-[722px] gap-2">
          <div className="flex items-center gap-5">
            <button
              onClick={() => setShuffleOn(!shuffleOn)}
              className={`transition-colors ${shuffleOn ? 'text-brand' : 'text-white/40 hover:text-white'}`}
            >
              <Shuffle size={18} />
            </button>

            <button
              className="text-white/60 hover:text-white transition-colors"
              onClick={() => dispatch(prevSong())}
            >
              <SkipBack size={20} fill="currentColor" />
            </button>

            <button
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center cursor-pointer hover:scale-105 transition-transform text-black"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>

            <button
              className="text-white/60 hover:text-white transition-colors"
              onClick={() => dispatch(nextSong())}
            >
              <SkipForward size={20} fill="currentColor" />
            </button>

            <button
              onClick={() => setRepeatOn(!repeatOn)}
              className={`transition-colors ${repeatOn ? 'text-brand' : 'text-white/40 hover:text-white'}`}
            >
              <Repeat size={18} />
            </button>
          </div>

          <div className="flex items-center w-full gap-2">
            <span className="text-[11px] text-white/40 w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
            <div className="flex-1 group relative">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress || 0}
                onChange={handleSeek}
                className="player-range w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #1DB954 ${progress}%, rgba(255,255,255,0.1) ${progress}%)`
                }}
              />
            </div>
            <span className="text-[11px] text-white/40 w-10 tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right — Volume */}
        <div className="flex items-center gap-3 w-[30%] justify-end">
          <button onClick={() => setMuted(!muted)} className="text-white/40 hover:text-white transition-colors">
            {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            className="player-range w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #fff ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) ${(muted ? 0 : volume) * 100}%)`
            }}
          />
        </div>
      </div>

      {audioError && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-50">
          <span className="bg-red-900/90 text-red-300 text-xs px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg">
            Stream error — check connection
          </span>
        </div>
      )}
    </div>
  );
}
