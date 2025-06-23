import { Pipe, PipeTransform } from '@angular/core';
import { getWikibaseItemID, IWikibaseItem } from '../common/wikibase.common';

type AddressData = { address?: string; instance?: string };
const isAddressData = (data: any): data is AddressData => {
  return data && typeof data === 'object' && ('address' in data || 'instance' in data);
};

export const getWikibaseItemAddress = (
  item: IWikibaseItem | string,
  addressData?: AddressData,
): string => {
  const id = getWikibaseItemID(item);

  if (isAddressData(addressData)) {
    if (addressData?.address) {
      return `${addressData.address}/wiki/Item:${id}`;
    }
    if (addressData?.instance) {
      return `${addressData.instance}/wiki/Item:${id}`;
    }
  }
  return `/wiki/Item:${id}`;
};

@Pipe({
  name: 'wikibaseItemAddress',
  standalone: true,
})
export class GetWikibaseItemAddressPipe implements PipeTransform {
  public transform(item: IWikibaseItem | string, addressData?: AddressData): string {
    return getWikibaseItemAddress(item, addressData);
  }
}
