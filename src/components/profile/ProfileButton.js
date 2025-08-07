import React from 'react';
import { FaUserCircle } from 'react-icons/fa'; // Import a user icon
import { useAuthContext } from '../auth/AuthContext';
import './ProfileButton.css';

const ProfileButton = ({ onClick }) => {
    const { userInfo } = useAuthContext();

    return (
        <button className="profile-btn" onClick={onClick} aria-label="Open user profile">
            {userInfo && userInfo.basic_info.username } <b>&nbsp;</b> <FaUserCircle size={28} />
        </button>
    );
};

export default ProfileButton;