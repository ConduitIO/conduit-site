import React, { useEffect, useState } from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

const ThemedImage = ({ id, darkImage, lightImage, altText, className }) => {
  const [theme, setTheme] = useState('light'); // Default to light theme

  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
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
    }
  }, []);

  return (
    <div id={id} className={className}>
      {theme === 'dark' ? (
        <img src={darkImage} alt={`${altText} in dark theme`} />
      ) : (
        <img src={lightImage} alt={`${altText} in light theme`} />
      )}
    </div>
  );
};

export default ThemedImage;
