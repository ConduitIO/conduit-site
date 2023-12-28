import React from 'react';

const DiagonalDivider = ({ className, ...otherProps }) => {
  return (
    <div role="presentation" aria-hidden="true" className={"-mb-2" + (className ? ' ' + className : '')}
         {...otherProps}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1662 141">
        <path
          d="M1662 .974V141H0V96L1662 .974z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
    </div>
  );
};

export default DiagonalDivider;
