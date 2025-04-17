import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IMediaAgent } from '../../../../common/wikibase.common';
import { GetLabelPipe } from '../../../get-label.pipe';

@Component({
  selector: 'app-detail-person',
  templateUrl: './detail-person.component.html',
  styleUrls: ['../../../theme.scss', './detail-person.component.scss'],
  imports: [CommonModule, GetLabelPipe],
})
export class DetailPersonComponent {
  person = input.required<IMediaAgent>();
}
