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

    const { openPanel, selectedAnnotation, setSelectedAnnotation } = usePanel();
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
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState(null);
    const [newBox, setNewBox] = useState(null);
    const canvasRef = useRef(null); // Ref to the image wrapper for coordinates

    const MIN_BOX_SIZE = 10

    const isEditingAnnotation = (selectedAnnotation && selectedAnnotation.isEditing);

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
                var finalError = ''
                try {finalError = JSON.parse(err.message)} catch { finalError = err }
                
                setError(finalError.message || 'Could not load scroll image.');
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

    const handleBoxMouseDown = (e, handle) => {
        e.stopPropagation();
        
        setIsResizing(true);
        setResizeHandle(handle);
        setStartPoint({ x: e.clientX, y: e.clientY }); // Store initial screen coordinates
    };

    const handleDrawMouseMove = (e) => {
        if (!canvasRef.current) return;

        if (isDrawing) {
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
        } else if (isResizing) {
            // Logic for resizing an existing box
            const dx = e.clientX - startPoint.x;
            const dy = e.clientY - startPoint.y;
            
            const currentBox = (newBox && !isEditingAnnotation) ? newBox : selectedAnnotation.basic_info.coordinates

            if (!currentBox) return;

            let { x, y, width, height } = currentBox;

            // Adjust dimensions based on which handle is being dragged
            // not letting the box width and height become too small
            if (resizeHandle.includes('right') && width + dx > MIN_BOX_SIZE) {
                width += dx;
            }
            if (resizeHandle.includes('left') && dx < width - MIN_BOX_SIZE) {
                x += dx;
                width -= dx;
            }
            if (resizeHandle.includes('bottom') && height + dy > MIN_BOX_SIZE) {
                height += dy;
            }
            if (resizeHandle.includes('top') && dy < height - MIN_BOX_SIZE) {
                y += dy;
                height -= dy;
            }
            
            // Update the box state and reset the start point for the next move event
            if (newBox && !isEditingAnnotation)
                setNewBox({ x, y, width, height });
            else{
                selectedAnnotation.basic_info.coordinates = { x, y, width, height }
                setSelectedAnnotation(selectedAnnotation);
            }

            setStartPoint({ x: e.clientX, y: e.clientY });
        }
    };

    // Mouse Handlers for Drawing
    const handleDrawMouseDown = (e) => {
        if (isResizing || !isDrawingMode || !canvasRef.current) return;
    
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
        if (isDrawing) {
            if (!isDrawing) return;
            setIsDrawing(false);
            
            if (newBox && newBox.width > MIN_BOX_SIZE && newBox.height > MIN_BOX_SIZE)
                openPanel('annotation', boxToAnnotation(newBox));
            else
                setNewBox(null)
        }

        if (isResizing) {
            setIsResizing(false);
            setResizeHandle(null);
        }
    };
  
    // Handler for the button in the controls
    const toggleDrawingMode = () => {
        setIsDrawingMode(prev => !prev);
        openPanel("users", null)
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
                                    <AnnotationBox 
                                        key={annotation.regionId}
                                        annotation={(isEditingAnnotation && selectedAnnotation.regionId === annotation.regionId) ? selectedAnnotation : annotation}
                                        isDisabled={isDrawingMode} 
                                        isDrawing={(isEditingAnnotation && selectedAnnotation.regionId === annotation.regionId)}
                                        onHandleMouseDown={handleBoxMouseDown} />
                                ))}

                            
                                {(newBox && !isEditingAnnotation) && <AnnotationBox annotation={boxToAnnotation(newBox)} isDrawing={true} onHandleMouseDown={handleBoxMouseDown} />}
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