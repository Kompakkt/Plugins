import { Component, ChangeDetectionStrategy } from '@angular/core';
import { createExtenderComponent } from '@kompakkt/plugins/extender';
import { TranslatePipe } from './translate.pipe';

@Component({
  templateUrl: './privacy-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TranslatePipe],
})
export class PrivacyPageComponent extends createExtenderComponent() {}
