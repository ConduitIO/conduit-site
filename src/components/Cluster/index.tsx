import React from 'react';
import styles from './styles.module.css';

const Cluster = ({ children, className, ...otherProps }) => {
  return (
    <div
      className={styles.cluster + (className ? ' ' + className : '')}
      {...otherProps}
    >
      {children}
    </div>
  );
};

export default Cluster;
