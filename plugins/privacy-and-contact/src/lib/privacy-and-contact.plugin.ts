import { createExtenderPlugin } from "@kompakkt/extender";
import { PrivacyPageComponent } from "./privacy-page.component";
import { ContactPageComponent } from "./contact-page.component";

export class PrivacyAndContactPlugin extends createExtenderPlugin({
  name: "Privacy and Contact Plugin",
  description: "Provides Privacy and Contact pages",
  version: "0.0.1",
  tokenName: "PrivacyAndContactPlugin",
  viewerComponents: {},
  repoComponents: {
    "privacy-page": [PrivacyPageComponent],
    "contact-page": [ContactPageComponent],
  },
}) {
  // Custom logic
}
