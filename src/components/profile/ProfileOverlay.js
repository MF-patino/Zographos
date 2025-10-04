import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuthContext } from '../auth/AuthContext';
import * as userService from '../../api/userService';
import ConfirmationModal from '../common/ConfirmationModal';
import { MIN_PASSWORD_LENGTH, MIN_ENTRY_LENGTH, MAX_ENTRY_LENGTH } from '../../config/formValidation';
import './ProfileOverlay.css';

// This component takes isOpen, onClose, and otherUserInfo as props
const ProfileOverlay = ({ isOpen, onClose, otherUserInfo=null }) => {
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isPasswordMode, setIsPasswordMode] = useState(false);

    const [isPermissionsMode, setIsPermissionsMode] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState('');

    const { userInfo: loggedUser, token, deleteLoginInfo, storeLoginInfo } = useAuthContext();

    const isAdmin = loggedUser && (loggedUser.permissions === 'admin' || loggedUser.permissions === 'root');
    const canEdit = !otherUserInfo || (isAdmin && otherUserInfo && otherUserInfo.permissions !== 'root')
    const canChangePermissions = isAdmin && otherUserInfo && otherUserInfo.permissions !== 'root';
    const canSubmit = isEditMode || isPasswordMode || isPermissionsMode

    let userInfo = loggedUser
    if (otherUserInfo)
        userInfo = otherUserInfo

    const formEntries = [
        {name: "username", type: 'text', title: 'Username:'},
        {name: "firstName", type: 'text', title: 'First name:'},
        {name: "lastName", type: 'text', title: 'Last name:'},
        {name: "contact", type: 'email', title: 'Contact email:'},
    ]

    const passwordFormEntries = [
        {name: "password", type: 'password', title: 'New password:'},
        {name: "repeat", type: 'password', title: 'Repeat password:'},
    ]

    function getEntryStateObject(entries){
        const entryStateObject = {}
        entries.map((entry) => entryStateObject[entry.name] = '')

        return entryStateObject
    }

    const [formData, setFormData] = useState(getEntryStateObject(formEntries));

    const [passwordFormData, setPasswordFormData] = useState(getEntryStateObject(passwordFormEntries));

    useEffect(() => {
        // Prefill the fields if userInfo is not null
        if (userInfo) {
            setSelectedPermission(userInfo.permissions);
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

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            await userService.deleteProfile(userInfo.basic_info.username, token);
            alert('Account deleted successfully.');
            // After successful deletion, log the user out if it is the user being deleted.
            if (!otherUserInfo)
                handleLogout(); 
            else
                onClose();
        } catch (err) {
            var finalError = ''
            try {finalError = JSON.parse(err.message)} catch { finalError = err }
            
            setError(finalError.message || 'Failed to delete account.');
        } finally {
            setIsDeleting(false);
            setIsConfirmModalOpen(false);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        isEditMode ?
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        })) :
        setPasswordFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handlePermissionChange = (event) => {
        setSelectedPermission(event.target.value);
    };

    // Generic mode switcher
    const switchMode = (mode) => {
        setIsEditMode(mode === 'edit');
        setIsPasswordMode(mode === 'password');
        setIsPermissionsMode(mode === 'permissions');
        setError(null); // Clear errors when switching modes

        // Reset form data to the original state when switching modes
        setFormData(userInfo.basic_info);
        setPasswordFormData(getEntryStateObject(passwordFormEntries));
    };

    const submitHandler = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (isPasswordMode && (passwordFormData.password !== passwordFormData.repeat))
                throw new Error("The new and repeated password fields do not coincide.")

            if (isPermissionsMode){
                await userService.changePermissions(userInfo.basic_info.username, {permissions: selectedPermission,}, token);
                userInfo.permissions = selectedPermission
            } else {
                const data = isEditMode ? {basic_info: formData,} : {password: passwordFormData.password,};
                await userService.editInfo(userInfo.basic_info.username, data, token);
                userInfo.basic_info = formData
            }

            if (isEditMode){
                // username change requires a logout due to the JWT authentication
                // as the JWT of a user contains their username

                if (!otherUserInfo){
                    if (userInfo.basic_info.username !== formData.username){
                        alert("Username changes require logging out.")
                        handleLogout();
                    } else {
                        const newUserInfo = userInfo
                        newUserInfo.basic_info = formData

                        storeLoginInfo(token, newUserInfo)
                    }
                }
            }
            
            switchMode(null)
            
        } catch (err) {
            var finalError = ''
            try {finalError = JSON.parse(err.message)} catch { finalError = err }

            setError(finalError.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }

    function createEntry(entry, data){
        return <span className="user-info-grid" key={entry.name}>
                    <b>{entry.title}</b>
                    {// render form entries as inputs when in password or edit mode, else render as plain text
                    (isEditMode || isPasswordMode) ?
                    <input
                        type={entry.type}
                        id={entry.name}
                        name={entry.name}
                        required
                        value={data[entry.name]}
                        onChange={handleInputChange}
                        minLength={entry.type==="password" ? MIN_PASSWORD_LENGTH : MIN_ENTRY_LENGTH}
                        maxLength={MAX_ENTRY_LENGTH}
                        // check just in case to not show the passwords plainly
                    /> : (!isPasswordMode && <span>{data[entry.name]}</span>)}
                </span>
    }

    const deleteMessage = otherUserInfo ? `Are you sure you want to delete the account ${userInfo.basic_info.username}? This action cannot be undone.`
                                        : `Are you sure you want to delete your account, ${userInfo.basic_info.username}? This action cannot be undone.`

    const profileContent = (
        // The backdrop that covers the page
        <div className="overlay-backdrop" onClick={onClose}>
            {/* The main content of the overlay */}
            <div className="overlay-content" onClick={handleContentClick}>
                <button className="overlay-close-btn" onClick={onClose}>&times;</button>
                
                <h3>Profile {otherUserInfo ? `of ${userInfo.basic_info.username}` : 'information'}</h3>
                
                <form onSubmit={submitHandler}>
                    {isPermissionsMode ?
                    <div className="user-info-grid">
                        <b>Permissions:</b>
                        <select value={selectedPermission} onChange={handlePermissionChange} className="permission-select">
                            <option value="read">Read</option>
                            <option value="write">Write</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>: 
                    isPasswordMode ?
                    passwordFormEntries.map((entry) => createEntry(entry, passwordFormData)):
                    formEntries.map((entry) => createEntry(entry, formData))}

                    {!canSubmit && 
                    <span className="user-info-grid">
                        <b>Permissions: </b> <span className="permission-tag">{userInfo.permissions}</span> 
                    </span>}

                    {canSubmit &&
                    <span>
                        <span className="error-text">{error}</span>
                        {/* Button for sending the request*/}
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Submit'}
                        </button>
                    </span>}
                </form>

                <div className="overlay-actions">
                    {isEditMode && (
                        <button 
                            className="action-btn delete" 
                            onClick={() => setIsConfirmModalOpen(true)}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete account'}
                        </button>
                    )}
                    {canEdit && <button className="action-btn" onClick={() => switchMode(isEditMode ? null : 'edit')}>{isEditMode ? 'Cancel' : 'Edit info'}</button>}
                    {canEdit && <button className="action-btn" onClick={() => switchMode(isPasswordMode ? null : 'password')}>{isPasswordMode ? 'Cancel' : 'Change password'}</button>}
                    {canChangePermissions && <button className="action-btn" onClick={() => switchMode(isPermissionsMode ? null : 'permissions')}>{isPermissionsMode ? 'Cancel' : 'Change permissions'}</button>}
                    {!otherUserInfo && <button className="action-btn logout" onClick={handleLogout}>Logout</button>}
                </div>
            </div>

            {/* Render the ConfirmationModal.*/}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title="Delete account"
                message={deleteMessage}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsConfirmModalOpen(false)}
            />
        </div>
    );

    return ReactDOM.createPortal(
        profileContent,
        document.getElementById('overlay-root')
    );
};

export default ProfileOverlay;