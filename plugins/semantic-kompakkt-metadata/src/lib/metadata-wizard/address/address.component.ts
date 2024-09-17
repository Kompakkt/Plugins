import { Component, Input } from '@angular/core';
import { Address } from '../metadata';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormField, MatLabel]
})
export class AddressComponent  {
  @Input('address')
  public address!: Address;

  @Input('required')
  public required = true;
}
