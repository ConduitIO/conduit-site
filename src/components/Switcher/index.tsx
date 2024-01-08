import React from 'react';
import styles from './styles.module.css';

const Switcher = ({ children, className, ...otherProps }) => {
  return (
    <div
      className={styles.switcher + (className ? ' ' + className : '')}
      {...otherProps}
    >
      {children}
    </div>
  );
};

export default Switcher;
