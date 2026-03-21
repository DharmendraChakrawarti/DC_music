import React, { useEffect, useState } from 'react';
import api from '../api';
import { Play, Music2, TrendingUp, Sparkles, Clock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setPlaylist, playSong, resumeSong } from '../slices/playerSlice';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const [songs, setSongs] = useState([]);
  const dispatch = useDispatch();
  const { currentSong, isPlaying } = useSelector(state => state.player);

  useEffect(() => {
    api.get('/songs/global').then((res) => setSongs(res.data)).catch(console.error);
  }, []);

  const handlePlay = (song, index) => {
    dispatch(setPlaylist(songs));
    dispatch(playSong({ song, index }));
  };

  // Quick play cards — top 6 songs in a grid
  const quickPlaySongs = songs.slice(0, 6);
  const restSongs = songs;

  return (
    <div className="pt-20 px-4 md:px-8 pb-32">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-white">
        {getGreeting()}
      </h1>

      {/* Quick Play Grid (Spotify-style horizontal cards) */}
      {quickPlaySongs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-8 md:mb-10">
          {quickPlaySongs.map((song, i) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                onClick={() => handlePlay(song, songs.indexOf(song))}
                className={`flex items-center gap-3 bg-white/[0.07] hover:bg-white/[0.15] rounded-md overflow-hidden cursor-pointer transition-all group h-12 md:h-14 ${
                  isCurrent ? 'ring-1 ring-brand/50 bg-white/[0.12]' : ''
                }`}
              >
                <div className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden">
                  {song.coverImage ? (
                    <img src={song.coverImage} className="w-full h-full object-cover" alt="cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#535353] to-[#333]">
                      <Music2 size={16} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <span className={`text-xs md:text-sm font-semibold truncate pr-2 flex-1 ${
                  isCurrent ? 'text-brand' : 'text-white'
                }`}>
                  {song.title}
                </span>
                <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-all mr-2 shadow-lg hover:scale-105 flex-shrink-0">
                  <Play fill="currentColor" size={14} className="ml-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trending Section */}
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp size={20} className="text-brand" />
        <h2 className="text-xl md:text-2xl font-bold text-white">Trending Global Anthems</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
        {songs.length === 0 ? (
          <div className="text-gray-400 col-span-full text-center py-16">
            <Music2 size={48} className="mx-auto mb-4 text-gray-700" />
            <p className="text-lg font-medium text-gray-500">No songs available yet</p>
            <p className="text-sm text-gray-600 mt-1">Upload some music to get started</p>
          </div>
        ) : restSongs.map((song, i) => {
          const isCurrent = currentSong?.id === song.id;
          return (
            <div
              key={song.id}
              className="song-card bg-white/[0.04] hover:bg-white/[0.08] p-3 md:p-4 rounded-lg group relative cursor-pointer"
              onClick={() => handlePlay(song, i)}
            >
              <div className="w-full aspect-square bg-gray-800 rounded-md mb-3 shadow-lg overflow-hidden relative">
                {song.coverImage ? (
                  <img src={song.coverImage} className="w-full h-full object-cover" alt="cover"/>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#535353] to-[#1a1a2e]">
                    <Music2 size={32} className="text-gray-500/40" />
                  </div>
                )}

                {/* Play button overlay */}
                <button
                  className="play-btn-overlay absolute bottom-2 right-2 w-10 h-10 md:w-12 md:h-12 bg-brand rounded-full flex items-center justify-center text-black shadow-xl hover:scale-105 transition-transform hover:bg-[#1ed760]"
                  onClick={(e) => { e.stopPropagation(); handlePlay(song, i); }}
                >
                  <Play fill="currentColor" size={20} className="ml-0.5" />
                </button>

                {/* Currently playing indicator */}
                {isCurrent && isPlaying && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-brand/90 px-2 py-1 rounded-full">
                    <div className="flex items-end gap-[2px] h-3">
                      <div className="w-[3px] bg-black rounded-full animate-bounce" style={{height: '8px', animationDelay: '0ms', animationDuration: '600ms'}}></div>
                      <div className="w-[3px] bg-black rounded-full animate-bounce" style={{height: '12px', animationDelay: '150ms', animationDuration: '600ms'}}></div>
                      <div className="w-[3px] bg-black rounded-full animate-bounce" style={{height: '6px', animationDelay: '300ms', animationDuration: '600ms'}}></div>
                    </div>
                  </div>
                )}
              </div>

              <div className={`font-semibold text-sm mb-1 truncate ${isCurrent ? 'text-brand' : 'text-white'}`}>
                {song.title}
              </div>
              <div className="text-xs text-white/50 truncate">
                {song.artist || 'Unknown Artist'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
