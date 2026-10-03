import React from 'react';

const variants = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
  ghost: 'bg-transparent text-foreground hover:bg-secondary border border-border',
  destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
};

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';

  // Default sizing/padding if the caller's className doesn't specify its own
  const defaultStyles = className.includes('p-') || className.includes('px-') || className.includes('py-')
    ? ''
    : 'px-4 py-2 text-sm';

  const combinedClasses = `${baseClasses} ${defaultStyles} ${variants[variant] || variants.primary} ${className}`;

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
