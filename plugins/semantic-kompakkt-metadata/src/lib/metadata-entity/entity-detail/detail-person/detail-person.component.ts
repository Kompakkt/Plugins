import { Component, input } from '@angular/core';

import { IMediaAgent } from '../../../../common/wikibase.common';
import { GetLabelPipe } from '../../../get-label.pipe';

@Component({
  selector: 'app-detail-person',
  templateUrl: './detail-person.component.html',
  styleUrls: ['../../../theme.scss', './detail-person.component.scss'],
  imports: [GetLabelPipe],
})
export class DetailPersonComponent {
  person = input.required<IMediaAgent>();
}
