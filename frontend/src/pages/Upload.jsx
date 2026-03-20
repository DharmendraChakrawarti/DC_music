import React, { useState, useEffect } from 'react';
import api from '../api';
import { UploadCloud, Music, FileAudio, Trash2 } from 'lucide-react';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [mySongs, setMySongs] = useState([]);

  useEffect(() => {
    fetchMySongs();
  }, []);

  const fetchMySongs = async () => {
    try {
      const { data } = await api.get('/songs/my-songs');
      setMySongs(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if(artist) formData.append('artist', artist);
    if(album) formData.append('album', album);

    try {
      setUploading(true);
      await api.post('/songs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Song uploaded! Waiting for admin approval.');
      setFile(null);
      setTitle('');
      setArtist('');
      setAlbum('');
      fetchMySongs();
    } catch (error) {
      setMessage('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/songs/${id}`);
      fetchMySongs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pt-16 md:pt-24 px-4 md:px-8 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-base-dark p-4 md:p-8 rounded-xl border border-gray-800 shadow-xl mb-8 md:mb-12">
        <h2 className="text-xl md:text-3xl font-bold mb-6 text-white flex items-center gap-2 md:gap-3">
          <UploadCloud className="text-brand w-6 md:w-8" /> Upload Your Music
        </h2>
        {message && <div className="p-3 mb-6 bg-blue-900/30 text-blue-400 border border-blue-800 rounded text-sm md:text-base">{message}</div>}
        
        <form onSubmit={handleUpload} className="flex flex-col gap-4 md:gap-5">
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center bg-base-light hover:border-brand transition-colors cursor-pointer relative text-center">
            <input 
              type="file" 
              accept="audio/*" 
              required
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                 const selected = e.target.files[0];
                 if (selected) {
                   setFile(selected);
                   if(!title) setTitle(selected.name.replace(/\.[^/.]+$/, ""));
                 }
              }}
            />
            <FileAudio size={40} className="text-gray-400 mb-3 md:mb-4 md:w-[48px] md:h-[48px]" />
            <div className="text-base md:text-lg font-bold text-white mb-2 px-2 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
              {file ? file.name : "Choose an audio file or drag & drop"}
            </div>
            <div className="text-xs md:text-sm text-gray-500">MP3, WAV up to 50MB</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-xs md:text-sm font-semibold mb-2 text-gray-300">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 md:p-3 bg-base-light border border-gray-600 rounded text-white focus:border-brand focus:outline-none text-sm md:text-base"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
             </div>
             <div>
                <label className="block text-xs md:text-sm font-semibold mb-2 text-gray-300">Artist</label>
                <input
                  type="text"
                  className="w-full p-2.5 md:p-3 bg-base-light border border-gray-600 rounded text-white focus:border-brand focus:outline-none text-sm md:text-base"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                />
             </div>
          </div>

          <button 
            type="submit" 
            disabled={uploading || !file}
            className={`mt-2 md:mt-4 w-full bg-brand text-black font-bold py-3 md:py-3 px-4 rounded-full transition-transform text-sm md:text-base ${(!file || uploading) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            {uploading ? 'Uploading...' : 'Upload Song'}
          </button>
        </form>
      </div>

      <div className="w-full max-w-4xl border-t border-gray-800 pt-6 md:pt-8 mb-24">
         <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
           <Music className="text-gray-400 w-5 md:w-6"/> Your Uploaded Songs
         </h2>
         {mySongs.length === 0 ? (
            <div className="text-gray-500 text-center py-8 bg-base-light rounded-lg border border-gray-800 text-sm md:text-base">You haven't uploaded any songs yet.</div>
         ) : (
            <div className="bg-base-light rounded-lg border border-gray-800 overflow-hidden shadow-xl">
               {mySongs.map((song, i) => (
                  <div key={song.id} className="flex flex-row items-center p-3 md:p-4 border-b border-gray-800/50 hover:bg-white/5 group gap-2">
                     <span className="text-gray-500 w-5 md:w-8 text-xs md:text-sm text-center font-mono">{i+1}</span>
                     <div className="flex-1 min-w-0 pr-2">
                        <div className="font-bold text-white text-sm md:text-base truncate">{song.title}</div>
                        <div className="text-xs md:text-sm text-gray-400 truncate">{song.artist || 'Unknown'}</div>
                     </div>
                     <div className="w-[60px] md:w-32 flex justify-end md:justify-start">
                        {song.status === 'APPROVED' ? <span className="text-green-500 text-[9px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 bg-green-900/20 rounded border border-green-900/50">APPROVED</span> :
                         song.status === 'PENDING' ? <span className="text-yellow-500 text-[9px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 bg-yellow-900/20 rounded border border-yellow-900/50">PENDING</span> : 
                         <span className="text-red-500 text-[9px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 bg-red-900/20 rounded border border-red-900/50">REJECTED</span>}
                     </div>
                     <button onClick={() => handleDelete(song.id)} className="text-gray-500 hover:text-red-500 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity p-2 cursor-pointer ml-1">
                        <Trash2 size={16} className="md:w-[20px]" />
                     </button>
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
}
