import React from 'react';

interface RequiredAsteriskProps {
  hasError?: boolean;
  className?: string;
}

const RequiredAsterisk: React.FC<RequiredAsteriskProps> = ({ hasError = false, className = '' }) => (
  <span className={`ml-1 ${hasError ? 'text-red-500' : 'text-gray-400'} ${className}`}>*</span>
);

export default RequiredAsterisk;
