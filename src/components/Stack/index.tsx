import React from 'react';
import styles from "@site/src/components/SplitPair/styles.module.css";

const Stack = ({ children, className, ...otherProps }) => {
  return (
    <div className={styles.stack + (className ? ' ' + className : '')} {...otherProps}>
      {children}
    </div>
  );
};

export default Stack;
