import { Component } from "@angular/core";
import { createExtenderComponent } from "@kompakkt/extender";

@Component({
  standalone: true,
  template: `Privacy and contact page`,
})
export class ContactPageComponent extends createExtenderComponent() {}
