import React from 'react';

const Box = ({ children, className, ...otherProps }) => {
  return (
    <div className={`box${className ? ' ' + className : ''}`} {...otherProps}>
      {children}
    </div>
  );
};

export default Box;
