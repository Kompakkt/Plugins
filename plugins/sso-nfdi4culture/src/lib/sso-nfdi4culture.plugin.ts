import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  createExtenderPlugin,
  createExtenderComponent,
  EXTENDER_BACKEND_SERVICE,
} from '@kompakkt/extender';
import { TranslatePipe } from './translate.pipe';
import { from } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'nfdi4c-logo',
  templateUrl: './nfdi4c-logo.html',
  standalone: true,
  styles: `
    :host {
      display: grid;
      place-items: center;
      height: 100%;
    }

    img {
      display: block;
      max-height: 100%;
      object-fit: contain;
      height: 32px;
      width: auto;
    }
  `,
})
class NFDI4CLogoComponent {}

@Component({
  selector: 'app-entity',
  template: `
    <button
      mat-stroked-button
      type="button"
      (click)="loginWithSAML()"
      [class.disabled]="!isSamlAvailable()"
      [matTooltip]="
        isSamlAvailable() ? '' : ('NFDI4Culture SAML login is currently not available' | translate)
      "
    >
      <div class="label">
        <nfdi4c-logo />
        <span>Login with NFDI4C</span>
      </div>
    </button>
  `,
  styles: `
    button {
      width: 100%;
      div.label {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-auto-rows: 100%;
        gap: 8px;
        align-items: center;
        width: 100%;
      }
      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        border-color: lightgray !important;
      }
    }
  `,
  imports: [CommonModule, MatButtonModule, NFDI4CLogoComponent, TranslatePipe, MatTooltipModule],
})
class SSONFDI4CultureComponent extends createExtenderComponent() {
  waitingForResponse = signal(false);
  #backend = inject(EXTENDER_BACKEND_SERVICE);
  #isSamlAvailable$ = from(
    this.#backend
      .get(`/auth/saml/health`)
      .then(res => !!res)
      .catch(() => false),
  );
  readonly isSamlAvailable = toSignal(this.#isSamlAvailable$);

  constructor() {
    super();
  }

  // TODO: Implement communication about response status to host component
  public async loginWithSAML() {
    const isAvailable = this.isSamlAvailable();
    if (!isAvailable) return;
    try {
      // this.waitingForResponse = true;
      // this.dialogRef.disableClose = true;

      // Call backend to initiate SAML request
      window.location.href = `server/user-management/auth/saml`;
      // const response = await this.account.initiateLoginWithSAML();
      // console.debug(response);
    } catch (error) {
      console.error('Failed to initiate SAML login:', error);
      // this.waitingForResponse = false;
      // this.dialogRef.disableClose = false;
    }
  }
}

export class SSONFDI4CulturePlugin extends createExtenderPlugin({
  name: 'SSO NFDI4Culture',
  description: 'Single Sign-On with NFDI4Culture',
  version: '0.0.1',
  tokenName: 'SSONFDI4CulturePlugin',
  viewerComponents: {},
  repoComponents: {
    'auth-method': [SSONFDI4CultureComponent],
  },
}) {
  // Custom logic
}
