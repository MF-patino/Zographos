import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'; // Import star icons
import './StarRating.css';

const StarRating = ({ rating, maxRating = 5, size = 20 }) => {
    const stars = [];

    // Loop from 1 to the maximum rating (e.g., 1 to 5)
    for (let i = 1; i <= maxRating; i++) {
        if (i <= rating) {
            // If the current star's index is less than or equal to the rating, it's a full star.
            stars.push(<FaStar key={i} size={size} />);
        } else if (i === Math.ceil(rating)) {
            // This star that should be a half-star.
            stars.push(<FaStarHalfAlt key={i} size={size} />);
        } else {
            // Otherwise, it's an empty star.
            stars.push(<FaRegStar key={i} size={size} />);
        }
    }

    return <div title={rating.toFixed(2) + "/" + maxRating} className="star-rating">{stars}</div>;
};

export default StarRating;