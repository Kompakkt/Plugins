import { Component } from '@angular/core';
import { createExtenderComponent } from '@kompakkt/extender';
import { TranslatePipe } from './translate.pipe';

@Component({
  templateUrl: './contact-page.component.html',
  imports: [TranslatePipe],
})
export class ContactPageComponent extends createExtenderComponent() {}
