import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../auth/AuthContext';
import * as scrollService from '../../api/scrollService';
import ConfirmationModal from '../common/ConfirmationModal';
import './ManageScrollForm.css';

const ManageScrollForm = ({ isOpen, onClose, onScrollAdded, onScrollUpdated, onScrollDeleted, scrollInfo=null }) => {
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { token } = useAuthContext();
    const [formData, setFormData] = useState({
            scrollId: '',
            displayName: '',
            description: '',
            thumbnailUrl: '',
        });
    const [inkImage, setInkImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const isEditMode = !!scrollInfo

    useEffect(() => {
        if (scrollInfo) {
            // If we are in edit mode, pre-fill the form with the scroll's info.
            setFormData({
                scrollId: scrollInfo.scrollId,
                displayName: scrollInfo.displayName,
                description: scrollInfo.description || '', // Ensure no null values
                thumbnailUrl: scrollInfo.thumbnailUrl || '',
            });
        } else {
            // If we are in create mode, ensure the form is reset.
            setFormData({
                scrollId: '',
                displayName: '',
                description: '',
                thumbnailUrl: '',
            });
        }
        // Reset other state when the modal opens
        setInkImage(null);
        setError(null);
    }, [scrollInfo]);

    if (!isOpen) {
        return null;
    }

    const handleDelete = (e) => {
        setIsConfirmModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsConfirmModalOpen(false);
        setIsDeleting(true);
        setError(null);
        try {
            await scrollService.deleteScroll(token, scrollInfo.scrollId)
            alert('Scroll deleted successfully.');
            onScrollDeleted(scrollInfo.scrollId)
            onClose()
        } catch (err) {
            var finalError = ''
            try {finalError = JSON.parse(err.message)} catch { finalError = err }
            
            setError(finalError.message || 'Failed to delete scroll.');
        } finally {
            setIsDeleting(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setInkImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isEditMode && !inkImage) {
            setError('An ink prediction image is required.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            if (isEditMode){
                const updatedScroll = await scrollService.updateScroll(token, scrollInfo.scrollId, formData);
                onScrollUpdated(updatedScroll)
            } else {
                const newScroll = await scrollService.createScroll(token, formData, inkImage);
                onScrollAdded(newScroll); // Pass the new scroll back to the parent
            }
            onClose(); // Close the modal on success
        } catch (err) {
            var finalError = ''
            try {finalError = JSON.parse(err.message)} catch { finalError = err }
            
            setError(finalError.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    // This stops a click inside the overlay from closing it
    const handleContentClick = (e) => e.stopPropagation();

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={handleContentClick}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h3>{scrollInfo ? "Edit scroll details" : "Add new scroll"}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="scrollId">Scroll ID (e.g., vesuvius-scroll-1)</label>
                        <input type="text" name="scrollId" value={formData.scrollId} required onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="displayName">Display name</label>
                        <input type="text" name="displayName" value={formData.displayName} required onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description (Optional)</label>
                        <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange}></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</label>
                        <input type="url" name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleInputChange} />
                    </div>
                    {!isEditMode && <div className="form-group">
                        <label htmlFor="inkImage">Ink prediction image (PNG)</label>
                        <input type="file" name="inkImage" required accept="image/png" onChange={handleFileChange} />
                    </div>}
                    {error && <p className="error-text">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" className="modal-btn cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="modal-btn confirm" disabled={isLoading}>
                            {isLoading ? 'Uploading...' : (isEditMode ? 'Update scroll' : 'Create scroll')}
                        </button>
                        {isEditMode && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="delete-button"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete scroll'}
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {isEditMode && <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title="Delete scroll"
                message={`Are you sure you want to delete scroll "${scrollInfo.displayName}"? All associated annotations will also be permanently removed.`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsConfirmModalOpen(false)}
            />}
        </div>
    );
};

export default ManageScrollForm;