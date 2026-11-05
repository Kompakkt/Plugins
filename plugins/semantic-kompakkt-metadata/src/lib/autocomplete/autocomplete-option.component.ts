import { Component, input } from '@angular/core';
import { IWikibaseItem } from '../../common/wikibase.common';
import { GetLabelPipe } from '../get-label.pipe';

@Component({
  selector: 'app-autocomplete-option',
  templateUrl: './autocomplete-option.component.html',
  styleUrls: ['../theme.scss', './autocomplete-option.component.scss'],
  imports: [GetLabelPipe],
})
export class AutocompleteOptionComponent {
  optionItem = input.required<IWikibaseItem>();
}
