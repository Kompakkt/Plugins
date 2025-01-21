import { Component, input } from '@angular/core';

import { AsyncPipe, CommonModule } from '@angular/common';
import { IMediaAgent } from '../../../../common/wikibase.common';
import { GetLabelPipe } from '../../../get-label.pipe';

@Component({
  selector: 'app-detail-person',
  templateUrl: './detail-person.component.html',
  styleUrls: ['../../../theme.scss', './detail-person.component.scss'],
  standalone: true,
  imports: [AsyncPipe, CommonModule, GetLabelPipe],
})
export class DetailPersonComponent {
  person = input.required<IMediaAgent>();
}
