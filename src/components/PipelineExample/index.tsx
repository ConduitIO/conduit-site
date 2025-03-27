import React, { useEffect, useState } from 'react';

const PipelineExample = () => {
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
    <div id="pipeline-example">
      {theme === 'dark' ? (
        <img src="/img/pipeline-example-dark.svg" alt="Pipeline Example in dark theme" />
      ) : (
        <img src="/img/pipeline-example.svg" alt="Pipeline Example in light theme" />
      )}
    </div>
  );
};

export default PipelineExample;
