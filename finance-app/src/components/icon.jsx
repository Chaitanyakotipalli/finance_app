import React from 'react';
import TrendUp from '../assets/green_arrow.png';
import TrendDown from '../assets/red_arrow.png';

const ICONS = {
  trendUp: TrendUp,
  trendDown: TrendDown,
  // Add more icons here as needed
};

const Icon = ({ name, size = 24, alt = '', className = '' }) => {
  const icon = ICONS[name];

  if (!icon) return null;

  return (
    <img
      src={icon}
      alt={alt || name}
      width={size}
      height={size}
      className={className}
    />
  );
};

export default Icon;
