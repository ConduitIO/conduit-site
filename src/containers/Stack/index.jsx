import React from 'react';

const Stack = ({ children, className, ...otherProps }) => {
  return (
    <div className={`stack${className ? ' ' + className : ''}`} {...otherProps}>
      {children}
    </div>
  );
};

export default Stack;
