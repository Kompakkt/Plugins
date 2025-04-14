import { Pipe, PipeTransform } from '@angular/core';
import { IWikibaseItem } from '../common/wikibase.common';

type AddressData = { address?: string; instance?: string };
const isAddressData = (data: any): data is AddressData => {
  return data && typeof data === 'object' && ('address' in data || 'instance' in data);
};

export const getWikibaseItemAddress = (item: IWikibaseItem, addressData?: AddressData): string => {
  if (isAddressData(addressData)) {
    if (addressData?.address) {
      return `${addressData.address}/wiki/Item:${item.id}`;
    }
    if (addressData?.instance) {
      return `${addressData.instance}/wiki/Item:${item.id}`;
    }
  }
  return `/wiki/Item:${item.id}`;
};

@Pipe({
  name: 'wikibaseItemAddress',
  standalone: true,
})
export class GetWikibaseItemAddressPipe implements PipeTransform {
  public transform(item: IWikibaseItem, addressData?: AddressData): string {
    return getWikibaseItemAddress(item, addressData);
  }
}
