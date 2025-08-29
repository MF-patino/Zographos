import { API_URL } from '../config/apiSettings';

/**
 * Fetches all available scrolls from the server.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array>} - A list of scroll objects.
 */
export const getAllScrolls = async (token) => {
    const response = await fetch(`${API_URL}/scrolls`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch scrolls.');
    }

    return response.json();
};


/**
 * Creates a new scroll by uploading its metadata and ink image.
 * @param {string} token - The JWT authentication token.
 * @param {object} metadata - The scroll's metadata (displayName, description, etc.).
 * @param {File} inkImage - The image file to upload.
 * @returns {Promise<object>} - The newly created scroll object.
 */
export const createScroll = async (token, metadata, inkImage) => {
    // Create a FormData object to build the multipart request
    const formData = new FormData();

    // Append the metadata as a JSON string Blob.
    // The backend expects a part named "metadata".
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    formData.append('metadata', metadataBlob);

    // Append the image file.
    // The backend expects a part named "ink_image".
    formData.append('ink_image', inkImage);

    // 4. Make the fetch request.
    // The browser will automatically set the Content-Type header
    // with the correct boundary.
    const response = await fetch(`${API_URL}/scrolls`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create scroll.');
    }

    return response.json();
};

/**
 * Deletes a scroll from the server.
 * @param {string} token - The JWT authentication token.
 * @param {string} scrollId - The ID of the scroll to delete.
 * @returns {Promise<void>}
 */
export const deleteScroll = async (token, scrollId) => {
    const response = await fetch(`${API_URL}/scrolls/${scrollId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete scroll.');
    }

    return;
};

/**
 * Fetches a secured image as a Blob.
 * @param {string} token - The JWT authentication token.
 * @param {string} scrollId - The ID of the scroll whose image to fetch.
 *- @returns {Promise<Blob>} - A promise that resolves to the image Blob.
 */
export const getScrollImageBlob = async (token, scrollId) => {
    const response = await fetch(`${API_URL}/scrolls/${scrollId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch image. Status: ${response.status}`);
    }

    return response.blob();
};


/**
 * Updates the metadata for an existing scroll.
 * @param {string} token - The JWT authentication token.
 * @param {string} originalScrollId - The ID of the scroll to update (from the URL path).
 *- @param {object} metadata - The DTO containing the new scroll metadata.
 * @returns {Promise<object>} - The updated scroll object from the server.
 */
export const updateScroll = async (token, originalScrollId, metadata) => {
    // The endpoint is /scrolls/{scrollId}
    const response = await fetch(`${API_URL}/scrolls/${originalScrollId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        // The body is the NewScroll DTO, serialized to a JSON string.
        body: JSON.stringify(metadata),
    });

    if (!response.ok) {
        throw new Error(`Failed to update scroll. Status: ${response.status}`);
    }

    // A successful PUT should return the updated resource.
    return response.json();
};