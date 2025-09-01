import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as scrollService from '../../api/scrollService';
import { useAuthContext } from '../auth/AuthContext';
import ConfirmationModal from '../common/ConfirmationModal';
import './ScrollAnnotationPage.css';

const ScrollAnnotationPage = () => {
    const { userInfo, token } = useAuthContext();
    const { scrollId } = useParams();
    const navigate = useNavigate();

    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isDeleting, setIsDeleting] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // Check if the current user has permission to delete this scroll
    const canDelete = userInfo.permissions === 'admin' || userInfo.permissions === 'root';

    // Image data fetching effect
    useEffect(() => {
        let objectUrl = null; // Variable to hold the URL for cleanup

        const fetchAndSetImage = async () => {
            try {
                // Fetch the image data as a blob
                const imageBlob = await scrollService.getScrollImageBlob(token, scrollId);
                
                // Create a temporary URL for the blob
                objectUrl = URL.createObjectURL(imageBlob);
                setImageUrl(objectUrl);

            } catch (err) {
                setError(err.message || 'Could not load scroll image.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndSetImage();

        // Cleanup to prevent memory leaks.
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };

    }, [scrollId, token]);

    const handleBack = () => {
        navigate('/scrolls');
    };

    const handleDelete = () => {
        setIsConfirmModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsConfirmModalOpen(false);
        setIsDeleting(true);
        setError(null);
        try {
            await scrollService.deleteScroll(token, scrollId)
            alert('Scroll deleted successfully.');
            handleBack();
        } catch (err) {
            var finalError = ''
            try {finalError = JSON.parse(err.message)} catch { finalError = err }
            
            setError(finalError.message || 'Failed to delete scroll.');
        } finally {
            setIsDeleting(false);
        }
    };

    let imageContent;
    if (isLoading) {
        imageContent = <p>Loading image...</p>;
    } else if (error) {
        imageContent = <p className="error-text">{error}</p>;
    } else if (imageUrl) {
        imageContent = <img src={imageUrl} alt={`Ink prediction for ${scrollId}`} />;
    }

    return (
        <div className="scroll-detail-page">
            <div className="detail-header">
                <button onClick={handleBack} className="back-button">&larr; Back to List</button>
                <h2>Annotating {scrollId}</h2>
                {canDelete && (
                    <button
                        onClick={handleDelete}
                        className="delete-button"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete scroll'}
                    </button>
                )}
            </div>

            <div className="image-container">
                {imageContent}
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title="Delete scroll"
                message={`Are you sure you want to delete scroll "${scrollId}"? All associated annotations will also be permanently removed.`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsConfirmModalOpen(false)}
            />
        </div>
    );
};

export default ScrollAnnotationPage;