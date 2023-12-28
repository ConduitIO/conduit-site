import React from 'react';
import styles from './styles.module.css';

const Center = ({ children, className, ...otherProps }) => {
  return (
    <div
      className={styles.center + (className ? ' ' + className : '')}
      {...otherProps}
    >
      {children}
    </div>
  );
};

export default Center;
