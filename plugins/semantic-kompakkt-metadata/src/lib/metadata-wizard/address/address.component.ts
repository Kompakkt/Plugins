import { Component, Input } from '@angular/core';
import { Address } from '../metadata';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['../../theme.scss','./address.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInputModule],
})
export class AddressComponent {
  @Input('address')
  public address!: Address;

  @Input('required')
  public required = true;
}
