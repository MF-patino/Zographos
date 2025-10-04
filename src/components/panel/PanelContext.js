import React, { createContext, useState, useContext } from 'react';

const PanelContext = createContext(null);

export const PanelProvider = ({ children }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    const [activeTab, setActiveTab] = useState('annotation'); // 'users' or 'annotation'
    const [selectedAnnotation, setSelectedAnnotation] = useState(null);

    const openPanel = (tab = 'users', annotation = null) => {
        setActiveTab(tab);
        setSelectedAnnotation(annotation);
        setIsPanelOpen(true);
    };
    
    const closePanel = () => setIsPanelOpen(false);
    const togglePanel = () => setIsPanelOpen(prev => !prev);

    const value = {
        isPanelOpen,
        openPanel,
        closePanel,
        togglePanel,
        activeTab,
        selectedAnnotation,
        setSelectedAnnotation,
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