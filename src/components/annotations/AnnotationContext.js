import React, { createContext, useState, useContext } from 'react';

const AnnotationContext = createContext(null);

export const AnnotationProvider = ({ children }) => {
    const [annotations, setAnnotations] = useState([]);

    // Function to add a newly created annotation to the list
    const addAnnotation = (newAnnotation) => {
        setAnnotations(prev => [newAnnotation, ...prev]);
    };

    // Function to update an existing annotation
    const updateAnnotation = (updatedAnnotation) => {
        setAnnotations(prev => 
            prev.map(anno => 
                anno.regionId === updatedAnnotation.regionId ? updatedAnnotation : anno
            )
        );
    };

    // Function to delete an annotation
    const deleteAnnotation = (regionId) => {
        setAnnotations(prev => prev.filter(anno => anno.regionId !== regionId));
    };

    const value = {
        annotations,
        setAnnotations,
        addAnnotation,
        updateAnnotation,
        deleteAnnotation,
    };

    return (
        <AnnotationContext.Provider value={value}>
            {children}
        </AnnotationContext.Provider>
    );
};

// Hook for consumption
export const useAnnotationContext = () => {
    const context = useContext(AnnotationContext);
    if (!context) {
        throw new Error('useAnnotationContext must be used within an AnnotationProvider');
    }
    return context;
};