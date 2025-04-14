import { inject, Pipe, PipeTransform } from '@angular/core';
import { EXTENDER_TRANSLATE_PIPE } from '@kompakkt/extender';

@Pipe({
  name: 'translate',
  pure: false,
  standalone: true,
})
export class TranslatePipe implements PipeTransform {
  #extendedPipe = inject(EXTENDER_TRANSLATE_PIPE);

  transform(key: string): string {
    return this.#extendedPipe.transform(key);
  }
}
