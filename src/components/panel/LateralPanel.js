import React from 'react';
import { usePanel } from './PanelContext';
import UserListTab from './UserListTab';
import { FaChevronLeft } from 'react-icons/fa'; 
import AnnotationTab from './AnnotationTab';
import './LateralPanel.css';

const LateralPanel = () => {
    const { isPanelOpen, closePanel, togglePanel, activeTab, selectedAnnotation, openPanel } = usePanel();

    // Conditionally build the className string
    const panelClasses = `lateral-panel ${isPanelOpen ? 'open' : ''}`;

    return (
        <>
            {/* The main panel */}
            <div className={panelClasses}>
                <button 
                    className="panel-handle-btn" 
                    onClick={togglePanel} 
                    aria-label={isPanelOpen ? "Close panel" : "Open panel"}
                >
                    <FaChevronLeft className="handle-icon" />
                </button>

                <div className="panel-tabs">
                    <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => openPanel("users", selectedAnnotation)}>Users</button>
                    <button className={`tab-btn ${activeTab === 'annotation' ? 'active' : ''}`} onClick={() => openPanel("annotation", selectedAnnotation)} disabled={!selectedAnnotation}>
                        Annotation Details
                    </button>
                    <button onClick={closePanel} className="panel-close-btn">&times;</button>
                </div>
                <div className="panel-content">
                    {/* Conditional Tab Rendering */}
                    {activeTab === 'users' && <UserListTab />}
                    {activeTab === 'annotation' && <AnnotationTab />}
                </div>
            </div>
        </>
    );
};

export default LateralPanel;