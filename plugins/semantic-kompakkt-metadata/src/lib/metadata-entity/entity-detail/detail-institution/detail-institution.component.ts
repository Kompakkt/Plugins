import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { IAddress, IInstitution } from '../../../../common';

const firstKey = (obj: any) => Object.keys(obj)[0] ?? '';

@Component({
  selector: 'app-detail-institution',
  templateUrl: './detail-institution.component.html',
  styleUrls: ['../../../theme.scss', './detail-institution.component.scss'],
  imports: [CommonModule, MatChipsModule],
})
export class DetailInstitutionComponent {
  institution = input.required<IInstitution>();
  roles = computed(() => {
    const institution = this.institution();
    return (
      institution.roles[firstKey(institution.roles)]?.map(role =>
        role.split('_').join(' ').toLowerCase(),
      ) ?? []
    );
  });
  note = computed(() => {
    const institution = this.institution();
    return institution.notes[firstKey(institution.notes)];
  });
  address = computed(() => {
    const institution = this.institution();
    return institution.addresses[firstKey(institution.addresses)] as IAddress | undefined;
  });
}
