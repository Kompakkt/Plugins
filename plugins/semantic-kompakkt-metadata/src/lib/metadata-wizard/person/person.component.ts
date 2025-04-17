import { Component, input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatFormField, MatLabel, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ContentProviderService } from '../../content-provider.service';
import { ContactReference, Institution, MediaAgent } from '../metadata';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['../../theme.scss', './person.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatIconModule,
    MatFormField,
    MatLabel,
    MatSelectModule,
    MatAutocompleteModule,
    MatInputModule,
  ],
})
export class PersonComponent implements OnChanges {
  public entityId = input.required<string>();
  public person = input.required<MediaAgent>();

  private isExisting = new BehaviorSubject(false);
  private anyRoleSelected = new BehaviorSubject(false);
  private availableContacts = new BehaviorSubject<ContactReference[]>([]);
  private selectedContact = new BehaviorSubject<ContactReference | undefined>(undefined);

  public availableRoles = [
    { type: 'RIGHTS_OWNER', value: 'Rightsowner', checked: false },
    { type: 'CREATOR', value: 'Creator', checked: false },
    { type: 'EDITOR', value: 'Editor', checked: false },
    { type: 'DATA_CREATOR', value: 'Data Creator', checked: false },
    { type: 'CONTACT_PERSON', value: 'Contact Person', checked: false },
  ];

  public availableInstitutions = new BehaviorSubject<Institution[]>([]);
  public searchInstitution = new FormControl('');
  public filteredInstitutions$: Observable<Institution[]>;

  public Institution = Institution;

  constructor(private content: ContentProviderService) {
    this.content.institutions$.subscribe(insts => {
      this.availableInstitutions.next(insts.map(i => new Institution(i)));
    });

    this.filteredInstitutions$ = this.searchInstitution.valueChanges.pipe(
      startWith(''),
      map(value => (value as string).toLowerCase()),
      map(value =>
        this.availableInstitutions.value.filter(i => i.name.toLowerCase().includes(value)),
      ),
    );
  }

  public async selectInstitution(event: MatAutocompleteSelectedEvent) {
    const institutionId = event.option.value;
    const institution = this.availableInstitutions.value.find(i => i._id === institutionId);
    if (!institution) return console.warn(`Could not find institution with id ${institutionId}`);
    // this.person.addInstitution(institution, this.entityId);
  }

  public addInstitution(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    // this.person.addInstitution(new Institution(), this.entityId);
  }

  public removeInstitution(index: number) {
    // Array.isArray(this.person.institutions[this.entityId])
    //   ? this.person.institutions[this.entityId]?.splice(index, 1)
    //   : console.warn(`Could not remove isntitution at ${index} from ${this.person}`);
  }

  public displayInstitutionName(institution: Institution): string {
    return institution.name;
  }

  get availableContacts$() {
    return this.availableContacts.asObservable();
  }

  get selectedContact$() {
    return this.selectedContact.asObservable();
  }

  get isExisting$() {
    return this.isExisting.asObservable();
  }

  get anyRoleSelected$() {
    return this.anyRoleSelected.asObservable();
  }

  get generalInformationValid() {
    return this.person().title.length > 0;
  }

  get contactValid() {
    return true;
    // return ContactReference.checkIsValid(
    //   this.person.contact_references[this.entityId] ?? new ContactReference(),
    // );
  }

  public selectContact(event: MatSelectChange) {
    const contact =
      event.value === 'empty'
        ? new ContactReference()
        : this.availableContacts.value.find(contact => contact._id === event.value);
    if (!contact) return console.warn('No contact found');
    // this.person.setContactRef(contact, this.entityId);
    this.selectedContact.next(contact);
  }

  public updateRoles() {
    this.anyRoleSelected.next(!!this.availableRoles.find(role => role.checked));
    // this.person.setRoles(
    //   this.availableRoles.filter(role => role.checked).map(role => role.type),
    //   this.entityId,
    // );
  }

  get availableInstitutions$() {
    return this.content.institutions$;
  }

  ngOnChanges(changes: SimpleChanges) {
    // const person = changes.person?.currentValue as Person | undefined;
    // if (person) {
    // this.isExisting.next(person.title.trim().length > 0);
    // Patch existing roles into role object
    // for (const role of this.person.roles[this.entityId] ?? []) {
    //   for (const roleOption of this.availableRoles) {
    //     if (roleOption.type === role) roleOption.checked = true;
    //   }
    // }
    // this.updateRoles();
    // Patch existing addresses to address selection and input
    // this.availableContacts.next(Person.getValidContactRefs(person));
    // const mostRecentContact = Person.getMostRecentContactRef(person);
    // this.person.setContactRef(mostRecentContact, this.entityId);
    // this.selectedContact.next(mostRecentContact);
    // Patch existing related institutions
    // }
  }
}
