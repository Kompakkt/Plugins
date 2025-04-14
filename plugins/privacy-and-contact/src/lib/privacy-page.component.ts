import { Component } from '@angular/core';
import { createExtenderComponent } from '@kompakkt/extender';
import { TranslatePipe } from './translate.pipe';

@Component({
  templateUrl: './privacy-page.component.html',
  imports: [TranslatePipe],
})
export class PrivacyPageComponent extends createExtenderComponent() {}
