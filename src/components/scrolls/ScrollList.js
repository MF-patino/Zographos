import React from 'react';
import { useAuthContext } from '../auth/AuthContext';
import { FaPlus, FaPencilAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
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
const ScrollList = ({ scrolls, onAddClick, onEditScroll }) => {
    const { userInfo } = useAuthContext();
    
    // Check if the user has admin or root permissions
    const canManageScrolls = userInfo.permissions === 'admin' || userInfo.permissions === 'root';

    // This function will be called if an image fails to load.
    // It replaces the src of the failed image with the placeholder.
    const addDefaultSrc = (event) => {
        event.target.src = '/images/default-scroll-thumbnail.png';
    };

    const handleEditClick = (event, scroll) => {
        // Stop the click from propagating to the parent <Link>
        event.preventDefault();
        event.stopPropagation();
        
        onEditScroll(scroll)
    };

    return (
        <div className="scroll-list">
            {/* Conditionally render the "Add" card */}
            {canManageScrolls && <AddScrollCard handleAddClick={onAddClick} />}
            
            {/* Map over the scrolls and render a card for each */}
            {scrolls.map(scroll => (
                <Link to={`/scrolls/${scroll.scrollId}`} key={scroll.scrollId} className="scroll-card-link">
                    <div key={scroll.scrollId} className="scroll-card">
                        {/*3. Conditionally render the edit button*/}
                        {canManageScrolls && (
                            <button 
                                className="edit-scroll-btn" 
                                onClick={(e) => handleEditClick(e, scroll)}
                                aria-label={`Edit ${scroll.displayName}`}
                            >
                                <FaPencilAlt />
                            </button>
                        )}

                        <img 
                            src={scroll.thumbnailUrl || '/images/default-scroll-thumbnail.png'}  
                            onError={addDefaultSrc} alt={scroll.scrollId} className="scroll-thumbnail" 
                        />
                        
                        <div className="scroll-info">
                            <h3>{scroll.displayName}</h3>
                            <p>{scroll.description}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default ScrollList;