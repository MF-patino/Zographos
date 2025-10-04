import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePanel } from '../panel/PanelContext';
import "./AnnotationBox.css"

const AnnotationBox = ({ annotation, isDisabled = false, isDrawing = false, onHandleMouseDown }) => {
    const navigate = useNavigate();
    const { scrollId } = useParams();
    const { openPanel } = usePanel();

    const handleClick = () => {
        // When clicked, navigate to the URL for this specific annotation
        navigate(`/scrolls/${scrollId}/${annotation.regionId}`);
        openPanel('annotation', annotation);
    };

    return (
        <div
            className={"annotation-box" + (isDrawing ? " drawing" : (isDisabled ? " disabled" : ' '))}
            style={{
                left: `${annotation.basic_info.coordinates.x}px`,
                top: `${annotation.basic_info.coordinates.y}px`,
                width: `${annotation.basic_info.coordinates.width}px`,
                height: `${annotation.basic_info.coordinates.height}px`,
            }}
            title={annotation.basic_info.transcription}
            onClick={handleClick}
        >
            {/* Render resize handles only when drawing */}
            {isDrawing && (
                <>
                    <div className="resize-handle top-left" onMouseDown={(e) => onHandleMouseDown(e, 'top-left')}></div>
                    <div className="resize-handle top-right" onMouseDown={(e) => onHandleMouseDown(e, 'top-right')}></div>
                    <div className="resize-handle bottom-left" onMouseDown={(e) => onHandleMouseDown(e, 'bottom-left')}></div>
                    <div className="resize-handle bottom-right" onMouseDown={(e) => onHandleMouseDown(e, 'bottom-right')}></div>
                </>
            )}
        </div>
    );
};

export default AnnotationBox;