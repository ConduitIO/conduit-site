import React from 'react';

const Switcher = ({ children, className, ...otherProps }) => {
  return (
    <div
      className={`switcher${className ? ' ' + className : ''}`}
      {...otherProps}
    >
      {children}
    </div>
  );
};

export default Switcher;
