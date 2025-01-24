/*
'app-autocomplete-option': AutocompleteOptionComponent,
It holds a optionItem which gets displayed by the template.
It is used by the AutocompleteComponent.
*/

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { IWikibaseItem } from '../../common/wikibase.common';
import { GetLabelPipe } from '../get-label.pipe';

@Component({
    selector: 'app-autocomplete-option',
    templateUrl: './autocomplete-option.component.html',
    styleUrls: ['../theme.scss', './autocomplete-option.component.scss'],
    imports: [CommonModule, GetLabelPipe]
})
export class AutocompleteOptionComponent {
  optionItem = input<IWikibaseItem>();
}
