import React, { useEffect, useState } from 'react';

const ThemedLogo = () => {
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
    <div id="conduit-logo">
      {theme === 'dark' ? (
        <img src="/img/logos/conduit-logo-dark.svg" alt="Conduit Logo in dark theme" />
      ) : (
        <img src="/img/logos/conduit-logo-light.svg" alt="Conduit Logo in light theme" />
      )}
    </div>
  );
};

export default ThemedLogo;
