import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const allowedAdmins = [
    'abdulsamad18@gmail.com',
    'abdirisak26@gmail.com'
  ];

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!allowedAdmins.includes(formData.email)) {
      toast.error('Only specific admin accounts are allowed to register.');
      setIsLoading(false);
      return;
    }
    try {
      await axios.post('https://certificat-backend.onrender.com/api/auth/register', formData);
      toast.success('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/admin/login'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Admin Registration</h1>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="mb-4 px-4 py-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={isLoading}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="mb-4 px-4 py-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={isLoading}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
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
              Registering...
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>
    </div>
  );
}