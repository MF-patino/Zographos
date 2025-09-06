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

/**
 * Creates a new annotation region on a scroll.
 * @param {string} token - The JWT authentication token.
 * @param {string} scrollId - The ID of the scroll to add the annotation to.
 * @param {object} annotationData - The data for the new annotation (NewBoxRegion DTO).
 *   Should have the shape: { coordinates: {...}, transcription: "..." }
 * @returns {Promise<object>} - The newly created BoxRegion object from the server.
 */
export const createAnnotation = async (token, scrollId, annotationData) => {
    const response = await fetch(`${API_URL}/scrolls/${scrollId}/regions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json', // Tell the server we're sending JSON
        },
        // Convert the JavaScript object to a JSON string for the request body
        body: JSON.stringify(annotationData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create annotation.');
    }

    // A successful POST (201 Created) returns the full new resource
    return response.json();
};