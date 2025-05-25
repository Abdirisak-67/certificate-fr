import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Base URL for API calls
  const baseURL = 'https://certificat-backend.onrender.com';

  // Create an axios instance with the base URL
  const api = axios.create({
    baseURL,
  });

  // Example API call function
  const fetchData = async (endpoint) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(endpoint);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    error,
    baseURL,
    api, // Export the axios instance
    fetchData,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

// Custom hook to use the store context
export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export default StoreContext;
