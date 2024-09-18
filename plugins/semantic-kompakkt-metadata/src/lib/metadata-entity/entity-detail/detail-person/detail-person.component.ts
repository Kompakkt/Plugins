import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { map, filter } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

import { IMediaAgent, IContact, IInstitution } from  '../../../../common';
import { AsyncPipe, CommonModule } from '@angular/common';

const firstKey = (obj: any) => Object.keys(obj)[0] ?? '';

@Component({
  selector: 'app-detail-person',
  templateUrl: './detail-person.component.html',
  styleUrls: ['../../../theme.scss', './detail-person.component.scss'],
  standalone: true,
  imports: [AsyncPipe, CommonModule],
})
export class DetailPersonComponent implements OnChanges {
  @Input('person')
  public person: IMediaAgent | undefined = undefined;

  private personSubject = new BehaviorSubject(this.person);

  get person$() {
    return this.personSubject.pipe(
      filter(person => !!person),
      map(person => person as IMediaAgent),
    );
  }

  // get contact$() {
  //   return this.person$.pipe(
  //     map(person => person.contact_references[firstKey(person.contact_references)]),
  //     filter(contact => !!contact),
  //     map(contact => contact as IContact),
  //   );
  // }
  //
  // get roles$() {
  //   return this.person$.pipe(
  //     map(person => person.roles[firstKey(person.roles)]),
  //     filter(roleArr => !!roleArr),
  //     map(roleArr => (roleArr as string[]).map(role => role.split('_').join(' ').toLowerCase())),
  //   );
  // }
  //
  // get institutions$() {
  //   return this.person$.pipe(
  //     map(person => person.institutions[firstKey(person.institutions)]),
  //     filter(instArr => !!instArr),
  //     map(instArr => instArr as IInstitution[]),
  //   );
  // }

  ngOnChanges(changes: SimpleChanges): void {
    const person = changes['person']?.currentValue as IMediaAgent | undefined;
    if (person) this.personSubject.next(person);
  }
}
