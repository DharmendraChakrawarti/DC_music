import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      dispatch(loginSuccess({ user: { email: data.email, role: data.role, name: data.name }, token: data.token }));
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-base-dark w-full max-w-md p-8 rounded-lg border border-gray-800 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-8 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand to-emerald-400">
          DC Music
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-white self-start">Log in to DC Music</h2>
        
        {error && <div className="text-red-500 bg-red-900/40 p-3 rounded w-full mb-4 text-sm border border-red-800">{typeof error === 'object' ? JSON.stringify(error) : error}</div>}
        
        <form onSubmit={handleLogin} className="w-full">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Email address</label>
            <input
              type="email"
              className="w-full p-3 bg-base-dark border border-gray-600 rounded text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              className="w-full p-3 bg-base-dark border border-gray-600 rounded text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-brand text-black font-bold py-3 px-4 rounded-full hover:scale-105 transition-transform ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        
        <div className="mt-8 text-sm text-gray-400 pt-6 border-t border-gray-800 w-full text-center">
          Don't have an account? <Link to="/register" className="text-white font-bold hover:underline hover:text-brand">Sign up for DC Music</Link>
        </div>
      </div>
    </div>
  );
}
