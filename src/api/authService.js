// The base URL of the HerculaneumTranscriptor backend
const API_URL = 'http://localhost:8080';

/**
 * Registers a new user.
 * @param {object} registrationData - The user registration information.
 * @returns {Promise<object>} - An object containing the JWT and user info.
 */
export const register = async (registrationData) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
    });

    if (!response.ok) {
        // Try to get the error message from the backend
        const errorText = await response.text();
        throw new Error(errorText || 'Registration failed');
    }

    // We return both token and user information for the frontend to use
    const userInfo = await response.json()
    const token = response.headers.get('Authorization');
    return { token, userInfo };
};

/**
 * Logs in a user.
 * @param {object} loginData - The user login credentials.
 * @returns {Promise<object>} - An object containing the JWT and user info.
 */
export const login = async (loginData) => {
    // The login endpoint is /user
    const response = await fetch(`${API_URL}/user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Login failed. Please check your credentials.');
    }

    // We return both token and user information for the frontend to use
    const userInfo = await response.json()
    const token = response.headers.get('Authorization');
    return { token, userInfo };
};
