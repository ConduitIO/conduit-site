import React, { useEffect, useState } from 'react';

const ThemedImage = ({ id, darkImage, lightImage, altText, className }) => {
  const htmlElement = document.documentElement;
  const currentTheme = htmlElement.getAttribute('data-theme');
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
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
