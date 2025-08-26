import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../auth/AuthContext';
import * as scrollService from '../../api/scrollService';
import ScrollList from './ScrollList';
import AddScrollForm from './AddScrollForm';
import './ScrollPage.css';

const ScrollsPage = () => {
    const { userInfo, token } = useAuthContext();

    // State for managing scrolls, loading, and errors
    const [scrolls, setScrolls] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);

    const handleScrollAdded = (newScroll) => {
        // Add the new scroll to the top of the list for immediate feedback
        setScrolls(prevScrolls => [newScroll, ...prevScrolls]);
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

    if (scrolls.length > 0 || canAddScrolls) {
        content = <ScrollList scrolls={scrolls} onAddClick={() => setIsAddFormOpen(true)} />;
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
            <AddScrollForm
                isOpen={isAddFormOpen}
                onClose={() => setIsAddFormOpen(false)}
                onScrollAdded={handleScrollAdded}
            />
        </>
    );
};

export default ScrollsPage;