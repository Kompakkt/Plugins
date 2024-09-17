import { Component, inject, OnInit } from '@angular/core';
import { createExtenderComponent } from '@kompakkt/extender';
import { TranslateService } from './i18n.service';
import { FormControl } from '@angular/forms';
import { KeyValuePipe } from '@angular/common';

@Component({
  templateUrl: './i18n.language-dropdown.component.html',
  styleUrl: './i18n.language-dropdown.component.scss',
  standalone: true,
  imports: [KeyValuePipe],
})
export class LanguageDropdownComponent extends createExtenderComponent() implements OnInit {
  #translateService = inject(TranslateService);

  selectedLanguage = new FormControl<string>('', { nonNullable: true });

  get languages() {
    return this.#translateService.supportedLanguages;
  }

  changeLanguage(event: Event) {
    const target = event.target as HTMLSelectElement;
    const language = target.value;
    this.#translateService.requestLanguage(language);
  }

  ngOnInit(): void {
    this.#translateService.selectedLanguage$.subscribe(language => {
        console.log(language);
      if (language === this.selectedLanguage.value) return;
      this.selectedLanguage.setValue(language);
    });
  }
}
