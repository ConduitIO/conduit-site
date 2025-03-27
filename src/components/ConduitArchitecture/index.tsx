import React, { useEffect, useState } from 'react';

const ConduitArchitecture = () => {
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
    <div id="conduit-architecture" className="py-5">
      {theme === 'dark' ? (
        <img src="/img/conduit/conduit-architecture-dark.svg" alt="Conduit Architecture Dark Theme" />
      ) : (
        <img src="/img/conduit/conduit-architecture.svg" alt="Conduit Architecture Light Theme" />
      )}
    </div>
  );
};

export default ConduitArchitecture;
