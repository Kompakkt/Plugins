import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import {
  createExtenderPlugin,
  createExtenderComponent,
  EXTENDER_BACKEND_SERVICE,
} from '@kompakkt/plugins/extender';
import { TranslatePipe } from './translate.pipe';
import { from } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-entity',
  template: `
    <button
      mat-stroked-button
      type="button"
      (click)="loginWithOIDC()"
      [class.disabled]="!isOidcAvailable()"
      [matTooltip]="isOidcAvailable() ? '' : ('OIDC login is currently not available' | translate)"
    >
      <div class="label">
        <mat-icon>login</mat-icon>
        <span>{{ 'Login with OIDC' | translate }}</span>
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
  imports: [CommonModule, MatButtonModule, TranslatePipe, MatTooltipModule, MatIconModule],
})
class OIDCComponent extends createExtenderComponent() {
  waitingForResponse = signal(false);
  #backend = inject(EXTENDER_BACKEND_SERVICE);
  #isOidcAvailable$ = from(
    this.#backend
      .get(`oidc/health`)
      .then(res => !!res)
      .catch(() => false),
  );
  readonly isOidcAvailable = toSignal(this.#isOidcAvailable$);

  constructor() {
    console.log('OIDCComponent constructor');
    super();
  }

  public async loginWithOIDC() {
    const isAvailable = this.isOidcAvailable();
    if (!isAvailable) return;
    try {
      // Redirect to the backend OIDC login endpoint
      window.location.href = `server/oidc/login`;
    } catch (error) {
      console.error('Failed to initiate OIDC login:', error);
    }
  }
}

export class OIDCPlugin extends createExtenderPlugin({
  name: 'OIDC',
  description: 'Single Sign-On with OpenID Connect',
  version: '0.0.1',
  tokenName: 'OIDCPlugin',
  viewerComponents: {},
  repoComponents: {
    'auth-method': [OIDCComponent],
  },
}) {}
