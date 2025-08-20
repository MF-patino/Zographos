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

/**
 * This operation changes user information:
 * - If the 'infoData' DTO contains a password field, only the user password will change.
 * - Else, only the rest of the user information will change (e.g. username, first name, etc.).
 * @param {string} username - The username of the user to update.
 * @param {object} infoData - The information data the user wishes to change.
 * @param {string} token - The JWT authentication token.
 */
export const editInfo = async (username, infoData, token) => {
    const response = await fetch(`${API_URL}/user/` + username, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(infoData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Could not change user info.');
    }
};

/**
 * This operation deletes a user profile.
 * @param {string} username - The username of the user to delete.
 * @param {string} token - The JWT authentication token.
 */
export const deleteProfile = async (username, token) => {
    const response = await fetch(`${API_URL}/user/${username}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            // No 'Content-Type' needed for a DELETE request with no body
        },
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Could not delete user account.');
    }
};


/**
 * This operation changes user permissions:
 * @param {string} username - The username of the user whose permission level will change.
 * @param {object} permissionData - The new permission level requested to be given to a user.
 * @param {string} token - The JWT authentication token.
 */
export const changePermissions = async (username, permissionData, token) => {
    const response = await fetch(`${API_URL}/permissions/` + username, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(permissionData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Could not change user permissions.');
    }
};