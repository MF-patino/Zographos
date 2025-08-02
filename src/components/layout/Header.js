      
import React from 'react';
import { useAuthContext } from '../auth/AuthContext'; // Note the path might change based on your folder structure
import './Header.css';

const Header = () => {
    // Get the authentication state and logout function from our context
    const { token, deleteLoginInfo } = useAuthContext();

    // Conditionally build the className string for the header element
    const headerClasses = `App-header ${token ? 'logged-in' : ''}`;

    return (
        <header className={headerClasses}>
            <div className="header-content">
                <div className="logo-container">
                    {/* The final "ΖΩ" logo, hidden by default */}
                    <span className="logo-text-final">ΖΩ</span>
                    {/* The initial "Zō" text */}
                    <span className="logo-text-initial">Zōgraphos</span>
                </div>

                <div className="header-right">
                    {/* The logout button that will appear */}
                    <button className="logout-btn" onClick={deleteLoginInfo}>
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;