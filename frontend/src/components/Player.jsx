import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Rewind, FastForward } from 'lucide-react';
import { nextSong, prevSong, playSong, pauseSong, resumeSong } from '../slices/playerSlice';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function Player() {
  const { currentSong, isPlaying } = useSelector(state => state.player);
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);

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

    audio.src = `http://${window.location.hostname}:8080/api/songs/stream/${encodeURIComponent(currentSong.fileUrl)}`;
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

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMuted(false);
  };

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-16 md:h-24 bg-base-dark border-t border-gray-800 flex items-center justify-center text-gray-400 z-50 text-sm md:text-base">
        <div>Select a song to play</div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 md:h-24 bg-base-dark border-t border-gray-800 flex items-center justify-between px-2 md:px-4 z-50">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => dispatch(nextSong())}
        preload="auto"
        crossOrigin="anonymous"
      />
      
      {/* Left — Song Info */}
      <div className="flex items-center gap-2 md:gap-4 w-[35%] md:w-1/3 min-w-[120px] md:min-w-[200px]">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded shadow flex-shrink-0 flex items-center justify-center overflow-hidden">
          {currentSong.coverImage ? (
            <img src={currentSong.coverImage} className="w-full h-full object-cover" alt="cover"/>
          ) : (
            <span className="text-xl md:text-2xl font-bold text-gray-600 opacity-40">♫</span>
          )}
        </div>
        <div className="flex flex-col truncate w-full">
          <span className="text-xs md:text-sm font-semibold truncate hover:underline cursor-pointer">{currentSong.title}</span>
          <span className="text-[10px] md:text-xs text-gray-400 truncate hover:underline cursor-pointer">{currentSong.artist || 'Unknown Artist'}</span>
        </div>
      </div>

      {/* Center — Controls */}
      <div className="flex flex-col items-center justify-center flex-1 md:w-1/3 max-w-[700px] gap-1 md:gap-2 px-1">
        <div className="flex items-center gap-3 md:gap-6">
          <Shuffle size={16} className="text-gray-400 hover:text-white cursor-pointer transition-colors hidden md:block" />
          
          <SkipBack size={18} className="text-gray-400 hover:text-white cursor-pointer transition-colors hidden sm:block md:w-[22px]" onClick={() => dispatch(prevSong())} />
          
          <Rewind size={18} className="text-gray-400 hover:text-white cursor-pointer transition-colors md:w-[20px]" onClick={skipBackward10} title="-10s" />
          
          <div 
            className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white flex items-center justify-center cursor-pointer hover:scale-105 transition-transform text-black flex-shrink-0"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
          </div>
          
          <FastForward size={18} className="text-gray-400 hover:text-white cursor-pointer transition-colors md:w-[20px]" onClick={skipForward10} title="+10s" />
          
          <SkipForward size={18} className="text-gray-400 hover:text-white cursor-pointer transition-colors hidden sm:block md:w-[22px]" onClick={() => dispatch(nextSong())} />
          
          <Repeat size={16} className="text-gray-400 hover:text-white cursor-pointer transition-colors hidden md:block" />
        </div>
        
        <div className="flex items-center w-full gap-2 hidden sm:flex">
          <span className="text-[10px] md:text-[11px] text-gray-400 w-8 md:w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress || 0}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand"
          />
          <span className="text-[10px] md:text-[11px] text-gray-400 w-8 md:w-10 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right — Volume / Mobile Progress */}
      <div className="flex flex-row justify-end items-center gap-2 md:gap-3 w-[25%] md:w-1/3">
        {/* On mobile, show a compact progress bar instead of volume */}
        <div className="w-full flex items-center sm:hidden">
            <span className="text-[10px] text-gray-400 w-8 text-right tabular-nums mr-1">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress || 0}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand"
            />
        </div>
        
        <div className="hidden sm:flex items-center gap-2 md:gap-3 justify-end w-full">
          <button onClick={() => setMuted(!muted)} className="text-gray-400 hover:text-white transition-colors">
            {muted || volume === 0 ? <VolumeX size={18} className="md:w-[20px] md:h-[20px]" /> : <Volume2 size={18} className="md:w-[20px] md:h-[20px]" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 md:w-24 h-1 bg-gray-600 rounded-lg appearance-none accent-brand cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
