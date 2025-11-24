import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormField, MatLabel, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { AddressComponent } from '../address/address.component';
import { Address, Institution } from '../metadata';

@Component({
    selector: 'app-institution',
    templateUrl: './institution.component.html',
    styleUrls: ['../../theme.scss', './institution.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatSelectModule,
        MatAccordion,
        MatExpansionModule,
        MatIcon,
        AddressComponent,
        MatInputModule,
    ]
})
export class InstitutionComponent {
  public entityId = input.required<string>();
  public institution = input.required<Institution>();

  isAddressValid = computed(() => {
    const institution = this.institution();
    const entityId = this.entityId();
    return Address.checkIsValid(institution.addresses[entityId] ?? new Address());
  });

  generalInformationValid = computed(() => {
    const institution = this.institution();
    return institution.name.length > 0;
  });

  isExisting = computed(() => {
    const institution = this.institution();
    return institution.name.length > 0;
  });

  availableAddresses = computed(() => {
    const institution = this.institution();
    return Institution.getValidAddresses(institution);
  });

  anyRoleSelected = signal(false);
  selectedAddress = signal<Address | undefined>(undefined);

  public availableRoles = [
    { type: 'RIGHTS_OWNER', value: 'Rights Owner', checked: false },
    { type: 'CREATOR', value: 'Creator', checked: false },
    { type: 'EDITOR', value: 'Editor', checked: false },
    { type: 'DATA_CREATOR', value: 'Data Creator', checked: false },
    { type: 'CONTACT_PERSON', value: 'Contact Person', checked: false },
  ];

  public selectAddress(event: MatSelectChange) {
    const address =
      event.value === 'empty'
        ? new Address()
        : this.availableAddresses().find(addr => addr._id === event.value);
    if (!address) return console.warn('No address found');
    this.institution().setAddress(address, this.entityId());
    this.selectedAddress.set(address);
  }

  public updateRoles() {
    this.anyRoleSelected.set(!!this.availableRoles.find(role => role.checked));
    this.institution().setRoles(
      this.availableRoles.filter(role => role.checked).map(role => role.type),
      this.entityId(),
    );
  }

  constructor() {
    effect(() => {
      const institution = this.institution();
      // Patch existing roles into role object
      for (const role of this.institution().roles[this.entityId()] ?? []) {
        for (const roleOption of this.availableRoles) {
          if (roleOption.type === role) roleOption.checked = true;
        }
      }
      this.updateRoles();

      // Patch existing addresses to address selection and input
      const mostRecentAddress = Institution.getMostRecentAddress(institution);
      this.institution().setAddress(mostRecentAddress, this.entityId());
      this.selectedAddress.set(mostRecentAddress);
    });
  }
}
