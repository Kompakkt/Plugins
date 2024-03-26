# HelloWorldPlugin

Example plugin showcasing the usage of the [Kompakkt Extender](https://github.com/Kompakkt/Extender) plugin system.

## Usage

To use this plugin, simply import it in your `provideExtender`-method of `@kompakkt/extender`:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideExtender } from '@kompakkt/extender';
import { HelloWorldPlugin } from "@kompakkt/hello-world-plugin";

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideExtender({
        plugins: [new HelloWorldPlugin()],
        componentSet: 'repoComponents',
    }),
  ]
}
```

Then, use it in a `ExtenderSlotDirective` in your component template

```html
<div extendSlot="hello-world" [slotData]="{ name: 'Kompakkt' }"></div>
```