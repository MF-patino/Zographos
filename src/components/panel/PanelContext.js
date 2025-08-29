import React, { createContext, useState, useContext } from 'react';

const PanelContext = createContext(null);

export const PanelProvider = ({ children }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    const openPanel = () => setIsPanelOpen(true);
    const closePanel = () => setIsPanelOpen(false);
    const togglePanel = () => setIsPanelOpen(prev => !prev);

    const value = {
        isPanelOpen,
        openPanel,
        closePanel,
        togglePanel,
    };

    return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
};

export const usePanel = () => {
    const context = useContext(PanelContext);
    if (!context) {
        throw new Error('usePanel must be used within a PanelProvider');
    }
    return context;
};