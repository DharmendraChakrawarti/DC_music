import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Search as SearchIcon, Play, Music } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setPlaylist, playSong } from '../slices/playerSlice';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const searchRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const { data } = await api.get(`/songs/search?q=${encodeURIComponent(query)}`);
        setSuggestions(data.slice(0, 5)); // Show top 5 in dropdown
      } catch (err) {
        console.error(err);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setShowDropdown(false);
    setLoading(true);
    try {
      const { data } = await api.get(`/songs/search?q=${encodeURIComponent(query)}`);
      setResults(data);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (songToPlay, sourceArray = results) => {
    const index = sourceArray.findIndex(s => s.id === songToPlay.id);
    dispatch(setPlaylist(sourceArray));
    dispatch(playSong({ song: songToPlay, index: index >= 0 ? index : 0 }));
    setShowDropdown(false);
  };

  return (
    <div className="pt-20 px-4 md:px-8 pb-32 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Search</h1>
      
      <div className="relative mb-8 z-20" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="relative">
          <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for songs, artists, or albums..."
            className="w-full pl-12 pr-4 py-4 bg-base-light border border-gray-700 rounded-full text-white text-base md:text-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand placeholder-gray-500 shadow-lg transition-all"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            autoComplete="off"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
          )}
        </form>

        {/* Suggestions Dropdown */}
        {showDropdown && query.trim() && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <ul>
              {suggestions.map((song) => (
                <li 
                  key={song.id}
                  onClick={() => handlePlay(song, [song])}
                  className="px-4 py-3 border-b border-gray-800 last:border-0 hover:bg-gray-800 cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center flex-shrink-0 text-brand">
                    {song.coverImage ? (
                      <img src={song.coverImage} className="w-full h-full object-cover rounded" alt="cover"/>
                    ) : (
                      <Music size={18} />
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="text-sm font-bold text-white truncate">{song.title}</div>
                    <div className="text-xs text-gray-400 truncate">{song.artist || 'Unknown'}</div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center hover:bg-brand hover:text-black transition-colors">
                    <Play size={14} className="ml-0.5" fill="currentColor" />
                  </button>
                </li>
              ))}
              <li 
                onClick={handleSearchSubmit}
                className="px-4 py-3 text-center text-sm font-semibold text-brand hover:bg-brand/10 cursor-pointer transition-colors"
              >
                See all results for "{query}"
              </li>
            </ul>
          </div>
        )}
      </div>

      {searched && results.length === 0 && !loading && (
        <div className="text-gray-500 text-center py-16 text-lg bg-base-light rounded-xl border border-gray-800">
          No results found for "<span className="text-white">{query}</span>"
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-base-light rounded-xl border border-gray-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-gray-900/50">
                <tr>
                  <th className="p-4 w-12 font-normal text-center">#</th>
                  <th className="p-4 font-normal">Title</th>
                  <th className="p-4 font-normal">Artist</th>
                  <th className="p-4 font-normal hidden sm:table-cell">Album</th>
                  <th className="p-4 w-16 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {results.map((song, i) => (
                  <tr key={song.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-gray-500 text-center font-mono text-sm">{i + 1}</td>
                    <td className="p-4">
                      <div className="font-semibold text-white line-clamp-1">{song.title}</div>
                    </td>
                    <td className="p-4 text-gray-400 text-sm line-clamp-1">{song.artist || 'Unknown'}</td>
                    <td className="p-4 text-gray-400 text-sm hidden sm:table-cell line-clamp-1">{song.album || '-'}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handlePlay(song, results)}
                        className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-all hover:scale-105 shadow-lg mx-auto"
                      >
                        <Play fill="currentColor" size={16} className="ml-0.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
