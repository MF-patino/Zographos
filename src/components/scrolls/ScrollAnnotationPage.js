import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as scrollService from '../../api/scrollService';
import * as annotationService from '../../api/annotationService';
import { useAuthContext } from '../auth/AuthContext';
import { useAnnotationContext } from '../annotations/AnnotationContext';
import AnnotationBox from '../annotations/AnnotationBox';
import { FaPlus, FaMinus, FaExpand, FaPen } from 'react-icons/fa';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { usePanel } from '../panel/PanelContext';
import './ScrollAnnotationPage.css';

const Controls = ({ isDrawingMode, onToggleDrawingMode, permissions }) => {
    const { zoomIn, zoomOut, resetTransform } = useControls();

    const canEdit = ['write', 'admin', 'root'].includes(permissions)
    return (
        <div className="zoom-controls">
            {/* Button to toggle drawing mode */}
            {canEdit && <button
                onClick={onToggleDrawingMode}
                className={isDrawingMode ? 'active' : ''}
                title={isDrawingMode ? 'Disable Drawing Mode' : 'Enable Drawing Mode'}
            >
                <FaPen />
            </button>}

            {/* Buttons for canvas transformations */}
            <button onClick={() => zoomIn()} title="Zoom In"><FaPlus /></button>
            <button onClick={() => zoomOut()} title="Zoom Out"><FaMinus /></button>
            <button onClick={() => resetTransform()} title="Reset View"><FaExpand /></button>
        </div>
    );
};

const ScrollAnnotationPage = () => {
    const { annotations, setAnnotations } = useAnnotationContext();

    const { openPanel } = usePanel();
    const { token, userInfo } = useAuthContext();
    const { scrollId } = useParams();
    const navigate = useNavigate();

    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mouseDown, setMouseDown] = useState(false);

    // State for drawing mode
    const [transformState, setTransformState] = useState({ scale: 1, positionX: 0, positionY: 0 });
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false); // Tracks if mouse is currently down
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const [newBox, setNewBox] = useState(null);
    const canvasRef = useRef(null); // Ref to the image wrapper for coordinates

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

        const fetchScrollData = async () => {
            try {
                // Fetch the image data as a blob
                const [imageBlob, annotationResponse] = await Promise.all([
                    scrollService.getScrollImageBlob(token, scrollId),
                    annotationService.getScrollRegions(token, scrollId)
                ]);
                
                setAnnotations(annotationResponse.regions);

                // Create a temporary URL for the blob
                objectUrl = URL.createObjectURL(imageBlob);
                setImageUrl(objectUrl);

            } catch (err) {
                setError(err.message || 'Could not load scroll image.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchScrollData();

        // Cleanup to prevent memory leaks.
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };

    }, [scrollId, token, setAnnotations]);

    // Mouse Handlers for Drawing
    const handleDrawMouseDown = (e) => {
        if (!isDrawingMode || !canvasRef.current) return;
    
        e.stopPropagation(); // Stop pan-pinch from activating
        
        const { scale, positionX, positionY } = transformState;
        const rect = canvasRef.current.getBoundingClientRect();

        // Calculate mouse position relative to the scaled and panned image
        const x = (e.clientX - rect.left - positionX) / scale;
        const y = (e.clientY - rect.top - positionY) / scale;

        setIsDrawing(true);
        setStartPoint({ x, y });
        setNewBox({ x, y, width: 0, height: 0 });
    };

    const handleDrawMouseMove = (e) => {
        if (!isDrawing || !canvasRef.current) return;

        const { scale, positionX, positionY } = transformState;
        const rect = canvasRef.current.getBoundingClientRect();
        
        const currentX = (e.clientX - rect.left - positionX) / scale;
        const currentY = (e.clientY - rect.top - positionY) / scale;

        setNewBox({
            x: Math.min(startPoint.x, currentX),
            y: Math.min(startPoint.y, currentY),
            width: Math.abs(currentX - startPoint.x),
            height: Math.abs(currentY - startPoint.y),
        });
    };

    const boxToAnnotation = (box) => {
        return {
            isNew: true,
            authorUsername: userInfo.basic_info.username,
            certaintyScore: 0,
            basic_info: {
                coordinates: box,
                transcription: '',
            },
        };
    }
    const handleDrawMouseUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        
        if (newBox && newBox.width > .001 && newBox.height > .001) {
            
            openPanel('annotation', boxToAnnotation(newBox));
        } else
            setNewBox(null)
    };
  
    // Handler for the button in the controls
    const toggleDrawingMode = () => {
        setIsDrawingMode(prev => !prev);
        setNewBox(null);
    };

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
                panning={{ disabled: isDrawingMode, velocityDisabled: true }}
                doubleClick={{ disabled: true }} // Disable double click to avoid conflicts
                onTransformed={(ref, state) => setTransformState(state)}
            >
                {() => (
                    <>
                        <Controls isDrawingMode={isDrawingMode} onToggleDrawingMode={toggleDrawingMode} permissions={userInfo.permissions} />
                        <TransformComponent wrapperClass="canvas-wrapper" contentClass="canvas-content">
                            <div
                                // Fix issues with canvas not taking available screen space in production build by forcing it to do so
                                style={{width: `${window.screen.width}px`, height: `${window.screen.height}px`, display: "flex"}}
                                // Add mouse handlers
                                onMouseDown={handleDrawMouseDown}
                                onMouseMove={handleDrawMouseMove}
                                onMouseUp={handleDrawMouseUp}>

                                <img src={imageUrl} alt={`Ink prediction for ${scrollId}`} />
                                
                                {/* Map over the annotations and render a box for each one */}
                                {annotations.map(annotation => (
                                    <AnnotationBox key={annotation.regionId} annotation={annotation} isDisabled={isDrawingMode} />
                                ))}

                            
                                {newBox && <AnnotationBox annotation={boxToAnnotation(newBox)} isDrawing={true} />}
                            </div>
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

            <div ref={canvasRef} className="canvas-container"
                style={{ cursor: isDrawingMode ? 'crosshair' : (mouseDown ? "grabbing" : "grab") }}
            >
                {content}
            </div>
        </div>
    );
};

export default ScrollAnnotationPage;