import React from 'react';

const Center = ({ children, className }) => {
  return (
    <div className={`center${className ? ' ' + className : ''}`}>
      {children}
    </div>
  );
};

export default Center;
