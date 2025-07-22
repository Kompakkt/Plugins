import { inject, Pipe, PipeTransform } from '@angular/core';
import { getWikibaseItemID, IWikibaseItem } from '../common/wikibase.common';
import { ContentProviderService, InstanceInfo } from './content-provider.service';

type AddressData = { address?: string; instance?: string };
const isAddressData = (data: any): data is AddressData => {
  return data && typeof data === 'object' && ('address' in data || 'instance' in data);
};

export const getWikibaseItemAddress = (
  item: IWikibaseItem | string,
  addressData?: AddressData,
  instanceInfo?: InstanceInfo,
): string => {
  const id = getWikibaseItemID(item);

  let url = (() => {
    if (isAddressData(addressData)) {
      if (addressData?.address) {
        return `${addressData.address}/wiki/Item:${id}`;
      }
      if (addressData?.instance) {
        return `${addressData.instance}/wiki/Item:${id}`;
      }
    } else if (instanceInfo?.instance) {
      return `${instanceInfo.instance}/wiki/Item:${id}`;
    }
    return `/wiki/Item:${id}`;
  })();

  // There might be double // after the domain name
  if (url.startsWith('http') && url.indexOf('//', 8)) {
    url = url.replaceAll('//', '/');
    url = url.replace('http:/', 'http://').replace('https:/', 'https://');
  }

  return url;
};

@Pipe({
  name: 'wikibaseItemAddress',
  standalone: true,
})
export class GetWikibaseItemAddressPipe implements PipeTransform {
  public transform(
    item: IWikibaseItem | string,
    addressData?: AddressData,
    instanceInfo?: InstanceInfo,
  ): string {
    return getWikibaseItemAddress(item, addressData, instanceInfo);
  }
}
