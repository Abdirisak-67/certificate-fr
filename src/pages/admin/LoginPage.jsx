import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';
import { useStore } from '../../Context/Context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { api } = useStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="mb-4 px-4 py-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="mb-4 px-4 py-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition flex items-center justify-center w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </div>
  );
}
