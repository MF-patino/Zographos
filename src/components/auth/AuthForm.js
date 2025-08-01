import React, { useState } from 'react';
import * as authService from '../../api/authService';
import './AuthForm.css';

const AuthPage = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // A single state object to hold all form data
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        contact: '',
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const switchModeHandler = () => {
        setIsLoginMode(prevMode => !prevMode);
        setError(null); // Clear errors when switching modes
    };

    const submitHandler = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            var token, userInfo;

            if (isLoginMode) {
                // Login logic
                const loginData = {
                    user_name: formData.username,
                    password: formData.password,
                };

                ({ token, userInfo } = await authService.login(loginData));

            } else {
                // Registration logic
                const registrationData = {
                    basic_info: {
                        username: formData.username,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        contact: formData.contact,
                    },
                    password: formData.password,
                };

                ({ token, userInfo } = await authService.register(registrationData));
            }

            //TODO: store token and user info in localStorage and global authentication context
        } catch (err) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={submitHandler}>
                <h2>{isLoginMode ? 'Login' : 'Register'} details</h2>

                {/* Fields for both login and register functionality */}
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        required
                        value={formData.username}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Fields only for registering */}
                {!isLoginMode && (
                    <>
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                required
                                value={formData.firstName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                required
                                value={formData.lastName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="contact">Email / Contact</label>
                            <input
                                type="email"
                                id="contact"
                                name="contact"
                                required
                                value={formData.contact}
                                onChange={handleInputChange}
                            />
                        </div>
                    </>
                )}

                {error && <p className="error-text">{error}</p>}

                {/* Buttons for sending the request and changing from login to register mode */}
                <button type="submit" className="submit-btn" disabled={isLoading}>
                    {isLoading ? 'Sending...' : (isLoginMode ? 'Login' : 'Create Account')}
                </button>
                <button type="button" className="switch-btn" onClick={switchModeHandler}>
                    {isLoginMode ? 'Register new account' : 'I already have an account'}
                </button>
            </form>
        </div>
    );
};

export default AuthPage;
