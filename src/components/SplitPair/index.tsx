import React from 'react';
import styles from './styles.module.css';

const SplitPair = ({ children, ...otherProps }) => {
  return (
    <div
      className={styles['split-pair']}
      {...otherProps}
    >
      {children}
    </div>
  );
};

export default SplitPair;
