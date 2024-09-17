import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from './i18n.service';

@Pipe({
  name: 'translate',
  pure: false,
  standalone: true,
})
export class TranslatePipe implements PipeTransform {
  #translateService = inject(TranslateService);

  transform(key: string): string {
    return this.#translateService.getTranslatedKey(key);
  }
}
