import React, { useState } from 'react';
import { useAuthContext } from '../auth/AuthContext';
import * as scrollService from '../../api/scrollService';
import './AddScrollForm.css';

const AddScrollForm = ({ isOpen, onClose, onScrollAdded }) => {
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

    if (!isOpen) {
        return null;
    }

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
        if (!inkImage) {
            setError('An ink prediction image is required.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const newScroll = await scrollService.createScroll(token, formData, inkImage);
            onScrollAdded(newScroll); // Pass the new scroll back to the parent
            onClose(); // Close the modal on success
        } catch (err) {
            setError(err.message || 'An unexpected error occurred.');
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
                <h3>Add New Scroll</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="scrollId">Scroll ID (e.g., vesuvius-scroll-1)</label>
                        <input type="text" name="scrollId" required onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="displayName">Display Name</label>
                        <input type="text" name="displayName" required onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description (Optional)</label>
                        <textarea name="description" rows="3" onChange={handleInputChange}></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</label>
                        <input type="url" name="thumbnailUrl" onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="inkImage">Ink Prediction Image (PNG)</label>
                        <input type="file" name="inkImage" required accept="image/png" onChange={handleFileChange} />
                    </div>
                    {error && <p className="error-text">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" className="modal-btn cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="modal-btn confirm" disabled={isLoading}>
                            {isLoading ? 'Uploading...' : 'Create Scroll'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddScrollForm;