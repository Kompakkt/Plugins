import { Component, ChangeDetectionStrategy } from '@angular/core';
import { createExtenderComponent } from '@kompakkt/plugins/extender';
import { TranslatePipe } from './translate.pipe';

@Component({
  templateUrl: './contact-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TranslatePipe],
})
export class ContactPageComponent extends createExtenderComponent() {}
