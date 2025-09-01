import React from 'react';
import { usePanel } from './PanelContext';
import UserListTab from './UserListTab';
import { FaChevronLeft } from 'react-icons/fa'; 
import './LateralPanel.css';

const LateralPanel = () => {
    const { isPanelOpen, closePanel, togglePanel } = usePanel();

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
                    {/* Add tab buttons here later */}
                    <button className="tab-btn active">Users</button>
                    {/*<button className="tab-btn" disabled>Annotation Details</button>*/}
                    <button onClick={closePanel} className="panel-close-btn">&times;</button>
                </div>
                <div className="panel-content">
                    {/* For now, we only show the user list tab */}
                    <UserListTab />
                </div>
            </div>
        </>
    );
};

export default LateralPanel;