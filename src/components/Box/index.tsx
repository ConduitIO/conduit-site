import React from 'react';
import styles from './styles.module.css';

const Box = ({ children, className, ...otherProps }) => {
  return (
    <div className={styles.box + (className ? ' ' + className : '')} {...otherProps}>
      {children}
    </div>
  );
};

export default Box;
