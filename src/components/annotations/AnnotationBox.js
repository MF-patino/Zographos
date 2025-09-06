import React from 'react';
import { usePanel } from '../panel/PanelContext';
import "./AnnotationBox.css"

const AnnotationBox = ({ annotation, isDisabled = false, isDrawing = false }) => {
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
        />
    );
};

export default AnnotationBox;