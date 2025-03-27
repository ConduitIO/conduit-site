import React, { useEffect, useState } from 'react';

const PipelineRecovery = () => {
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
    <div id="pipeline-recovery">
      {theme === 'dark' ? (
        <img src="/img/pipeline-recovery-dark.png" alt="Pipeline recovery in dark theme" />
      ) : (
        <img src="/img/pipeline-recovery.png" alt="Pipeline recovery in light theme" />
      )}
    </div>
  );
};

export default PipelineRecovery;
