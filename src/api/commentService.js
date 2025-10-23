import { API_URL } from '../config/apiSettings';

/**
 * Fetches all comments for a specific annotation region.
 * @param {string} token - The JWT authentication token.
 * @param {string} scrollId - The ID of the scroll.
 * @param {string} regionId - The UUID of the annotation region.
 * @returns {Promise<object>} - The full GetRegionComments200Response object from the API.
 */
export const getComments = async (token, scrollId, regionId) => {
    const response = await fetch(`${API_URL}/scrolls/${scrollId}/regions/${regionId}/comments`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch comments.');
    }

    return response.json();
};

/**
 * Adds a new comment to an annotation region.
 * @param {string} token - The JWT authentication token.
 * @param {string} scrollId - The ID of the scroll.
 * @param {string} regionId - The UUID of the annotation region.
 * @param {string} content - The text content of the comment.
 * @returns {Promise<object>} - The newly created Comment object.
 */
export const addComment = async (token, scrollId, regionId, content) => {
    const response = await fetch(`${API_URL}/scrolls/${scrollId}/regions/${regionId}/comments`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to add comment.');
    }

    return response.json();
};

/**
 * Deletes a specific comment from an annotation region.
 * @param {string} token - The JWT authentication token.
 * @param {string} scrollId - The ID of the scroll.
 * @param {string} regionId - The UUID of the annotation region.
 * @param {string} commentId - The UUID of the comment to delete.
 * @returns {Promise<void>}
 */
export const deleteComment = async (token, scrollId, regionId, commentId) => {
    const response = await fetch(`${API_URL}/scrolls/${scrollId}/regions/${regionId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete comment.');
    }

    // A successful 204 No Content response has no body.
    return;
};