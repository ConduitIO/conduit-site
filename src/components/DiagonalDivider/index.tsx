import React, { useEffect, useState } from 'react';

const DiagonalDivider = ({ className, lightBgColor, darkBgColor, ...otherProps }) => {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');

  useEffect(() => {
    const htmlElement = document.documentElement;

    const updateTheme = () => {
      const currentTheme = htmlElement.getAttribute('data-theme');
      setTheme(currentTheme || 'light');
    };

    const observer = new MutationObserver(updateTheme);

    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  let fillColor = theme === 'dark' ? darkBgColor : lightBgColor;
  console.log(fillColor);
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`-mb-2 ${className ? className : ''} ${theme === 'dark' ? 'text-dark' : 'text-light'}`}
      {...otherProps}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1662 141">
        <path
          d="M1662 .974V141H0V96L1662 .974z"
          fill={fillColor}
          fillRule="evenodd"
        />
      </svg>
    </div>
  );
};

export default DiagonalDivider;
