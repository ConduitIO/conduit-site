import React from 'react';
import styles from './styles.module.css';

const Wrapper = ({ children, className, ...otherProps }) => {
  return (
    <div
      className={styles.wrapper + (className ? ' ' + className : '')}
      {...otherProps}
    >
      {children}
    </div>
  );
};

export default Wrapper;
