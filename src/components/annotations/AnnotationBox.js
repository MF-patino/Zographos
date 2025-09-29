import React from 'react';
import { usePanel } from '../panel/PanelContext';
import "./AnnotationBox.css"

const AnnotationBox = ({ annotation, isDisabled = false, isDrawing = false, onHandleMouseDown }) => {
    const { openPanel } = usePanel();

    const handleClick = () => {
        // When clicked, open the panel to the 'annotation' tab
        // and set this as the selected annotation.
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