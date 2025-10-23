import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../auth/AuthContext';
import * as commentService from '../../api/commentService';
import ConfirmationModal from '../common/ConfirmationModal';
import { FaTrash } from 'react-icons/fa';
import ReactDOM from 'react-dom';
import './CommentSection.css';

const CommentSection = ({ scrollId, regionId }) => {
    const { userInfo, token } = useAuthContext();
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [commentToDelete, setCommentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Data Fetching Effect
    useEffect(() => {
        const fetchComments = async () => {
            if (!regionId) return;
            setIsLoading(true);
            setError(null);
            try {
                const response = await commentService.getComments(token, scrollId, regionId);
                setComments(response.comments);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchComments();
    }, [scrollId, regionId, token]); // Refetch if the region changes

    // Form submission handler
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (newComment.trim() === '' || isSubmitting) return;

        setIsSubmitting(true);
        setError(null);
        try {
            const createdComment = await commentService.addComment(token, scrollId, regionId, newComment);
            // Add the new comment to the top of the list for instant feedback
            setComments(prev => [createdComment, ...prev]);
            setNewComment(''); // Clear the textbox
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Deletion handlers
    const handleDeleteClick = (comment) => {
        // When the trash icon is clicked, store the targeted comment and open the modal
        setCommentToDelete(comment);
    };

    const handleDeleteConfirm = async () => {
        if (!commentToDelete || isDeleting) return;

        setIsDeleting(true);
        setError(null);
        try {
            await commentService.deleteComment(token, scrollId, regionId, commentToDelete.commentId);
            setComments(prev => prev.filter(c => c.commentId !== commentToDelete.commentId));
            setCommentToDelete(null);
        } catch (err) {
            setError(err.message);
            setCommentToDelete(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setCommentToDelete(null);
    };

    // Check if the user has permission to post comments
    const canComment = ['write', 'admin', 'root'].includes(userInfo.permissions)

    return (
        <>
            <div className="comment-section">
                <h5>Comment section</h5>

                {/* New comment form */}
                {canComment && (
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            rows="3"
                            disabled={isSubmitting}
                        />
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </button>
                    </form>
                )}

                {error && <p className="error-text small">{error}</p>}

                {/* List of comments */}
                <div className="comment-list">
                    {isLoading ? (
                        <p>Loading comments...</p>
                    ) : comments.length === 0 ? (
                        <p className="no-comments-text">No comments yet.</p>
                    ) : (
                        comments.map(comment => {
                            const canDelete = userInfo.username === comment.authorUsername || 
                                                userInfo.permissions === 'admin' || 
                                                userInfo.permissions === 'root';

                            return (
                                <div key={comment.commentId} className="comment-item">
                                    <div className="comment-header">
                                        <span className="comment-author">@{comment.authorUsername}</span>
                                        <span className="comment-date">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="comment-content">{comment.text}</p>

                                    {/* The delete button */}
                                    {canDelete && (
                                        <div className="comment-actions">
                                            <button 
                                                className="delete-comment-btn" 
                                                onClick={() => handleDeleteClick(comment)}
                                                aria-label="Delete comment"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Deletion confirmation modal */}
            {ReactDOM.createPortal(
                <ConfirmationModal
                    isOpen={!!commentToDelete}
                    title="Delete comment"
                    message="Are you sure you want to permanently delete this comment?"
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleCancelDelete}
                />,
                document.getElementById('overlay-root')
            )}
        </>
    );
};

export default CommentSection;