import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../slices/authSlice';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ toggleSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="absolute top-0 right-0 left-0 h-16 bg-black/50 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shadow-md z-30 transition-colors duration-300">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="p-2 -ml-2 text-white md:hidden hover:bg-gray-800 rounded-full transition-colors mr-2">
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-4 ml-auto">
        <div className="flex items-center gap-2 bg-black py-1 px-2 pr-3 md:pr-4 rounded-full border border-gray-800 cursor-pointer hover:bg-gray-900 transition-colors">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <UserIcon size={16} className="text-white" />
            </div>
            <span className="text-xs md:text-sm font-bold text-white max-w-[80px] md:max-w-[120px] truncate">{user?.name}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-900/40 text-red-500 hover:bg-red-900/60 transition-colors p-1.5 md:p-2 rounded-full border border-red-800"
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
