/*
'app-autocomplete-option': AutocompleteOptionComponent,
It holds a optionItem which gets displayed by the template.
It is used by the AutocompleteComponent.
*/

import { Component, Input, OnInit } from '@angular/core';
import { IWikibaseItem } from '../../common/interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-autocomplete-option',
  templateUrl: './autocomplete-option.component.html',
  styleUrls: ['./autocomplete-option.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class AutocompleteOptionComponent implements OnInit {
  @Input()
  public optionItem: IWikibaseItem | undefined = undefined;

  constructor() {}

  ngOnInit(): void {}
}