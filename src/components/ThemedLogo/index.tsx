import React, { useEffect, useState } from 'react';

const ThemedLogo = () => {
  const [theme, setTheme] = useState('light');

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


  return (
    <div id="conduit-logo">
      {theme === 'dark' ? (
        <img src="/img/logos/conduit-logo-dark.svg" alt="Dark Theme Image" />
      ) : (
        <img src="/img/logos/conduit-logo-light.svg" alt="Light Theme Image" />
      )}
    </div>
  );
};

export default ThemedLogo;
