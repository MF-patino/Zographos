import React, { useState, useEffect, useCallback } from 'react';
import * as userService from '../../api/userService';
import { useAuthContext } from '../auth/AuthContext';
import ProfileOverlay from '../profile/ProfileOverlay';
import './UserListTab.css';

const UserListTab = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pageIndex, setPageIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Handlers to open and close the overlay
    const openOverlay = (user) => { setSelectedUser(user); setIsOverlayOpen(true);};
    const closeOverlay = () => setIsOverlayOpen(false);

    const { token } = useAuthContext();

    const fetchUsers = useCallback(async (index) => {
        // We no longer need to pass the token as an argument,
        // because `useCallback` will have access to the `token` from the outer scope.
        if (!token) return; // Don't fetch if there's no token yet

        setIsLoading(true);
        setError(null);
        try {
            // The service can get the token from tokenService, so we don't need to pass it.
            const newUsers = await userService.getAllUsers(token, index);
            if (newUsers.length < 64) {
                setHasMore(false);
            }
            setUsers(prev => (index === 0 ? newUsers : [...prev, ...newUsers]));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    // Initial fetch
    useEffect(() => {
        fetchUsers(0);
    }, [fetchUsers]);

    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            const nextPageIndex = pageIndex + 64;
            setPageIndex(nextPageIndex);
            fetchUsers(nextPageIndex);
        }
    };

    return (
        <>
        <div className="user-list-tab">
            <h4>All Users</h4>
            <div className="user-list-container">
                {users.map(user => (
                    <button onClick={() => openOverlay(user)} key={user.basic_info.username} className="user-list-item">
                        <span className="user-list-name">
                            {user.basic_info.firstName} {user.basic_info.lastName}
                        </span>
                        <span className="user-list-username">
                            @{user.basic_info.username}
                        </span>
                    </button>
                ))}
            </div>
            {isLoading && <p>Loading...</p>}
            {error && <p className="error-text">{error}</p>}
            {hasMore && !isLoading && (
                <button onClick={handleLoadMore} className="load-more-btn">
                    Load More
                </button>
            )}

        </div>
        <ProfileOverlay isOpen={isOverlayOpen} onClose={closeOverlay} otherUserInfo={selectedUser} />
        </>
        
    );
};

export default UserListTab;