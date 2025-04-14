import { Pipe, PipeTransform } from '@angular/core';
import type { IWikibaseLabel } from '../common/wikibase.common';

/**
 * Returns the label of a WikibaseItem.
 * If a locale is given, a label using that locale is preferred,
 * otherwise the english label, or the first available label is returned.
 * @param item
 * @param locale
 * @returns
 */
export const getLabel = (item?: { label: IWikibaseLabel } | string, locale?: string) => {
  // console.log('getLabel', item);
  if (!item) {
    return 'No label';
  }
  if (typeof item === 'string') {
    return item;
  }
  if (typeof item.label === 'string') {
    return item.label;
  }
  const locales = Object.keys(item.label);
  if (locales.length === 0) {
    return 'No label';
  }
  if (locale && Object.hasOwn(item.label, locale)) {
    return Array.isArray(item.label[locale]) ? item.label[locale].join(' – ') : item.label[locale];
  }
  const englishLabel = item.label['en'];
  if (englishLabel) {
    return Array.isArray(englishLabel) ? englishLabel.join(' – ') : englishLabel;
  }
  const firstLabel = item.label[locales.at(0)!];
  return Array.isArray(firstLabel) ? firstLabel.join(' – ') : firstLabel;
};

@Pipe({
  name: 'getLabel',
  standalone: true,
})
export class GetLabelPipe implements PipeTransform {
  public transform(value?: string | { label: IWikibaseLabel }, locale?: string): string {
    if (typeof value === 'string') {
      return value;
    }
    return getLabel(value, locale);
  }
}
