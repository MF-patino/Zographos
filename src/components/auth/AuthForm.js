import React, { useState, useEffect } from 'react';
import * as userService from '../../api/userService';
import { useAuthContext } from './AuthContext';
import { MIN_PASSWORD_LENGTH, MIN_ENTRY_LENGTH, MAX_ENTRY_LENGTH } from '../../config/formValidation';
import './AuthForm.css';

const AuthForm = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { userInfo, storeLoginInfo } = useAuthContext();

    const formEntries = [
        {name: "username", type: 'text', title: 'Username', registerOnly: false},
        {name: "firstName", type: 'text', title: 'First name', registerOnly: true},
        {name: "lastName", type: 'text', title: 'Last name', registerOnly: true},
        {name: "contact", type: 'email', title: 'Contact email', registerOnly: true},
        {name: "password", type: 'password', title: 'Password', registerOnly: false},
        {name: "repeat", type: 'password', title: 'Repeat the password', registerOnly: true},
    ]

    const entryStateObject = {}
    formEntries.map((entry) => entryStateObject[entry.name] = '')
    
    // A single state object to hold all form data
    const [formData, setFormData] = useState(entryStateObject);

    // Form starts in login mode by default, so we retrieve the username
    // of the user previously logged in if it exists, when the context loads
    useEffect(() => {
        // Prefill the field if userInfo is not null
        if (userInfo) {
            setFormData(prevData => ({
                ...prevData,
                username: userInfo.basic_info.username
            }));
        }
    }, [userInfo]); // Runs when userInfo changes

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

                ({ token, userInfo } = await userService.login(loginData));

            } else {
                // Registration logic
                if (formData.password !== formData.repeat)
                    throw new Error("The new and repeated password fields do not coincide.")

                const registrationData = {
                    basic_info: {
                        username: formData.username,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        contact: formData.contact,
                    },
                    password: formData.password,
                };

                ({ token, userInfo } = await userService.register(registrationData));
            }
            
            storeLoginInfo(token, userInfo)
        } catch (err) {
            var finalError = ''
            try {finalError = JSON.parse(err.message)} catch { finalError = err }
            
            setError(finalError.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    function createEntry(entry){
        if (isLoginMode && entry.registerOnly)
            return null

        return <div key={entry.name} className="form-group">
                    <label htmlFor={entry.name}>{entry.title}</label>
                    <input
                        type={entry.type}
                        id={entry.name}
                        name={entry.name}
                        required
                        value={formData[entry.name]}
                        onChange={handleInputChange}
                        minLength={entry.type==="password" ? MIN_PASSWORD_LENGTH : MIN_ENTRY_LENGTH}
                        maxLength={MAX_ENTRY_LENGTH}
                    />
                </div>
    }
    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={submitHandler}>
                <h2>{isLoginMode ? 'Login' : 'Register'} details</h2>

                {/* Fields for both login and register functionality */}
                {formEntries.map((entry) => createEntry(entry))}

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

export default AuthForm;
