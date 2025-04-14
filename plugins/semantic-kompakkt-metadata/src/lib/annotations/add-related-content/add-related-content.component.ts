import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { createExtenderComponent } from '@kompakkt/extender';
import {
  AutocompleteComponent,
  ButtonComponent,
  ButtonRowComponent,
  InputComponent,
} from 'komponents';
import { combineLatestWith, firstValueFrom, interval, map, startWith, switchMap } from 'rxjs';
import { IAnnotation, isAnnotation } from '../../../common';
import { IWikibaseAnnotationExtension, IWikibaseItem } from '../../../common/wikibase.common';
import { ContentProviderService } from '../../content-provider.service';
import { WikibaseItemCardComponent } from '../wikibase-item-card/wikibase-item-card.component';
import { TranslatePipe } from '../../translate.pipe';

const searchWikibaseItem = (query: string, item: IWikibaseItem) => {
  return (item.label['en'] + item.description).toLowerCase().includes(query);
};

@Component({
  selector: 'lib-add-related-content',
  imports: [
    InputComponent,
    AutocompleteComponent,
    AsyncPipe,
    MatIconModule,
    ButtonComponent,
    ButtonRowComponent,
    TranslatePipe,
    WikibaseItemCardComponent,
  ],
  templateUrl: './add-related-content.component.html',
  styleUrl: './add-related-content.component.scss',
})
export class AddRelatedContentComponent extends createExtenderComponent() {
  annotation$ = this.dataSubject.pipe(
    map(data => {
      if (!isAnnotation(data)) return;
      return data as IAnnotation<IWikibaseAnnotationExtension>;
    }),
  );

  relatedMediaUrls$ = this.annotation$.pipe(
    map(
      annotation =>
        [
          ...(annotation?.extensions?.wikibase?.mediaUrls ?? []),
          ...(annotation?.body?.content?.['relatedMediaUrls'] ?? []),
        ] as string[],
    ),
  );

  relatedMedia$ = this.annotation$.pipe(
    map(
      annotation =>
        [
          ...(annotation?.extensions?.wikibase?.media ?? []),
          ...(annotation?.body?.content?.['relatedMedia'] ?? []),
        ] as IWikibaseItem[],
    ),
  );

  relatedConcepts$ = this.annotation$.pipe(
    map(
      annotation =>
        [
          ...(annotation?.extensions?.wikibase?.entities ?? []),
          ...(annotation?.body?.content?.['relatedEntities'] ?? []),
        ] as IWikibaseItem[],
    ),
  );

  relatedAgents$ = this.annotation$.pipe(
    map(
      annotation =>
        [
          ...(annotation?.extensions?.wikibase?.authors ?? []),
          ...(annotation?.body?.content?.['relatedAgents'] ?? []),
        ] as IWikibaseItem[],
    ),
  );

  relatedLicenses$ = this.annotation$.pipe(
    map(
      annotation =>
        [
          ...(annotation?.extensions?.wikibase?.licenses ?? []),
          ...(annotation?.body?.content?.['relatedLicenses'] ?? []),
        ] as IWikibaseItem[],
    ),
  );

  searchConcept = new FormControl<string>('', { nonNullable: true });
  searchMedia = new FormControl<string>('', { nonNullable: true });
  searchAgent = new FormControl<string>('', { nonNullable: true });
  searchLicense = new FormControl<string>('', { nonNullable: true });

  #content = inject(ContentProviderService);

  filteredConcepts$ = this.searchConcept.valueChanges.pipe(
    startWith(''),
    map(value => value.toLowerCase()),
    combineLatestWith(this.#content.concepts$),
    map(([term, concepts]) => concepts.filter(concept => searchWikibaseItem(term, concept))),
  );

  filteredMedia$ = this.searchMedia.valueChanges.pipe(
    startWith(''),
    map(value => value.toLowerCase()),
    combineLatestWith(this.#content.media$),
    map(([term, media]) => media.filter(media => searchWikibaseItem(term, media))),
  );

  filteredAgents$ = this.searchAgent.valueChanges.pipe(
    startWith(''),
    map(value => value.toLowerCase()),
    combineLatestWith(this.#content.agents$),
    map(([term, agents]) => agents.filter(agent => searchWikibaseItem(term, agent))),
  );

  filteredLicenses$ = this.searchLicense.valueChanges.pipe(
    startWith(''),
    map(value => value.toLowerCase()),
    combineLatestWith(this.#content.licenses$),
    map(([term, licenses]) => licenses.filter(license => searchWikibaseItem(term, license))),
  );

  async addConcept(concept: IWikibaseItem, input: InputComponent) {
    input.value.set('');
    const annotation = await firstValueFrom(this.annotation$);
    console.log(concept, input, annotation);
    if (!annotation) return;
    annotation.extensions?.wikibase?.entities?.push(concept);
    this.event.emit(new CustomEvent('annotation-add-concept', { detail: annotation }));
  }

  async addMedia(media: IWikibaseItem, input: InputComponent) {
    input.value.set('');
    const annotation = await firstValueFrom(this.annotation$);
    console.log(media, input, annotation);
    if (!annotation) return;
    annotation.extensions?.wikibase?.media?.push(media);
    this.event.emit(new CustomEvent('annotation-add-media', { detail: annotation }));
  }

  async addAgent(agent: IWikibaseItem, input: InputComponent) {
    input.value.set('');
    const annotation = await firstValueFrom(this.annotation$);
    console.log(agent, input, annotation);
    if (!annotation) return;
    annotation.extensions?.wikibase?.authors?.push(agent);
    this.event.emit(new CustomEvent('annotation-add-agent', { detail: annotation }));
  }

  async addLicense(license: IWikibaseItem, input: InputComponent) {
    input.value.set('');
    const annotation = await firstValueFrom(this.annotation$);
    console.log(license, input, annotation);
    if (!annotation) return;
    annotation.extensions?.wikibase?.licenses?.push(license);
    this.event.emit(new CustomEvent('annotation-add-license', { detail: annotation }));
  }

  async remove(item: IWikibaseItem, type: 'concept' | 'media' | 'agent' | 'license') {
    const annotation = await firstValueFrom(this.annotation$);
    if (!annotation) return;
    switch (type) {
      case 'concept': {
        const index = annotation.extensions?.wikibase?.entities?.indexOf(item) ?? -1;
        if (index !== -1) {
          annotation.extensions?.wikibase?.entities?.splice(index, 1);
        }
        break;
      }
      case 'media': {
        const index = annotation.extensions?.wikibase?.media?.indexOf(item) ?? -1;
        if (index !== -1) {
          annotation.extensions?.wikibase?.media?.splice(index, 1);
        }
        break;
      }
      case 'agent': {
        const index = annotation.extensions?.wikibase?.authors?.indexOf(item) ?? -1;
        if (index !== -1) {
          annotation.extensions?.wikibase?.authors?.splice(index, 1);
        }
        break;
      }
      case 'license': {
        const index = annotation.extensions?.wikibase?.licenses?.indexOf(item) ?? -1;
        if (index !== -1) {
          annotation.extensions?.wikibase?.licenses?.splice(index, 1);
        }
        break;
      }
    }
    this.event.emit(new CustomEvent('annotation-remove', { detail: annotation }));
  }
}
