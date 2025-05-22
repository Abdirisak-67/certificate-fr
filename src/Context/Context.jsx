import { createContext, useContext, useState } from 'react';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Base URL for API calls
  const baseURL = 'https://certificat-backend.onrender.com';

  // Example API call function
  const fetchData = async (endpoint) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${baseURL}${endpoint}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
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