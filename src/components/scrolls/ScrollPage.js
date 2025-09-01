import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../auth/AuthContext';
import * as scrollService from '../../api/scrollService';
import ScrollList from './ScrollList';
import ManageScrollForm from './ManageScrollForm';
import './ScrollPage.css';

const ScrollsPage = () => {
    const { userInfo, token } = useAuthContext();

    // State for managing scrolls, loading, and errors
    const [scrolls, setScrolls] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedScroll, setSelectedScroll] = useState(null);
    
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);

    const handleScrollUpdated = (updatedScroll) => {
        const selectedScrollIndex = scrolls.findIndex(s => s.scrollId === selectedScroll.scrollId);

        if (selectedScrollIndex !== -1) {
            // Create a new array to avoid direct state mutation.
            const updatedScrolls = [...scrolls];
            // Replace the old scroll object with the updated one from the API.
            updatedScrolls[selectedScrollIndex] = updatedScroll;
            setScrolls(updatedScrolls);
            setSelectedScroll(null);
        }
    };
    
    const handleScrollAdded = (newScroll) => {
        // Add the new scroll to the top of the list for immediate feedback
        setScrolls(prevScrolls => [newScroll, ...prevScrolls]);
    };

    const handleScrollDeleted = (deletedScrollId) => {
        setScrolls(prevScrolls => prevScrolls.filter(scroll => scroll.scrollId !== deletedScrollId));
        setSelectedScroll(null);
    };

    // Fetch scrolls when the component mounts
    useEffect(() => {
        const fetchScrolls = async () => {
            try {
                const fetchedScrolls = await scrollService.getAllScrolls(token);
                setScrolls(fetchedScrolls);
            } catch (err) {
                var finalError = ''
                try {finalError = JSON.parse(err.message)} catch { finalError = err }
                
                setError(finalError.message || 'An error occurred while fetching scrolls.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchScrolls();
    }, [token]);

    // Check if the user has admin or root permissions
    const canAddScrolls = userInfo.permissions === 'admin' || userInfo.permissions === 'root';

    let content = <p>No scrolls have been uploaded yet.</p>;

    const handleEditClick = (scroll) => {
        setSelectedScroll(scroll);
        setIsAddFormOpen(true);
    };
    const handleAddClick = () => {
        setSelectedScroll(null);
        setIsAddFormOpen(true);
    };

    if (scrolls.length > 0 || canAddScrolls) {
        content = <ScrollList scrolls={scrolls} onAddClick={handleAddClick} onEditScroll={handleEditClick} />;
    }

    if (error) {
        content = <p className="error-text">{error}</p>;
    }

    if (isLoading) {
        content = <p>Loading scrolls...</p>;
    }

    return (
        <>
            <div className="scrolls-page">
                <h2>Welcome, {userInfo.basic_info.firstName}!</h2>
                {canAddScrolls ? <p>Select a scroll to begin annotating or add a new one.</p>
                                : <p>Select a scroll to begin annotating.</p>}
                <div className="scrolls-container">
                    {content}
                </div>
            </div>

            {/* Render the form */}
            <ManageScrollForm
                isOpen={isAddFormOpen}
                onClose={() => setIsAddFormOpen(false)}
                onScrollAdded={handleScrollAdded}
                onScrollUpdated={handleScrollUpdated}
                onScrollDeleted={handleScrollDeleted}
                scrollInfo={selectedScroll}
            />
        </>
    );
};

export default ScrollsPage;