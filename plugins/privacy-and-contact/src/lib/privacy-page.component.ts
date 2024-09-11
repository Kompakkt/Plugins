import { Component } from "@angular/core";
import { createExtenderComponent } from "@kompakkt/extender";
import { TranslatePipe } from '@kompakkt/plugin-i18n';

@Component({
  standalone: true,
  templateUrl: "./privacy-page.component.html",
  imports: [TranslatePipe],
})
export class PrivacyPageComponent extends createExtenderComponent() {}
