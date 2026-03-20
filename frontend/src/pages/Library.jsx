import React, { useState, useEffect } from 'react';
import api from '../api';
import { PlusCircle, Trash2, Music, Play, X, ListMusic } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setPlaylist, playSong } from '../slices/playerSlice';

export default function Library() {
  const [playlists, setPlaylists] = useState([]);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [globalSongs, setGlobalSongs] = useState([]);
  const [showAddSong, setShowAddSong] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchPlaylists();
    fetchGlobalSongs();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const { data } = await api.get('/playlists');
      setPlaylists(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGlobalSongs = async () => {
    try {
      const { data } = await api.get('/songs/global');
      setGlobalSongs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await api.post(`/playlists?name=${encodeURIComponent(newName)}`);
      setNewName('');
      setCreating(false);
      fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/playlists/${id}`);
      if (selectedPlaylist?.id === id) setSelectedPlaylist(null);
      fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSong = async (playlistId, songId) => {
    try {
      const { data } = await api.post(`/playlists/${playlistId}/add/${songId}`);
      setSelectedPlaylist(data);
      fetchPlaylists();
      setShowAddSong(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveSong = async (playlistId, songId) => {
    try {
      const { data } = await api.post(`/playlists/${playlistId}/remove/${songId}`);
      setSelectedPlaylist(data);
      fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlayAll = (songs) => {
    if (songs.length === 0) return;
    dispatch(setPlaylist(songs));
    dispatch(playSong({ song: songs[0], index: 0 }));
  };

  const handlePlaySingle = (songs, song, index) => {
    dispatch(setPlaylist(songs));
    dispatch(playSong({ song, index }));
  };

  return (
    <div className="pt-16 md:pt-20 px-4 md:px-8 pb-32 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <ListMusic className="text-brand" size={28} /> Your Library
        </h1>
        <button
          onClick={() => setCreating(!creating)}
          className="bg-brand text-black font-bold px-5 py-2 rounded-full hover:scale-105 transition-transform flex items-center gap-2 self-start sm:self-auto text-sm md:text-base"
        >
          <PlusCircle size={18} /> New Playlist
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="mb-6 flex gap-2 md:gap-3 max-w-md">
          <input
            type="text"
            placeholder="Playlist name..."
            className="flex-1 px-3 py-2 md:px-4 md:py-3 bg-base-light border border-gray-700 rounded-lg text-sm md:text-base text-white focus:outline-none focus:border-brand"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="bg-brand text-black font-bold px-4 py-2 md:px-6 md:py-3 rounded-lg hover:scale-105 transition-transform text-sm md:text-base">
            Create
          </button>
          <button type="button" onClick={() => setCreating(false)} className="text-gray-400 hover:text-white px-2">
            <X size={20} />
          </button>
        </form>
      )}

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Playlist List */}
        <div className={`w-full lg:w-80 flex-shrink-0 ${selectedPlaylist ? 'hidden lg:block' : 'block'}`}>
          {playlists.length === 0 ? (
            <div className="text-gray-500 text-center py-12 bg-base-light rounded-lg border border-gray-800 text-sm md:text-base">
              No playlists yet. Create one!
            </div>
          ) : (
            <div className="bg-base-light rounded-lg border border-gray-800 overflow-hidden shadow-xl">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  className={`flex items-center p-3 md:p-4 cursor-pointer border-b border-gray-800/50 hover:bg-white/5 transition-colors group ${selectedPlaylist?.id === pl.id ? 'bg-white/10 border-l-4 border-l-brand' : ''}`}
                  onClick={() => setSelectedPlaylist(pl)}
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-brand/30 to-brand/5 rounded flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                    <Music size={18} className="text-brand md:w-5 md:h-5" />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-bold text-white truncate text-sm md:text-base">{pl.name}</div>
                    <div className="text-xs text-gray-400">{pl.songs?.length || 0} songs</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(pl.id); }}
                    className="text-gray-500 hover:text-red-500 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Playlist Detail */}
        <div className={`flex-1 ${!selectedPlaylist ? 'hidden lg:block' : 'block'}`}>
          {selectedPlaylist ? (
            <div className="bg-base-dark border border-gray-800 rounded-xl p-4 md:p-6 shadow-xl">
              <button 
                onClick={() => setSelectedPlaylist(null)}
                className="lg:hidden mb-6 text-brand text-sm font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                ← Back to Playlists
              </button>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white truncate">{selectedPlaylist.name}</h2>
                  <p className="text-gray-400 text-xs md:text-sm">{selectedPlaylist.songs?.length || 0} songs</p>
                </div>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  {selectedPlaylist.songs?.length > 0 && (
                    <button
                      onClick={() => handlePlayAll(selectedPlaylist.songs)}
                      className="bg-brand text-black font-bold px-4 py-2 rounded-full hover:scale-105 transition-transform flex items-center gap-2 text-xs md:text-sm"
                    >
                      <Play fill="currentColor" size={14} className="md:w-[16px]" /> Play All
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddSong(!showAddSong)}
                    className="bg-base-light border border-gray-700 text-white font-bold px-4 py-2 rounded-full hover:bg-base-hover transition-colors flex items-center gap-2 text-xs md:text-sm"
                  >
                    <PlusCircle size={14} className="md:w-[16px]" /> Add Songs
                  </button>
                </div>
              </div>

              {showAddSong && (
                <div className="mb-6 bg-base-light rounded-lg border border-gray-800 p-2 md:p-4 max-h-60 overflow-y-auto w-full">
                  <h3 className="text-xs md:text-sm font-bold text-gray-400 uppercase mb-3 px-2">Available Songs</h3>
                  {globalSongs.length === 0 ? (
                    <p className="text-gray-500 text-xs md:text-sm p-2">No global songs available. Upload and approve songs first.</p>
                  ) : globalSongs.map((song) => {
                    const alreadyAdded = selectedPlaylist.songs?.some(s => s.id === song.id);
                    return (
                      <div key={song.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 hover:bg-white/5 rounded transition-colors gap-2 sm:gap-0">
                        <div className="flex-1 min-w-0 pr-4">
                          <span className="text-white text-xs md:text-sm line-clamp-1">{song.title}</span>
                          <span className="text-gray-500 text-[10px] md:text-xs block sm:inline sm:ml-2 line-clamp-1 sm:line-clamp-none">— {song.artist || 'Unknown'}</span>
                        </div>
                        <button
                          onClick={() => handleAddSong(selectedPlaylist.id, song.id)}
                          disabled={alreadyAdded}
                          className={`text-[10px] md:text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap self-start sm:self-auto ${alreadyAdded ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-brand/20 text-brand hover:bg-brand/40'}`}
                        >
                          {alreadyAdded ? 'Added' : '+ Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedPlaylist.songs?.length === 0 ? (
                <div className="text-gray-500 text-center py-12 bg-base-light rounded-lg border border-gray-800 text-sm md:text-base px-4">
                  This playlist is empty. Add songs!
                </div>
              ) : (
                <div className="bg-base-light rounded-lg border border-gray-800 overflow-hidden">
                  {selectedPlaylist.songs?.map((song, i) => (
                    <div key={song.id} className="flex items-center p-3 md:p-4 border-b border-gray-800/50 hover:bg-white/5 transition-colors group">
                      <span className="text-gray-500 w-6 md:w-8 text-xs md:text-sm text-center">{i + 1}</span>
                      <button
                         onClick={() => handlePlaySingle(selectedPlaylist.songs, song, i)}
                         className="w-8 h-8 md:w-10 md:h-10 bg-brand rounded-full flex items-center justify-center text-black mx-2 md:mx-4 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 flex-shrink-0"
                      >
                         <Play fill="currentColor" size={14} className="ml-0.5 md:w-[16px]" />
                      </button>
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-semibold text-white text-sm md:text-base truncate">{song.title}</div>
                        <div className="text-xs md:text-sm text-gray-400 truncate">{song.artist || 'Unknown'}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveSong(selectedPlaylist.id, song.id)}
                        className="text-gray-500 hover:text-red-500 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity p-2 ml-2"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-20 bg-base-light rounded-lg border border-gray-800 px-4 h-full flex flex-col items-center justify-center">
              <ListMusic size={40} className="mx-auto mb-4 text-gray-700 md:w-[48px] md:h-[48px]" />
              <p className="text-sm md:text-lg">Select a playlist to view its songs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
