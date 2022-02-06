import React from 'react';

const Cluster = ({ children, className, ...otherProps }) => {
  return (
    <div
      className={`cluster${className ? ' ' + className : ''}`}
      {...otherProps}
    >
      {children}
    </div>
  );
};

export default Cluster;
