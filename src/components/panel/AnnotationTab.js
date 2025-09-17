import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as userService from '../../api/userService';
import * as annotationService from '../../api/annotationService';
import { usePanel } from '../panel/PanelContext';
import { useAuthContext } from '../auth/AuthContext';
import { useAnnotationContext } from '../annotations/AnnotationContext';
import ProfileOverlay from '../profile/ProfileOverlay';
import StarRating from '../annotations/StarRating';
import ConfirmationModal from '../common/ConfirmationModal';
import ReactDOM from 'react-dom';
import './AnnotationTab.css';

const AnnotationTab = () => {
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { addAnnotation, deleteAnnotation, updateAnnotation } = useAnnotationContext();

    const { selectedAnnotation, setSelectedAnnotation, openPanel } = usePanel();
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

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            await annotationService.deleteAnnotation(token, scrollId, selectedAnnotation.regionId);
            
            deleteAnnotation(selectedAnnotation.regionId)
            openPanel("users", null)
        } catch (err) {
            var finalError = ''
            try {finalError = JSON.parse(err.message)} catch { finalError = err }
            
            setError(finalError.message || 'Failed to delete annotation.');
        } finally {
            setIsDeleting(false);
            setIsEditMode(false);
            setIsConfirmModalOpen(false);
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

    const canEdit = (userInfo.permissions === 'write' && userInfo.username === selectedAnnotation.authorUsername) || 
                    userInfo.permissions === 'admin' || 
                    userInfo.permissions === 'root';

    const handleInputChange = (e) => {
        setFormData({ ...formData, transcription: e.target.value });
    };

    const handleSubmit = async (e) => {
        setError(null);
        e.preventDefault();

        const newAnnotationData = {
            transcription: formData.transcription,
            coordinates: selectedAnnotation.basic_info.coordinates,
        };

        try {
            let result;
            if (!!selectedAnnotation.isNew){
                result = await annotationService.createAnnotation(token, scrollId, newAnnotationData)
                addAnnotation(result)
            }
            else{
                result = await annotationService.updateAnnotation(token, scrollId, selectedAnnotation.regionId, newAnnotationData);
                updateAnnotation(result)
            }
            
            setSelectedAnnotation(result);
        } catch (err) {
            var finalError = ''
            try {finalError = JSON.parse(err.message)} catch { finalError = err }
            
            setError(finalError.message || 'Failed to ' + (!!selectedAnnotation.isNew ? "create" : "update") + 'annotation.');
        }

        setIsEditMode(false);
    };

    return (
        <div className="annotation-tab">
            <h3>Annotation details</h3>
            <div className="detail-group">
                <strong>Author:</strong> <button onClick={() => openOverlay()} disabled={isLoading} className="user-link">@{selectedAnnotation.authorUsername}</button>
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
            
            {error && <p className="error-text">{error}</p>}

            <div className="tab-actions">
                {canEdit && <button onClick={() => setIsEditMode(prev => !prev)}>{isEditMode ? 'Cancel' : 'Edit'}</button>}

                {canEdit && (
                    <button 
                        className="action-btn delete" 
                        onClick={() => setIsConfirmModalOpen(true)}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                )}
            </div>

            {/* TODO: Voting button */}

            <ProfileOverlay isOpen={isOverlayOpen} onClose={closeOverlay} otherUserInfo={selectedUser} />

            {/* Render the ConfirmationModal.*/}
            {ReactDOM.createPortal(
                <ConfirmationModal
                    isOpen={isConfirmModalOpen}
                    title="Delete annotation"
                    message={"Are you sure you want to delete this annotation? This action cannot be undone."}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setIsConfirmModalOpen(false)}
                />,
                document.getElementById('overlay-root')
            )}
            
        </div>
    );
};

export default AnnotationTab;