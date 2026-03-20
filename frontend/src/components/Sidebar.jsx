import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, PlusSquare, Settings, X } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function Sidebar({ isOpen, closeSidebar }) {
  const { user } = useSelector(state => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const linkClass = ({isActive}) => 
    `flex items-center gap-4 transition-colors p-2 rounded ${isActive ? "text-white bg-gray-800" : "text-gray-400 hover:text-white"}`;

  return (
    <>
      <div 
        className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out w-64 bg-black p-6 flex flex-col h-full z-50`}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center">
                <span className="text-black text-lg">D</span>
            </div>
            DC Music
          </div>
          <button onClick={closeSidebar} className="text-gray-400 md:hidden hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex flex-col gap-4 text-sm font-semibold">
          <NavLink to="/" end className={linkClass} onClick={closeSidebar}>
            <Home size={24} /> Home
          </NavLink>
          <NavLink to="/search" className={linkClass} onClick={closeSidebar}>
            <Search size={24} /> Search
          </NavLink>
          <NavLink to="/library" className={linkClass} onClick={closeSidebar}>
            <Library size={24} /> Your Library
          </NavLink>
          
          <div className="mt-6 mb-2 text-xs uppercase tracking-widest text-gray-400">Manage</div>
          <NavLink to="/upload" className={linkClass} onClick={closeSidebar}>
            <PlusSquare size={24} /> Upload Music
          </NavLink>
          
          {isAdmin && (
              <NavLink to="/admin" className={({isActive}) => `flex items-center gap-4 transition-colors p-2 rounded ${isActive ? "text-brand bg-gray-800" : "text-brand hover:text-white"}`} onClick={closeSidebar}>
                <Settings size={24} /> Admin Panel
              </NavLink>
          )}
        </nav>
        
        <div className="mt-auto border-t border-gray-800 pt-4">
          <div className="text-xs text-gray-400 mt-2 hover:underline cursor-pointer">Cookies</div>
          <div className="text-xs text-gray-400 mt-2 hover:underline cursor-pointer">Privacy</div>
        </div>
      </div>
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}
    </>
  );
}
