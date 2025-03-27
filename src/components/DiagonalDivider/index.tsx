import React, { useEffect, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

const DiagonalDivider = ({ className, lightBgColor, darkBgColor, ...otherProps }) => {
  const [theme, setTheme] = useState('light'); // Default to light theme

  useEffect(() => {
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme);

    const updateTheme = () => {
      const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
      setTheme(currentTheme);
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

  return (
    <BrowserOnly>
      {() => {
        let fillColor = theme === 'dark' ? darkBgColor : lightBgColor;
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
      }}
    </BrowserOnly>
  );
};

export default DiagonalDivider;
