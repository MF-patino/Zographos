import React from 'react';
import { useAuthContext } from '../auth/AuthContext';
import { FaPlus } from 'react-icons/fa'; // Import the plus icon
import './ScrollList.css';

// This is the "Add New" button for admins
const AddScrollCard = ({handleAddClick}) => {
    return (
        <div className="scroll-card add-card" onClick={handleAddClick}>
            <div className="add-card-content">
                <FaPlus size={40} />
                <span>Add New Scroll</span>
            </div>
        </div>
    );
};


// This is the main list component
const ScrollList = ({ scrolls, onAddClick }) => {
    const { userInfo } = useAuthContext();
    
    // Check if the user has admin or root permissions
    const canAddScrolls = userInfo.permissions === 'admin' || userInfo.permissions === 'root';

    // This function will be called if an image fails to load.
    // It replaces the src of the failed image with the placeholder.
    const addDefaultSrc = (event) => {
        event.target.src = '/images/default-scroll-thumbnail.png';
    };

    return (
        <div className="scroll-list">
            {/* Conditionally render the "Add" card */}
            {canAddScrolls && <AddScrollCard handleAddClick={onAddClick} />}
            
            {/* Map over the scrolls and render a card for each */}
            {scrolls.map(scroll => (
                <div key={scroll.scrollId} className="scroll-card">
                    <img 
                        src={scroll.thumbnailUrl || '/images/default-scroll-thumbnail.png'}  
                        onError={addDefaultSrc} alt={scroll.scrollId} className="scroll-thumbnail" 
                    />
                    
                    <div className="scroll-info">
                        <h3>{scroll.displayName}</h3>
                        <p>{scroll.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ScrollList;