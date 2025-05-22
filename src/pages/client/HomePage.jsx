import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';

export default function HomePage() {
  const [number, setNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Helper to encode number to hash (must match backend)
  async function getBackendHash(number) {
    try {
      const res = await axios.get(`https://certificat-backend.onrender.com/api/students/search/${number}`);
      return res.data.hash;
    } catch {
      return null;
    }
  }

  // Normalize number for Somali numbers: remove spaces, dashes, leading +, and country code if present
  function normalizeNumber(num) {
    let n = num.replace(/[^0-9]/g, ''); // remove all non-digits
    // Remove country code if present (00252, 252, or leading 0 after country code)
    if (n.length > 9 && (n.startsWith('00252') || n.startsWith('252'))) n = n.replace(/^00252|^252/, '');
    // Remove leading 0 if present after country code
    if (n.length > 9 && n.startsWith('0')) n = n.slice(1);
    return n;
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!number) {
      toast.error('Please enter your number');
      return;
    }
    setIsLoading(true);
    try {
      // Try searching with entered number
      let res = await axios.get(`https://certificat-backend.onrender.com/api/client/certificate/search/${number}`);
      let match = null;
      if (Array.isArray(res.data)) {
        if (res.data.length > 0) {
          match = res.data[0];
        }
      } else if (res.data && res.data.number) {
        match = res.data;
      }
      // If not found, try normalized number (remove country code, etc)
      if (!match) {
        const normalized = normalizeNumber(number);
        if (normalized !== number) {
          // Try to match any student whose number CONTAINS the normalized string (not just equals)
          res = await axios.get(`https://certificat-backend.onrender.com/api/client/certificate/search/${normalized}`);
          if (Array.isArray(res.data)) {
            // Try to find a match where the normalized input is contained in the student number
            match = res.data.find(s => s.number.replace(/[^0-9]/g, '').includes(normalized));
            // fallback: pick first if not
            if (!match && res.data.length > 0) match = res.data[0];
          } else if (res.data && res.data.number) {
            if (res.data.number.replace(/[^0-9]/g, '').includes(normalized)) {
              match = res.data;
            }
          }
        }
      }
      if (match) {
        const hash = await getBackendHash(match.number);
        if (hash) navigate(`/certificate/${hash}`);
        else toast.error('Certificate not found');
      } else {
        toast.error('Certificate not found');
      }
    } catch {
      toast.error('Certificate not found');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <form onSubmit={handleSearch} className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Certificate Search</h1>
        <input
          type="text"
          placeholder="Enter your number"
          value={number}
          onChange={e => setNumber(e.target.value)}
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
              Searching...
            </>
          ) : (
            'Search'
          )}
        </button>
      </form>
    </div>
  );
}
