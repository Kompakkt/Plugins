import { createExtenderPlugin } from '@kompakkt/extender';
import { TranslateService } from './i18n.service';

export class TranslatePlugin extends createExtenderPlugin({
  name: 'TranslatePlugin',
  description: 'Adds translation support to Kompakkt using pipes.',
  version: '0.0.1',
  tokenName: 'TranslatePlugin',
  viewerComponents: {},
  repoComponents: {},
  services: {
    TranslateService: TranslateService,
  },
}) {
  // Custom logic
}
