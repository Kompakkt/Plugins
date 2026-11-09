import { Component, computed, inject, model, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { createExtenderComponent } from '@kompakkt/plugins/extender';
import {
  AutocompleteComponent,
  ButtonComponent,
  ButtonRowComponent,
  InputComponent,
} from '@kompakkt/komponents';
import { isAnnotation } from '@kompakkt/common';
import { IWikibaseItem, WikibaseExtendedAnnotation } from '../../../common/wikibase.common';
import { ContentProviderService } from '../../content-provider.service';
import { WikibaseItemCardComponent } from '../wikibase-item-card/wikibase-item-card.component';
import { TranslatePipe } from '../../translate.pipe';
import { form } from '@angular/forms/signals';

const searchWikibaseItem = (query: string, item: IWikibaseItem) => {
  return (item.label['en'] + item.description).toLowerCase().includes(query);
};

@Component({
  selector: 'lib-add-related-content',
  imports: [
    InputComponent,
    AutocompleteComponent,
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
  annotationModel = model<WikibaseExtendedAnnotation | undefined>();
  annotationForm = form(this.annotationModel);

  _dataChangedEffectRef = effect(() => {
    const value = this.dataSignal();
    if (!isAnnotation(value))
      return console.warn('Annotation does not suffice as annotation', value);
    const extendedAnnotation = structuredClone(value) as WikibaseExtendedAnnotation;
    extendedAnnotation.extensions ??= {};
    extendedAnnotation.extensions.wikibase ??= {};
    this.annotationModel.set(extendedAnnotation);
  });

  relatedMediaUrls = computed(() => {
    const annotation = this.annotationForm().value();
    return [
      ...(annotation?.extensions?.wikibase?.mediaUrls ?? []),
      // @ts-ignore - this is for backward compatibility, we should remove it in the future
      ...((annotation?.body?.content?.['relatedMediaUrls'] ?? []) as string[]),
    ];
  });

  relatedMedia = computed(() => {
    const annotation = this.annotationForm().value();
    return [
      ...(annotation?.extensions?.wikibase?.media ?? []),
      // @ts-ignore - this is for backward compatibility, we should remove it in the future
      ...((annotation?.body?.content?.['relatedMedia'] ?? []) as IWikibaseItem[]),
    ];
  });

  relatedConcepts = computed(() => {
    const annotation = this.annotationForm().value();
    return [
      ...(annotation?.extensions?.wikibase?.entities ?? []),
      // @ts-ignore - this is for backward compatibility, we should remove it in the future
      ...((annotation?.body?.content?.['relatedEntities'] ?? []) as IWikibaseItem[]),
    ];
  });

  relatedAgents = computed(() => {
    const annotation = this.annotationForm().value();
    return [
      ...(annotation?.extensions?.wikibase?.authors ?? []),
      // @ts-ignore - this is for backward compatibility, we should remove it in the future
      ...((annotation?.body?.content?.['relatedAgents'] ?? []) as IWikibaseItem[]),
    ];
  });

  relatedLicenses = computed(() => {
    const annotation = this.annotationForm().value();
    return [
      ...(annotation?.extensions?.wikibase?.licenses ?? []),
      // @ts-ignore - this is for backward compatibility, we should remove it in the future
      ...((annotation?.body?.content?.['relatedLicenses'] ?? []) as IWikibaseItem[]),
    ];
  });

  searchModel = model({ concept: '', media: '', agent: '', licence: '' });
  searchForm = form(this.searchModel);

  #content = inject(ContentProviderService);

  filteredConcepts = computed(() => {
    const search = this.searchForm.concept().value().trim().toLowerCase();
    const arr = this.#content.concepts();
    return arr.filter(v => searchWikibaseItem(search, v));
  });
  filteredMedia = computed(() => {
    const search = this.searchForm.media().value().trim().toLowerCase();
    const arr = this.#content.media();
    return arr.filter(v => searchWikibaseItem(search, v));
  });
  filteredAgents = computed(() => {
    const search = this.searchForm.agent().value().trim().toLowerCase();
    const arr = this.#content.agents();
    return arr.filter(v => searchWikibaseItem(search, v));
  });
  filteredLicences = computed(() => {
    const search = this.searchForm.licence().value().trim().toLowerCase();
    const arr = this.#content.licenses();
    return arr.filter(v => searchWikibaseItem(search, v));
  });

  constructor() {
    super();
    effect(() => {
      const annotation = this.annotationForm().value();
      if (!annotation) return;
      this.event.emit(new CustomEvent('annotation-changed', { detail: annotation }));
    });
  }

  addConcept(concept: IWikibaseItem, input: InputComponent) {
    this.annotationForm().value.update(annotation => {
      if (!annotation) return annotation;
      input.value.set('');
      const clone = structuredClone(annotation);
      if (clone.extensions.wikibase) {
        clone.extensions.wikibase.entities ??= [];
        clone.extensions.wikibase.entities.push(concept);
        this.event.emit(new CustomEvent('annotation-add-concept', { detail: clone }));
      }
      return clone;
    });
  }

  addMedia(media: IWikibaseItem, input: InputComponent) {
    this.annotationForm().value.update(annotation => {
      if (!annotation) return annotation;
      input.value.set('');
      const clone = structuredClone(annotation);
      if (clone.extensions.wikibase) {
        clone.extensions.wikibase.media ??= [];
        clone.extensions.wikibase.media.push(media);
        this.event.emit(new CustomEvent('annotation-add-media', { detail: clone }));
      }
      return clone;
    });
  }

  addAgent(agent: IWikibaseItem, input: InputComponent) {
    this.annotationForm().value.update(annotation => {
      if (!annotation) return annotation;
      input.value.set('');
      const clone = structuredClone(annotation);
      if (clone.extensions.wikibase) {
        clone.extensions.wikibase.authors ??= [];
        clone.extensions.wikibase.authors.push(agent);
        this.event.emit(new CustomEvent('annotation-add-agent', { detail: clone }));
      }
      return clone;
    });
  }

  addLicense(license: IWikibaseItem, input: InputComponent) {
    this.annotationForm().value.update(annotation => {
      if (!annotation) return annotation;
      input.value.set('');
      const clone = structuredClone(annotation);
      if (clone.extensions.wikibase) {
        clone.extensions.wikibase.licenses ??= [];
        clone.extensions.wikibase.licenses.push(license);
        this.event.emit(new CustomEvent('annotation-add-license', { detail: clone }));
      }
      return clone;
    });
  }

  remove(item: IWikibaseItem, type: 'concept' | 'media' | 'agent' | 'license') {
    this.annotationForm().value.update(annotation => {
      if (!annotation) return annotation;
      const clone = structuredClone(annotation);
      if (clone.extensions.wikibase) {
        switch (type) {
          case 'concept': {
            const index = clone.extensions.wikibase.entities?.indexOf(item) ?? -1;
            if (index !== -1) clone.extensions.wikibase.entities?.splice(index, 1);
            break;
          }
          case 'media': {
            const index = clone.extensions.wikibase.media?.indexOf(item) ?? -1;
            if (index !== -1) clone.extensions.wikibase.media?.splice(index, 1);
            break;
          }
          case 'agent': {
            const index = clone.extensions.wikibase.authors?.indexOf(item) ?? -1;
            if (index !== -1) clone.extensions.wikibase.authors?.splice(index, 1);
            break;
          }
          case 'license': {
            const index = clone.extensions.wikibase.licenses?.indexOf(item) ?? -1;
            if (index !== -1) clone.extensions.wikibase.licenses?.splice(index, 1);
            break;
          }
        }
        this.event.emit(new CustomEvent('annotation-remove', { detail: annotation }));
      }
      return clone;
    });

    const annotation = this.annotationForm().value();
    if (!annotation) return;
  }
}
