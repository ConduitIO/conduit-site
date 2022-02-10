import React from 'react';

const Wrapper = ({ children, className, ...otherProps }) => {
  return (
    <div
      className={`wrapper${className ? ' ' + className : ''}`}
      {...otherProps}
    >
      {children}
    </div>
  );
};

export default Wrapper;
