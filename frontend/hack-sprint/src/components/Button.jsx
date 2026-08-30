import React from 'react';

export const Button = ({ 
  children, 
  className = '', 
  disabled = false, 
  type = 'button',
  onClick,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Default button styles if no className is provided or className doesn't contain sizing
  const defaultStyles = className.includes('p-') || className.includes('px-') || className.includes('py-') 
    ? '' 
    : 'px-4 py-2';
    
  const combinedClasses = `${baseClasses} ${defaultStyles} ${className}`;

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};