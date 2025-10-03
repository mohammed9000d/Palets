import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [isContentReady, setIsContentReady] = useState(false);
  const [contentType, setContentType] = useState(null);

  const markContentReady = (type = 'general') => {
    console.log(`Content ready: ${type}`);
    setContentType(type);
    setIsContentReady(true);
  };

  const resetContentReady = () => {
    setIsContentReady(false);
    setContentType(null);
  };

  return (
    <LoadingContext.Provider 
      value={{
        isContentReady,
        contentType,
        markContentReady,
        resetContentReady
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};
