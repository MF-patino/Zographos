      
import React, {useState} from 'react';
import { useAuthContext } from '../auth/AuthContext'; // Note the path might change based on your folder structure
import ProfileButton from '../profile/ProfileButton';
import ProfileOverlay from '../profile/ProfileOverlay';
import './Header.css';

const Header = () => {
    // Get the authentication state and logout function from our context
    const { token } = useAuthContext();

    // Create state to manage the overlay's visibility
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);

    // Conditionally build the className string for the header element
    const headerClasses = `App-header ${token ? 'logged-in' : ''}`;

    // Handlers to open and close the overlay
    const openOverlay = () => setIsOverlayOpen(true);
    const closeOverlay = () => setIsOverlayOpen(false);

    return (
        <header className={headerClasses}>
            <div className="header-content">
                <div className="logo-container">
                    {/* The final "ΖΩ" logo, hidden by default */}
                    <span className="logo-text-final">ΖΩ</span>
                    {/* The initial "Zōgraphos" text */}
                    <span className="logo-text-initial">Zōgraphos</span>
                </div>

                <div className="header-right">
                    {/* The profile button that will appear */}
                    <ProfileButton className="profile-btn" onClick={openOverlay} />
                </div>
            </div>

            <ProfileOverlay isOpen={isOverlayOpen} onClose={closeOverlay} />
        </header>
    );
};

export default Header;