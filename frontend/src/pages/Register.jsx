import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      dispatch(loginSuccess({ user: { email: data.email, role: data.role, name: data.name }, token: data.token }));
      navigate('/');
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Registration failed');
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
        
        <h2 className="text-2xl font-bold mb-6 text-white self-start">Sign up for free to start listening.</h2>
        
        {error && <div className="text-red-500 bg-red-900/40 p-3 rounded w-full mb-4 text-sm border border-red-800">{error}</div>}
        
        <form onSubmit={handleRegister} className="w-full">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">What's your email?</label>
            <input
              type="email"
              className="w-full p-3 bg-base-dark border border-gray-600 rounded text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="Enter your email."
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Create a password</label>
            <input
              type="password"
              className="w-full p-3 bg-base-dark border border-gray-600 rounded text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="Create a password."
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">What should we call you?</label>
            <input
              type="text"
              className="w-full p-3 bg-base-dark border border-gray-600 rounded text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="Enter a profile name."
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="text-gray-400 text-xs mt-1">This appears on your profile.</div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-brand text-black font-bold py-3 px-4 rounded-full hover:scale-105 transition-transform ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-8 text-sm text-gray-400 pt-6 border-t border-gray-800 w-full text-center">
          Have an account? <Link to="/login" className="text-white font-bold hover:underline hover:text-brand">Log in.</Link>
        </div>
      </div>
    </div>
  );
}
