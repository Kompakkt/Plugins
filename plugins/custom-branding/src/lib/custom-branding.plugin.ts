import { signal } from '@angular/core';
import { createExtenderPlugin } from '@kompakkt/extender';

type CustomBrandingSettings = Partial<{
  explorePageLogoText: string;
  explorePageLogoTextColor: string;
  copyRightText: string;
  base64Assets: {
    explorePageLogo: string;
    headerLogo: string;
  };
  customBrandColors: {
    primary: string;
    secondary: string;
  };
}>;

export class CustomBrandingPlugin extends createExtenderPlugin({
  name: 'CustomBranding',
  description: 'Custom branding plugin',
  version: '0.0.1',
  tokenName: 'CustomBrandingPlugin',
  viewerComponents: {},
  repoComponents: {},
}) {
  settings = signal<CustomBrandingSettings>({});

  constructor(obj: CustomBrandingSettings) {
    super();
    this.settings.set(obj);
  }
}
