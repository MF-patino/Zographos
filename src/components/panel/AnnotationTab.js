import React, { useState, useEffect } from 'react';
import * as userService from '../../api/userService';
import { usePanel } from '../panel/PanelContext';
import { useAuthContext } from '../auth/AuthContext';
import ProfileOverlay from '../profile/ProfileOverlay';
import './AnnotationTab.css';

const AnnotationTab = () => {
    const { selectedAnnotation } = usePanel();
    const { token, userInfo } = useAuthContext(); // To check if user can edit
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({ transcription: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Handlers to open and close the overlay
    const openOverlay = async () => {
        let user = selectedUser

        // Query for user information if we don't have it yet or annotation author changed
        if (!user || (user.basic_info !== selectedAnnotation.authorUsername)){
            setIsLoading(true)
            try {
                user = await userService.getUserInfo(token, selectedAnnotation.authorUsername)
            } catch (err) {
                var finalError = ''
                try {finalError = JSON.parse(err.message)} catch { finalError = err }
                
                setError(finalError.message || 'Failed to retrieve user info.');
            } finally {
                setIsLoading(false)
            }
        }

        if (user){
            setSelectedUser(user);
            setIsOverlayOpen(true);
        }
    };

    const closeOverlay = () => setIsOverlayOpen(false);

    useEffect(() => {
        if (selectedAnnotation) {
            setFormData({
                transcription: selectedAnnotation.basic_info.transcription,
            });
            setIsEditMode(false); // Default to view mode
        }
        setError(null);
    }, [selectedAnnotation]);

    if (!selectedAnnotation) {
        return <div className="tab-placeholder">Select an annotation to view its details.</div>;
    }

    const canEdit = userInfo.username === selectedAnnotation.authorUsername || 
                    userInfo.permissions === 'admin' || 
                    userInfo.permissions === 'root';

    const handleInputChange = (e) => {
        setFormData({ ...formData, transcription: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // TODO: Call annotationService.updateRegion(...)
        alert(`Updating transcription: ${formData.transcription}`);
        setIsEditMode(false);
    };

    return (
        <div className="annotation-tab">
            <h3>Annotation details</h3>
            <div className="detail-group">
                <strong>Author:</strong> <button onClick={() => openOverlay()} disabled={isLoading} className="user-link">@{selectedAnnotation.authorUsername}</button>
                {error && <p className="error-text">{error}</p>}
            </div>
            <div className="detail-group">
                <strong>Certainty:</strong> {selectedAnnotation.certaintyScore.toFixed(2)}/5
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="detail-group">
                    <strong>Transcription:</strong>
                    {isEditMode ? (
                        <textarea
                            value={formData.transcription}
                            onChange={handleInputChange}
                            rows="5"
                        />
                    ) : (
                        <p className="transcription-text">{selectedAnnotation.basic_info.transcription}</p>
                    )}
                </div>

                {isEditMode && <button type="submit">Submit changes</button>}
            </form>

            <div className="tab-actions">
                {canEdit && <button onClick={() => setIsEditMode(prev => !prev)}>{isEditMode ? 'Cancel' : 'Edit'}</button>}
                {/* TODO: Delete button */}
            </div>

            {/* TODO: Voting button */}

            <ProfileOverlay isOpen={isOverlayOpen} onClose={closeOverlay} otherUserInfo={selectedUser} />
        </div>
    );
};

export default AnnotationTab;