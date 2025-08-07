import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../auth/AuthContext';
import * as authService from '../../api/authService';
import './ProfileOverlay.css';

// This component takes isOpen, onClose, and userInfo as props
const ProfileOverlay = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const { userInfo, token, deleteLoginInfo, storeLoginInfo } = useAuthContext();

    const formEntries = [
        {name: "username", type: 'text', title: 'Username:'},
        {name: "firstName", type: 'text', title: 'First name:'},
        {name: "lastName", type: 'text', title: 'Last name:'},
        {name: "contact", type: 'email', title: 'Contact email:'},
    ]

    const entryStateObject = {}
    formEntries.map((entry) => entryStateObject[entry.name] = '')
    
    const [formData, setFormData] = useState(entryStateObject);

    useEffect(() => {
        // Prefill the fields if userInfo is not null
        if (userInfo) {
            setFormData(() => (userInfo.basic_info));
        }
    }, [userInfo]); // Runs when userInfo changes
    
    // If the overlay isn't open, render nothing.
    if (!isOpen) {
        return null;
    }

    // This stops a click inside the overlay from closing it
    const handleContentClick = (e) => e.stopPropagation();

    // Logout needs to close this overlay first, as it has a dependency on userInfo
    const handleLogout = () => {onClose(); deleteLoginInfo();};


    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const switchModeHandler = () => {
        setIsEditMode(prevMode => !prevMode);
        setError(null); // Clear errors when switching modes
        setFormData(() => (userInfo.basic_info)); // Restart field values
    };

    const submitHandler = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const data = {
                basic_info: formData,
            };

            await authService.editInfo(userInfo.basic_info.username, data, token);
            if (userInfo.basic_info.username !== formData.username){ // username change
                alert("Username changes require logging out.")
                handleLogout();
            } else{
                const newUserInfo = userInfo
                newUserInfo.basic_info = formData

                storeLoginInfo(token, newUserInfo)
                switchModeHandler()
            }
        } catch (err) {
            const jsonError = JSON.parse(err.message)
            setError(jsonError.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }

    function createEntry(entry){
        return <span className="user-info-grid" key={entry.name}>
                    <b>{entry.title}</b>
                    {isEditMode ?
                    <input
                        type={entry.type}
                        id={entry.name}
                        name={entry.name}
                        required
                        value={formData[entry.name]}
                        onChange={handleInputChange}
                    /> : <span>{formData[entry.name]}</span>}
                </span>
    }

    return (
        // The backdrop that covers the page
        <div className="overlay-backdrop" onClick={onClose}>
            {/* The main content of the overlay */}
            <div className="overlay-content" onClick={handleContentClick}>
                <button className="overlay-close-btn" onClick={onClose}>&times;</button>
                
                <h3>Profile information</h3>
                
                <form onSubmit={submitHandler}>
                    {formEntries.map((entry) => createEntry(entry))}
                    {!isEditMode && 
                    <span className="user-info-grid">
                        <b>Permissions: </b> <span className="permission-tag">{userInfo.permissions}</span> 
                    </span>}

                    {isEditMode &&
                    <span>
                        <span className="error-text">{error}</span>
                        {/* Button for sending the request*/}
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Submit'}
                        </button>
                    </span>}
                </form>

                <div className="overlay-actions">
                    <button className="action-btn" onClick={switchModeHandler}>Edit info</button>
                    <button className="action-btn">Change password</button>
                    <button className="action-btn logout" onClick={handleLogout}>Logout</button>
                </div>
            </div>
        </div>
    );
};

export default ProfileOverlay;