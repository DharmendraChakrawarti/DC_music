import React, { useState, useEffect } from 'react';
import api from '../api';
import { Trash2, PlusCircle, CheckCircle, Clock } from 'lucide-react';

export default function Admin() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const { data } = await api.get('/admin/songs');
      setSongs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/songs/${id}/approve`);
      fetchSongs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/songs/${id}`);
      fetchSongs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pt-24 px-8 pb-32">
      <h1 className="text-3xl font-bold mb-8 text-brand">Admin Dashboard</h1>
      
      <div className="bg-base-light rounded-lg border border-gray-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="border-b border-gray-800 text-gray-400 text-sm">
            <tr>
              <th className="p-4 font-normal">#</th>
              <th className="p-4 font-normal">TITLE</th>
              <th className="p-4 font-normal">USER</th>
              <th className="p-4 font-normal">STATUS</th>
              <th className="p-4 font-normal">VISIBILITY</th>
              <th className="p-4 font-normal text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {songs.map((song, i) => (
              <tr key={song.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                <td className="p-4 text-gray-400">{i + 1}</td>
                <td className="p-4">
                  <div className="font-semibold text-white">{song.title}</div>
                  <div className="text-gray-400">{song.artist}</div>
                </td>
                <td className="p-4 text-gray-300">{song.uploadedBy?.email}</td>
                <td className="p-4">
                  {song.status === 'APPROVED' ? (
                     <span className="flex items-center gap-1 text-green-400 bg-green-900/20 px-2 py-1 rounded w-max border border-green-800/50"><CheckCircle size={14}/> APPROVED</span>
                  ) : song.status === 'PENDING' ? (
                     <span className="flex items-center gap-1 text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded w-max border border-yellow-800/50"><Clock size={14}/> PENDING</span>
                  ) : (
                     <span className="flex items-center gap-1 text-red-500 bg-red-900/20 px-2 py-1 rounded w-max border border-red-800/50">REJECTED</span>
                  )}
                </td>
                <td className="p-4 text-gray-400">{song.visibility}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-3 text-gray-400">
                    <button 
                      onClick={() => handleApprove(song.id)}
                      disabled={song.status === 'APPROVED'}
                      className={`hover:text-green-500 transition-colors ${song.status === 'APPROVED' ? 'opacity-30 cursor-not-allowed hidden' : ''}`}
                      title="Approve & Publish to Global"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(song.id)}
                      className="hover:text-red-500 transition-colors"
                      title="Delete forever"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {songs.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No songs found in the system.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
