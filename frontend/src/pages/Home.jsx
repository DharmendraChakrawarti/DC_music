import React, { useEffect, useState } from 'react';
import api from '../api';
import { Play } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setPlaylist, playSong, resumeSong } from '../slices/playerSlice';

export default function Home() {
  const [songs, setSongs] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    api.get('/songs/global').then((res) => setSongs(res.data)).catch(console.error);
  }, []);

  const handlePlay = (song, index) => {
    dispatch(setPlaylist(songs));
    dispatch(playSong({ song, index }));
  };

  return (
    <div className="pt-20 px-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
         Good evening
      </h1>
      
      <div className="text-xl font-bold mb-6">Trending Global Anthems</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {songs.length === 0 ? (
           <div className="text-gray-400 col-span-full">No global songs available yet.</div>
        ) : songs.map((song, i) => (
          <div key={song.id} className="bg-base-light hover:bg-base-hover p-4 rounded-md transition-all group relative cursor-pointer">
            <div className="w-full aspect-square bg-gray-800 rounded mb-4 shadow-lg overflow-hidden">
               {song.coverImage ? (
                  <img src={song.coverImage} className="w-full h-full object-cover" alt="cover"/>
               ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-800">
                      <span className="text-4xl text-gray-500 font-bold opacity-30">DC</span>
                  </div>
               )}
            </div>
            <div className="font-bold text-white mb-1 truncate">{song.title}</div>
            <div className="text-sm text-gray-400 truncate">{song.artist || 'Unknown Artist'}</div>
            
            <button 
              onClick={() => handlePlay(song, i)}
              className="absolute bottom-24 right-6 w-12 h-12 bg-brand rounded-full flex items-center justify-center text-black opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl hover:scale-105"
            >
              <Play fill="currentColor" size={24} className="ml-1" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
