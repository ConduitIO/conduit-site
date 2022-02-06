import React from 'react';

const SplitPair = ({ children, className, ...otherProps }) => {
  return (
    <div
      className={`split-pair${className ? ' ' + className : ''}`}
      {...otherProps}
    >
      {children}
    </div>
  );
};

export default SplitPair;
