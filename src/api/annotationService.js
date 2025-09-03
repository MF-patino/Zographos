import { API_URL } from '../config/apiSettings';

/**
 * Fetches all annotation regions for a given scroll.
 * @param {string} token - The JWT authentication token.
 * @param {string} scrollId - The ID of the scroll.
 * @returns {Promise<object>} - The full RegionUpdateResponse object from the API.
 */
export const getScrollRegions = async (token, scrollId) => {
    const response = await fetch(`${API_URL}/scrolls/${scrollId}/regions`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch annotations.');
    }

    return response.json();
};