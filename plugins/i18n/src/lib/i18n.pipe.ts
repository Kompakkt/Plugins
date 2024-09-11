import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from './i18n.service';

@Pipe({
  name: 'translate',
  pure: false,
  standalone: true,
})
export class TranslatePipe implements PipeTransform {
  #translateService = inject(TranslateService);
  private static languageChangedListener: any;

  constructor() {
    if (!TranslatePipe.languageChangedListener) {
      TranslatePipe.languageChangedListener = (document as any).addEventListener(
        'language-requested',
        (event: CustomEvent) => {
          console.log('Language requested', event.detail);
          this.#translateService.requestLanguage(event.detail.language);
        },
      );
    }
  }

  transform(key: string): string {
    return this.#translateService.getTranslatedKey(key);
  }
}
