import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import styles from "./styles.module.css";

function BorderedSection({ icon, title, children }) {
  return (
    <div className={styles.mainContainer}>
      <div className={styles.header}>
        <div className={styles.headerBorderBefore}></div>
        {(icon || title) && (
          <div className={styles.headerTitle}>
            {icon && <SvgIcon component={icon} />}
            {title && <span className={styles.title}>{title}</span>}
          </div>
        )}
        <div className={styles.headerBorderAfter}></div>
      </div>
      <div className={styles.childrenContainer}>{children}</div>
    </div>
  );
}

export default BorderedSection;