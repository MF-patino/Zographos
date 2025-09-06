import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as userService from '../../api/userService';
import * as annotationService from '../../api/annotationService';
import { usePanel } from '../panel/PanelContext';
import { useAuthContext } from '../auth/AuthContext';
import { useAnnotationContext } from '../annotations/AnnotationContext';
import ProfileOverlay from '../profile/ProfileOverlay';
import StarRating from '../annotations/StarRating';
import './AnnotationTab.css';

const AnnotationTab = () => {
    const { addAnnotation } = useAnnotationContext();

    const { selectedAnnotation, setSelectedAnnotation } = usePanel();
    const { token, userInfo } = useAuthContext(); // To check if user can edit
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({ transcription: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const { scrollId } = useParams(); // Get the current scrollId

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
            // Default to view mode unless user is creating a new annotation
            setIsEditMode(!!selectedAnnotation.isNew);
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
        if (!!selectedAnnotation.isNew){
            const newAnnotationData = {
                transcription: formData.transcription,
                coordinates: selectedAnnotation.basic_info.coordinates,
            };
            
            const newAnnotation = await annotationService.createAnnotation(token, scrollId, newAnnotationData)
            addAnnotation(newAnnotation)
            setSelectedAnnotation(newAnnotation);
        }
        // TODO: Call annotationService.updateRegion(...)
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
                <strong>Certainty:</strong>
                
                <StarRating rating={selectedAnnotation.certaintyScore} /> 
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

                {isEditMode && <button type="submit">Submit</button>}
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