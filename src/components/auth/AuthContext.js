import React, { createContext, useState, useContext, useEffect } from 'react';

// Context object
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true); 

    // On initial load, try to get data from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('jwt-token');
        const storedUserInfo = localStorage.getItem('user-info');
        
        if (storedToken && storedUserInfo) {
            setToken(storedToken);
            setUserInfo(JSON.parse(storedUserInfo));
        }

        // Whether we found a token in localStorage or not loading is complete.
        setIsAuthLoading(false);
    }, []); // Empty dependency array, runs only once on mount

    // Functions of the AuthContext
    const storeLoginInfo = (newToken, newInfo) => {
        const bearerToken = newToken.startsWith('Bearer ') ? newToken.substring(7) : newToken;
        
        localStorage.setItem('jwt-token', bearerToken);
        localStorage.setItem('user-info', JSON.stringify(newInfo));
        
        setToken(bearerToken);
        setUserInfo(newInfo);
    };

    const deleteLoginInfo = () => {
        localStorage.removeItem('jwt-token');
        localStorage.removeItem('user-info');
        
        setToken(null);
        setUserInfo(null);
    };

    // Values provided to consuming components
    const value = {
        token,
        userInfo,
        storeLoginInfo,
        deleteLoginInfo,
    };

    // Do not render children unless authentication info has loaded in 
    // As this is a fast localStorage retrieval a loading screen is not needed
    return isAuthLoading ? null : <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a custom hook for context consumption
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};