# Semantic Kompakkt

**Semantic Kompakkt** is a plugin for [Kompakkt](https://kompakkt.de) that brings linked open data (LOD) metadata to the Kompakkt Viewer and Repo applications. It is published as `@kompakkt/plugin-semantic-kompakkt-metadata`.

It extends Kompakkt's entities and annotations with references to [Wikibase](https://wikiba.se/) items, so 3D models and other media can be described, annotated, and linked to controlled vocabularies in a structured, queryable way.

## Features

**Viewer**

- `Open in Wikibase` button on annotation previews, linking an annotation to its Wikibase item.
- Related content section on annotations, showing linked Wikibase items (concepts, media, agents, licenses).
- Add related content while editing an annotation.

**Repo**

- Metadata wizard for creating and editing semantic metadata for entities (persons, institutions, addresses).
- Finalize step of the entity wizard, reviewing the collected metadata.
- Entity detail views rendering the linked Wikibase metadata.

## Requirements

The plugin requires a Kompakkt backend instance that provides the Semantic Kompakkt services (the `wikibase/*` endpoints used by the `ContentProviderService`), i.e. a backend connected to a Wikibase instance. The corresponding server-side plugin can be found in the [Kompakkt Server repository](https://github.com/Kompakkt/Server/tree/main/src/plugins/wikibase).

## Installation

The plugin is registered like any other Extender plugin, see the [Extender README](../../extender/README.md) for details.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideExtender } from '@kompakkt/extender';
import { SemanticKompakktMetadataPlugin } from '@kompakkt/plugin-semantic-kompakkt-metadata';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExtender({
      plugins: [new SemanticKompakktMetadataPlugin()],
      componentSet: 'repoComponents', // or 'viewerComponents'
    }),
  ],
};
```

## Origin

The Semantic Kompakkt functionality was originally developed as part of the [Semantic Kompakkt project](https://gitlab.com/nfdi4culture/semantic-kompakkt), a fork of the main Kompakkt codebase. It has since been extracted from that codebase into this standalone plugin, making it available to any Kompakkt instance through the Extender plugin system.

## More information

- [Semantic Kompakkt on NFDI4Culture](https://nfdi4culture.de/services/details/semantic-kompakkt.html)
- [Public Semantic Kompakkt instance](https://semantic-kompakkt.de)
- [Semantic Kompakkt repository](https://gitlab.com/nfdi4culture/semantic-kompakkt)
