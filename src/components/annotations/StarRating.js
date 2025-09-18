import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'; // Import star icons
import './StarRating.css';

const StarRating = ({ rating, maxRating = 5, size = 20, canRate = false, onRatingSelect }) => {
    // This allows the stars to light up as the user mouses over them.
    const [hoverRating, setHoverRating] = useState(0);
    const displayRating = hoverRating > 0 ? hoverRating : rating;

    const handleMouseEnter = (index) => {
        if (canRate)
            setHoverRating(index);
    };

    const handleMouseLeave = () => {
        if (canRate)
            setHoverRating(0); // Reset hover state when mouse leaves the component
    };
    
    const handleClick = (index) => {
        if (canRate && onRatingSelect) {
            onRatingSelect(index); // Call the parent's function with the selected rating
            setHoverRating(0); // Reset hover after click
        }
    };

    const stars = [];

    // Loop from 1 to the maximum rating (e.g., 1 to 5)
    for (let i = 1; i <= maxRating; i++) {
        let starIcon;

        if (i <= displayRating) {
            // If the current star's index is less than or equal to the rating, it's a full star.
            starIcon = <FaStar key={i} size={size} />;
        } else if (hoverRating === 0 && i === Math.ceil(displayRating)) {
            // Only show half stars when not hovering with mouse
            starIcon = <FaStarHalfAlt key={i} size={size} />;
        } else {
            // Otherwise, it's an empty star.
            starIcon = <FaRegStar key={i} size={size} />;
        }

        stars.push(
            <div
                key={i}
                className="star-wrapper"
                onMouseEnter={() => handleMouseEnter(i)}
                onClick={() => handleClick(i)}
            >
                {starIcon}
            </div>
        );
    }

    return <div title={rating.toFixed(2) + "/" + maxRating}
                className={`star-rating ${canRate ? 'interactive' : ''}`}
                onMouseLeave={handleMouseLeave}>{stars}</div>;
};

export default StarRating;