import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) {
        return null;
    }

    // This stops a click inside the overlay from closing it
    // And a click outside it from closing a parent overlay
    const handleBackpropClick = (e) => {onCancel(); e.stopPropagation()};
    const handleContentClick = (e) => e.stopPropagation();

    return (
        <div className="modal-backdrop" onClick={handleBackpropClick}>
            <div className="modal-content" onClick={handleContentClick}>
                <h4>{title}</h4>
                <p>{message}</p>
                <div className="modal-actions">
                    <button className="modal-btn cancel" onClick={onCancel}>
                        No, Cancel
                    </button>
                    <button className="modal-btn confirm" onClick={onConfirm}>
                        Yes, I'm Sure
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;