import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as scrollService from '../../api/scrollService';
import { useAuthContext } from '../auth/AuthContext';
import { FaPlus, FaMinus, FaExpand } from 'react-icons/fa';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import './ScrollAnnotationPage.css';

const Controls = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();
    return (
        <div className="zoom-controls">
            <button onClick={() => zoomIn()} title="Zoom in"><FaPlus /></button>
            <button onClick={() => zoomOut()} title="Zoom out"><FaMinus /></button>
            <button onClick={() => resetTransform()} title="Reset view"><FaExpand /></button>
        </div>
    );
};

const ScrollAnnotationPage = () => {
    const { token } = useAuthContext();
    const { scrollId } = useParams();
    const navigate = useNavigate();

    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mouseDown, setMouseDown] = useState(false);

    const handleMouseDown = () => {setMouseDown(true);}
    const handleMouseUp = () => {setMouseDown(false);}

    useEffect(() => {
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);
    
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

    let content;
    if (isLoading) {
        content = <p className="loading-text">Loading scroll image...</p>;
    } else if (error) {
        content = <p className="error-text">{error}</p>;
    } else if (imageUrl) {
        content = (
            // The main wrapper that manages all the state.
            <TransformWrapper
                initialScale={1}
                minScale={0.2}
                maxScale={10}
                limitToBounds={false} // Allows panning beyond the image edges
                panning={{ velocityDisabled: true }} // Disables the "throw" effect for more precise movement
            >
                {() => (
                    <>
                        <Controls />
                        <TransformComponent wrapperClass="canvas-wrapper" contentClass="canvas-content">
                            <img src={imageUrl} alt={`Ink prediction for ${scrollId}`} />
                            {/* TODO: Annotation boxes will go here */}
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>
        );
    }

    return (
        <div className="scroll-annotation-page">
            <div className="detail-header">
                <button onClick={handleBack} className="back-button">&larr; Back</button>
                <h2>Annotating {scrollId}</h2>
            </div>

            <div className="image-container"
                style={{ cursor: mouseDown ? "grabbing" : "grab" }}
            >
                {content}
            </div>
        </div>
    );
};

export default ScrollAnnotationPage;