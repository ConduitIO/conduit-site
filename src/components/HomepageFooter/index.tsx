import React from 'react';

import {useThemeConfig} from '@docusaurus/theme-common';
import FooterLinks from '@theme/Footer/Links';
import FooterLogo from '@theme/Footer/Logo';
import FooterCopyright from '@theme/Footer/Copyright';
import FooterLayout from '@theme/Footer/Layout';

function Footer(): React.ReactElement | null {
  const {footer} = useThemeConfig();
  if (!footer) {
    return null;
  }
  const {copyright, links, logo} = footer;

  return (
    <FooterLayout
      style="light" // hardcoded to be light
      links={links && links.length > 0 && <FooterLinks links={links} />}
      logo={logo && <FooterLogo logo={logo} />}
      copyright={copyright && <FooterCopyright copyright={copyright} />}
    />
  );
}

export default React.memo(Footer);